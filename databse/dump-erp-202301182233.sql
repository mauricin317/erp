--
-- PostgreSQL database dump
--

-- Dumped from database version 14.6
-- Dumped by pg_dump version 14.6

-- Started on 2023-01-18 22:33:06

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3507 (class 1262 OID 25875)
-- Name: erp; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE erp WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'Spanish_Bolivia.1252';


ALTER DATABASE erp OWNER TO postgres;

\connect erp

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3508 (class 0 OID 0)
-- Name: erp; Type: DATABASE PROPERTIES; Schema: -; Owner: postgres
--

ALTER DATABASE erp SET "TimeZone" TO 'America/La_Paz';


\connect erp

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 3509 (class 0 OID 0)
-- Dependencies: 3
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 253 (class 1255 OID 42518)
-- Name: articulos_bajo_stock_chart(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.articulos_bajo_stock_chart(id_empresa integer, id_categoria integer, max_cantidad integer) RETURNS TABLE(idarticulo integer, nombre character varying, cantidad integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
	return QUERY
		WITH RECURSIVE cat_hijas AS (
		SELECT c.idcategoria, c.idcategoriapadre, c.nombre
		FROM categoria c
		WHERE c.idcategoria = id_categoria ANd idempresa=id_empresa
		UNION
			SELECT c.idcategoria, c.idcategoriapadre, c.nombre
			FROM categoria c INNER JOIN cat_hijas ch ON ch.idcategoria = c.idcategoriapadre
		) SELECT distinct(a.idarticulo), a.nombre, a.cantidad FROM cat_hijas ch
		left join articulocategoria ac on ch.idcategoria=ac.idcategoria
		left join articulo a on ac.idarticulo=a.idarticulo
		where a.idarticulo is not null and a.cantidad<=max_cantidad
		order by a.cantidad;
END;
$$;


ALTER FUNCTION public.articulos_bajo_stock_chart(id_empresa integer, id_categoria integer, max_cantidad integer) OWNER TO postgres;

--
-- TOC entry 251 (class 1255 OID 42509)
-- Name: detalle_anular_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.detalle_anular_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
	cantidad_a integer;
	stock_l integer;
BEGIN
SELECT cantidad into cantidad_a from articulo where idarticulo=NEW.idarticulo;
SELECT stock into stock_l from lote where idarticulo=NEW.idarticulo AND nrolote=NEW.nrolote;
IF NEW.estado = -1 THEN
EXECUTE 'UPDATE articulo set cantidad=' || (cantidad_a+NEW.cantidad) || ' WHERE idarticulo=$1.idarticulo' USING NEW;
EXECUTE 'UPDATE lote set stock=' || (stock_l+NEW.cantidad) || ',estado=1 WHERE idarticulo=$1.idarticulo AND nrolote=$1.nrolote' USING NEW;
END IF;
RETURN NULL;
END;
$_$;


ALTER FUNCTION public.detalle_anular_trigger() OWNER TO postgres;

--
-- TOC entry 252 (class 1255 OID 42507)
-- Name: detalle_insert_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.detalle_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
Declare  
 cantidad_a integer;
 stock_l integer;
BEGIN
select cantidad into cantidad_a from articulo where idarticulo=NEW.idarticulo;
select stock into stock_l from lote where idarticulo=NEW.idarticulo AND nrolote=NEW.nrolote; 
EXECUTE 'UPDATE articulo set cantidad='|| (cantidad_a-NEW.cantidad) || ' where idarticulo=$1.idarticulo' USING NEW;
	IF (stock_l-NEW.cantidad) = 0 THEN 
		EXECUTE 'UPDATE lote set stock='|| (stock_l-NEW.cantidad) || ', estado=0 where idarticulo=$1.idarticulo and nrolote=$1.nrolote' USING NEW;
  	ELSE
     	EXECUTE 'UPDATE lote set stock='|| (stock_l-NEW.cantidad) || ' where idarticulo=$1.idarticulo and nrolote=$1.nrolote' USING NEW;
	END IF;

RETURN NULL;
END;
$_$;


ALTER FUNCTION public.detalle_insert_trigger() OWNER TO postgres;

--
-- TOC entry 250 (class 1255 OID 34176)
-- Name: generar_cuentas_principales(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generar_cuentas_principales(id_empresa integer, id_usuario integer, niveles_empresa integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
	a_count int;
	b_count int;
	c_count int;
	id_cuenta int;
BEGIN
    INSERT INTO public.cuenta(codigo,nombre,nivel,tipocuenta,idusuario,idempresa,idcuentapadre)
	VALUES(CONCAT('1',REPEAT('.0',niveles_empresa-1)), 'Activo', 1, 0,id_usuario,id_empresa,NULL),
	(CONCAT('2',REPEAT('.0',niveles_empresa-1)), 'Pasivo', 1, 0,id_usuario,id_empresa,NULL),
	(CONCAT('3',REPEAT('.0',niveles_empresa-1)), 'Patrimonio', 1, 0,id_usuario,id_empresa,NULL),
	(CONCAT('4',REPEAT('.0',niveles_empresa-1)), 'Ingresos', 1, 0,id_usuario,id_empresa,NULL);
	GET DIAGNOSTICS a_count = ROW_COUNT;
	INSERT INTO public.cuenta(codigo,nombre,nivel,tipocuenta,idusuario,idempresa,idcuentapadre)
	VALUES(CONCAT('5',REPEAT('.0',niveles_empresa-1)), 'Egresos', 1, 0,id_usuario,id_empresa,NULL)
	RETURNING idcuenta INTO id_cuenta;
	GET DIAGNOSTICS b_count = ROW_COUNT;
	INSERT INTO public.cuenta(codigo,nombre,nivel,tipocuenta,idusuario,idempresa,idcuentapadre)
	VALUES(CONCAT('5.1',REPEAT('.0',niveles_empresa-2)), 'Costos', 2, 0,id_usuario,id_empresa,id_cuenta),
	(CONCAT('5.2',REPEAT('.0',niveles_empresa-2)), 'Gastos', 2, 0,id_usuario,id_empresa,id_cuenta);
	GET DIAGNOSTICS c_count = ROW_COUNT;
	return a_count+b_count+c_count as total;
END;
$$;


ALTER FUNCTION public.generar_cuentas_principales(id_empresa integer, id_usuario integer, niveles_empresa integer) OWNER TO postgres;

--
-- TOC entry 238 (class 1255 OID 42505)
-- Name: lote_anular_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.lote_anular_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
	cantidad_a integer;
BEGIN
SELECT cantidad into cantidad_a from articulo where idarticulo=NEW.idarticulo;
IF NEW.estado = -1 THEN
EXECUTE 'UPDATE articulo set cantidad=' || (cantidad_a-NEW.cantidad) || ' WHERE idarticulo=$1.idarticulo' USING NEW;
END IF;
RETURN NULL;
END;
$_$;


ALTER FUNCTION public.lote_anular_trigger() OWNER TO postgres;

--
-- TOC entry 237 (class 1255 OID 42491)
-- Name: lote_insert_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.lote_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
Declare  
 nrolote integer;
 cantidad_a integer;
BEGIN
select count(*) into nrolote from lote where idarticulo=NEW.idarticulo; 
select cantidad into cantidad_a from articulo where idarticulo=NEW.idarticulo; 
EXECUTE 'UPDATE lote set nrolote='|| nrolote || ' where idarticulo=$1.idarticulo and idnota=$1.idnota' USING NEW;
EXECUTE 'UPDATE articulo set cantidad='|| (cantidad_a+NEW.cantidad) || ' where idarticulo=$1.idarticulo' USING NEW;
RETURN NULL;
END;
$_$;


ALTER FUNCTION public.lote_insert_trigger() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 42386)
-- Name: articulo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articulo (
    idarticulo integer NOT NULL,
    nombre character varying(50),
    descripcion character varying(100),
    cantidad integer,
    precioventa numeric(10,2),
    idempresa integer,
    idusuario integer
);


ALTER TABLE public.articulo OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 42385)
-- Name: articulo_idarticulo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.articulo_idarticulo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.articulo_idarticulo_seq OWNER TO postgres;

--
-- TOC entry 3510 (class 0 OID 0)
-- Dependencies: 227
-- Name: articulo_idarticulo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.articulo_idarticulo_seq OWNED BY public.articulo.idarticulo;


--
-- TOC entry 231 (class 1259 OID 42424)
-- Name: articulocategoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articulocategoria (
    idarticulo integer NOT NULL,
    idcategoria integer NOT NULL
);


ALTER TABLE public.articulocategoria OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 42403)
-- Name: categoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categoria (
    idcategoria integer NOT NULL,
    nombre character varying(50),
    descripcion character varying(100),
    idempresa integer,
    idusuario integer,
    idcategoriapadre integer
);


ALTER TABLE public.categoria OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 42402)
-- Name: categoria_idcategoria_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categoria_idcategoria_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categoria_idcategoria_seq OWNER TO postgres;

--
-- TOC entry 3511 (class 0 OID 0)
-- Dependencies: 229
-- Name: categoria_idcategoria_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categoria_idcategoria_seq OWNED BY public.categoria.idcategoria;


--
-- TOC entry 224 (class 1259 OID 34136)
-- Name: comprobante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comprobante (
    idcomprobante integer NOT NULL,
    serie integer,
    glosa character varying(100),
    fecha date,
    tc numeric(10,2),
    estado smallint DEFAULT 2,
    tipocomprobante smallint,
    idusuario integer,
    idmoneda integer,
    idempresa integer
);


ALTER TABLE public.comprobante OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 34135)
-- Name: comprobante_idcomprobante_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comprobante_idcomprobante_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comprobante_idcomprobante_seq OWNER TO postgres;

--
-- TOC entry 3512 (class 0 OID 0)
-- Dependencies: 223
-- Name: comprobante_idcomprobante_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comprobante_idcomprobante_seq OWNED BY public.comprobante.idcomprobante;


--
-- TOC entry 218 (class 1259 OID 34072)
-- Name: cuenta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuenta (
    idcuenta integer NOT NULL,
    codigo character varying(30),
    nombre character varying(50),
    nivel smallint,
    tipocuenta smallint,
    idusuario integer,
    idempresa integer,
    idcuentapadre integer
);


ALTER TABLE public.cuenta OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 34071)
-- Name: cuenta_idcuenta_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuenta_idcuenta_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cuenta_idcuenta_seq OWNER TO postgres;

--
-- TOC entry 3513 (class 0 OID 0)
-- Dependencies: 217
-- Name: cuenta_idcuenta_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuenta_idcuenta_seq OWNED BY public.cuenta.idcuenta;


--
-- TOC entry 235 (class 1259 OID 42476)
-- Name: detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle (
    idarticulo integer NOT NULL,
    nrolote integer NOT NULL,
    idnota integer NOT NULL,
    cantidad integer,
    precioventa numeric(10,2),
    estado smallint DEFAULT 1
);


ALTER TABLE public.detalle OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 34154)
-- Name: detallecomprobante; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detallecomprobante (
    iddetallecomprobante integer NOT NULL,
    numero integer,
    glosa character varying(100),
    montodebe numeric(10,2),
    montohaber numeric(10,2),
    montodebealt numeric(10,2),
    montohaberalt numeric(10,2),
    idusuario integer,
    idcomprobante integer,
    idcuenta integer
);


ALTER TABLE public.detallecomprobante OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 34153)
-- Name: detallecomprobante_iddetallecomprobante_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detallecomprobante_iddetallecomprobante_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.detallecomprobante_iddetallecomprobante_seq OWNER TO postgres;

--
-- TOC entry 3514 (class 0 OID 0)
-- Dependencies: 225
-- Name: detallecomprobante_iddetallecomprobante_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detallecomprobante_iddetallecomprobante_seq OWNED BY public.detallecomprobante.iddetallecomprobante;


--
-- TOC entry 212 (class 1259 OID 25893)
-- Name: empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa (
    idempresa integer NOT NULL,
    nombre character varying(100),
    nit character varying(10),
    sigla character varying(15),
    telefono character varying(20),
    correo character varying(50),
    direccion text,
    niveles smallint DEFAULT 3,
    estado smallint DEFAULT 1,
    idusuario integer
);


ALTER TABLE public.empresa OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 25892)
-- Name: empresa_idempresa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresa_idempresa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.empresa_idempresa_seq OWNER TO postgres;

--
-- TOC entry 3515 (class 0 OID 0)
-- Dependencies: 211
-- Name: empresa_idempresa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresa_idempresa_seq OWNED BY public.empresa.idempresa;


--
-- TOC entry 222 (class 1259 OID 34107)
-- Name: empresamoneda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresamoneda (
    idempresamoneda integer NOT NULL,
    cambio numeric(10,2) DEFAULT NULL::numeric,
    activo smallint DEFAULT 1,
    fecharegistro timestamp without time zone,
    idempresa integer,
    idmonedaprincipal integer,
    idmonedaalternativa integer,
    idusuario integer
);


ALTER TABLE public.empresamoneda OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 34106)
-- Name: empresamoneda_idempresamoneda_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresamoneda_idempresamoneda_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.empresamoneda_idempresamoneda_seq OWNER TO postgres;

--
-- TOC entry 3516 (class 0 OID 0)
-- Dependencies: 221
-- Name: empresamoneda_idempresamoneda_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresamoneda_idempresamoneda_seq OWNED BY public.empresamoneda.idempresamoneda;


--
-- TOC entry 214 (class 1259 OID 25909)
-- Name: gestion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gestion (
    idgestion integer NOT NULL,
    nombre character varying(50),
    fechainicio date,
    fechafin date,
    estado smallint DEFAULT 1,
    idusuario integer,
    idempresa integer
);


ALTER TABLE public.gestion OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 25908)
-- Name: gestion_idgestion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gestion_idgestion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gestion_idgestion_seq OWNER TO postgres;

--
-- TOC entry 3517 (class 0 OID 0)
-- Dependencies: 213
-- Name: gestion_idgestion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gestion_idgestion_seq OWNED BY public.gestion.idgestion;


--
-- TOC entry 236 (class 1259 OID 42493)
-- Name: integracion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integracion (
    idempresa integer NOT NULL,
    caja integer,
    creditofiscal integer,
    debitofiscal integer,
    compras integer,
    ventas integer,
    it integer,
    itxpagar integer,
    estado smallint DEFAULT 0
);


ALTER TABLE public.integracion OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 42461)
-- Name: lote; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lote (
    idarticulo integer NOT NULL,
    nrolote integer NOT NULL,
    fechaingreso date,
    fechavencimiento date,
    cantidad integer,
    preciocompra numeric(10,2),
    stock integer,
    idnota integer,
    estado smallint
);


ALTER TABLE public.lote OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 34095)
-- Name: moneda; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.moneda (
    idmoneda integer NOT NULL,
    nombre character varying(30),
    descripcion character varying(50),
    abreviatura character varying(5),
    idusuario integer
);


ALTER TABLE public.moneda OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 34094)
-- Name: moneda_idmoneda_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.moneda_idmoneda_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.moneda_idmoneda_seq OWNER TO postgres;

--
-- TOC entry 3518 (class 0 OID 0)
-- Dependencies: 219
-- Name: moneda_idmoneda_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.moneda_idmoneda_seq OWNED BY public.moneda.idmoneda;


--
-- TOC entry 233 (class 1259 OID 42440)
-- Name: nota; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota (
    idnota integer NOT NULL,
    nronota integer,
    fecha date,
    descripcion character varying(100),
    total numeric(10,2),
    tipo smallint,
    idempresa integer,
    idusuario integer,
    idcomprobante integer,
    estado smallint
);


ALTER TABLE public.nota OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 42439)
-- Name: nota_idnota_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_idnota_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.nota_idnota_seq OWNER TO postgres;

--
-- TOC entry 3519 (class 0 OID 0)
-- Dependencies: 232
-- Name: nota_idnota_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_idnota_seq OWNED BY public.nota.idnota;


--
-- TOC entry 216 (class 1259 OID 25927)
-- Name: periodo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.periodo (
    idperiodo integer NOT NULL,
    nombre character varying(50),
    fechainicio date,
    fechafin date,
    estado smallint DEFAULT 1,
    idusuario integer,
    idgestion integer
);


ALTER TABLE public.periodo OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 25926)
-- Name: periodo_idperiodo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.periodo_idperiodo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.periodo_idperiodo_seq OWNER TO postgres;

--
-- TOC entry 3520 (class 0 OID 0)
-- Dependencies: 215
-- Name: periodo_idperiodo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.periodo_idperiodo_seq OWNED BY public.periodo.idperiodo;


--
-- TOC entry 210 (class 1259 OID 25885)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    idusuario integer NOT NULL,
    nombre character varying(50) NOT NULL,
    usuario character varying(90) NOT NULL,
    pass character varying(100) NOT NULL,
    tipo smallint DEFAULT 1
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 25884)
-- Name: usuario_idusuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_idusuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuario_idusuario_seq OWNER TO postgres;

--
-- TOC entry 3521 (class 0 OID 0)
-- Dependencies: 209
-- Name: usuario_idusuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_idusuario_seq OWNED BY public.usuario.idusuario;


--
-- TOC entry 3258 (class 2604 OID 42389)
-- Name: articulo idarticulo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo ALTER COLUMN idarticulo SET DEFAULT nextval('public.articulo_idarticulo_seq'::regclass);


--
-- TOC entry 3259 (class 2604 OID 42406)
-- Name: categoria idcategoria; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria ALTER COLUMN idcategoria SET DEFAULT nextval('public.categoria_idcategoria_seq'::regclass);


--
-- TOC entry 3255 (class 2604 OID 34139)
-- Name: comprobante idcomprobante; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comprobante ALTER COLUMN idcomprobante SET DEFAULT nextval('public.comprobante_idcomprobante_seq'::regclass);


--
-- TOC entry 3250 (class 2604 OID 34075)
-- Name: cuenta idcuenta; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta ALTER COLUMN idcuenta SET DEFAULT nextval('public.cuenta_idcuenta_seq'::regclass);


--
-- TOC entry 3257 (class 2604 OID 34157)
-- Name: detallecomprobante iddetallecomprobante; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallecomprobante ALTER COLUMN iddetallecomprobante SET DEFAULT nextval('public.detallecomprobante_iddetallecomprobante_seq'::regclass);


--
-- TOC entry 3243 (class 2604 OID 25896)
-- Name: empresa idempresa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa ALTER COLUMN idempresa SET DEFAULT nextval('public.empresa_idempresa_seq'::regclass);


--
-- TOC entry 3252 (class 2604 OID 34110)
-- Name: empresamoneda idempresamoneda; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresamoneda ALTER COLUMN idempresamoneda SET DEFAULT nextval('public.empresamoneda_idempresamoneda_seq'::regclass);


--
-- TOC entry 3246 (class 2604 OID 25912)
-- Name: gestion idgestion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestion ALTER COLUMN idgestion SET DEFAULT nextval('public.gestion_idgestion_seq'::regclass);


--
-- TOC entry 3251 (class 2604 OID 34098)
-- Name: moneda idmoneda; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.moneda ALTER COLUMN idmoneda SET DEFAULT nextval('public.moneda_idmoneda_seq'::regclass);


--
-- TOC entry 3260 (class 2604 OID 42443)
-- Name: nota idnota; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota ALTER COLUMN idnota SET DEFAULT nextval('public.nota_idnota_seq'::regclass);


--
-- TOC entry 3248 (class 2604 OID 25930)
-- Name: periodo idperiodo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodo ALTER COLUMN idperiodo SET DEFAULT nextval('public.periodo_idperiodo_seq'::regclass);


--
-- TOC entry 3241 (class 2604 OID 25888)
-- Name: usuario idusuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN idusuario SET DEFAULT nextval('public.usuario_idusuario_seq'::regclass);


--
-- TOC entry 3493 (class 0 OID 42386)
-- Dependencies: 228
-- Data for Name: articulo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articulo (idarticulo, nombre, descripcion, cantidad, precioventa, idempresa, idusuario) FROM stdin;
12	Papas fritas	Papas fritas	60	7.00	28	1
13	Doritos	Doritos	60	7.50	28	1
16	Coca Cola 500ml	Coca Cola 500ml	0	10.00	29	1
10	Coca Cola 500ml	Coca Cola 500ml	44	10.00	28	1
14	Hamburguesas	Hamburguesas	20	25.00	28	1
6	Audifonos Samsung	Audifonos para telefonos Samsung	49	40.00	26	1
9	Detergente de Ropa 2kg - OMO	Detergente para lavar ropa 2kg - OMO	5	20.00	27	1
7	Pollo Entero - Sofía	Pollo entero marca Sofía	15	28.00	27	1
8	Leche en Polvo - Nido	Leche para bebé Etapa Inicial Nido Nestlé	15	40.00	27	1
15	Pizza Familiar	Pizza Familiar	24	120.00	28	1
11	Fanta 500ml	Fanta 500ml	49	10.00	28	1
4	Coca Cola 2Lts	Coca Cola de 2 Litros	38	11.50	26	1
5	Oreo paquete 12u	Galletas Oreo Paqeute de 12 unidades	92	10.00	26	1
\.


--
-- TOC entry 3496 (class 0 OID 42424)
-- Dependencies: 231
-- Data for Name: articulocategoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articulocategoria (idarticulo, idcategoria) FROM stdin;
5	3
5	7
6	1
6	9
4	3
4	6
7	18
7	11
8	12
8	21
9	10
9	15
10	25
10	30
11	25
11	30
12	28
13	28
14	27
15	27
16	33
\.


--
-- TOC entry 3495 (class 0 OID 42403)
-- Dependencies: 230
-- Data for Name: categoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categoria (idcategoria, nombre, descripcion, idempresa, idusuario, idcategoriapadre) FROM stdin;
1	Electrónicos	Dispositivos Electronicos	26	1	\N
3	Alimentos	alimentos	26	1	\N
6	Bebidas	asdwad	26	1	3
7	Comida	comida	26	1	3
8	Arte	asdwad 	25	1	\N
9	Accesorios	Accesorios	26	1	\N
10	Hogar y Accesorios	Artículos para el hogar y otros accesorios	27	1	\N
11	Carnes, Mariscos y Pescados	Carnes y Comida de Mar	27	1	\N
12	Bebés y Niños	Artículos para bebés y niños	27	1	\N
13	Accesorios de Cocina	Accesorios para la cocina	27	1	10
14	Accesorios de mesa	Accesorios para la mesa	27	1	10
15	Artículos de Lavandería	Artículos para lavandería	27	1	10
16	Artículos de Fiesta	Artículos para fiestas	27	1	10
17	Carne de Cerdo	Carne de cerdo	27	1	11
18	Pollos y Pavos	Pollos y pavos	27	1	11
19	Carne de Res	Carne de res	27	1	11
20	Pescados y Mariscos	Pescados y mariscos	27	1	11
21	Comida para bebé	Comida para bebé y Leche Materna	27	1	12
22	Cunas, Carriolas y Accesorios	Cunas, Carriolas y Accesorios	27	1	12
23	Juguetes para Niños	Juguetes para niños	27	1	12
24	Juguetes para Niñas	Juguetes para niñas	27	1	12
25	Bebidas	Bebidas	28	1	\N
26	Comidas	Comidas	28	1	\N
27	Comida Principal	Comida principal	28	1	26
28	Snacks	Snacks	28	1	26
29	Bebidas con Alcohol	Bebidas con Alcohol	28	1	25
30	Bebidas sin Alcohol	Bebidas sin Alcohol	28	1	25
31	Bebidas Sin Alcohol	Bebidas Sin Alcohol	26	1	6
32	Bebidas con Alcohol	Bebidas con Alcohol	26	1	6
33	Bebidas	Bebidas	29	1	\N
\.


--
-- TOC entry 3489 (class 0 OID 34136)
-- Dependencies: 224
-- Data for Name: comprobante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comprobante (idcomprobante, serie, glosa, fecha, tc, estado, tipocomprobante, idusuario, idmoneda, idempresa) FROM stdin;
9	81	asdwasd	2022-01-20	2.71	-1	2	1	1	23
3	1	asdwasd	2022-01-20	2.71	-1	2	1	1	23
2	1	asdwasd	2022-01-20	2.71	-1	2	1	1	23
59	10	Compra de Mercaderias	2022-05-04	6.97	1	3	1	1	27
4	1	asdwasd	2022-01-20	2.71	-1	2	1	1	23
5	1	asdwasd	2022-01-20	2.71	-1	2	1	1	23
60	11	Compra de Mercaderias	2022-06-01	6.97	1	3	1	1	27
6	1	asdwasd	2022-01-20	2.71	-1	2	1	1	23
7	1	asdwasd	2022-01-20	2.71	-1	2	1	1	23
1	1	asdwasd	2022-01-20	0.70	-1	1	1	1	23
8	7	asdwasd	2022-01-20	2.71	-1	2	1	1	23
10	10	asdwasd	2022-01-20	2.71	-1	2	1	1	23
12	12	HOlalaasd	2022-01-04	0.70	-1	3	1	1	23
11	11	Prueba2	2022-01-20	1.70	-1	4	1	3	23
14	14	ahjjjj	2022-01-10	5.70	-1	4	1	3	23
16	16	asd	2022-01-01	3.70	-1	2	1	3	23
13	13	Supercomprobante	2022-01-21	0.70	-1	3	1	1	23
15	15	asd	2022-01-01	3.70	-1	2	1	3	23
17	1	Prueba MA	2022-05-15	6.96	1	2	1	2	24
18	2	Apertura	2022-05-16	6.97	-1	1	1	1	24
19	3	Por apertura de negocio	2022-05-01	6.97	1	1	1	1	24
20	4	Prueba Alt	2022-05-17	6.97	1	2	1	2	24
21	5	Egreso Bs	2022-05-17	6.97	1	3	1	1	24
22	6	Comprobante F	2022-01-01	2.00	1	3	1	2	24
23	17	asdaw	2022-01-01	6.97	1	2	1	1	23
24	18	asdawd	2022-01-10	6.97	1	3	1	3	23
25	1	asdw	2000-01-11	1.20	1	2	1	4	22
28	3	HOla2	2020-01-10	6.96	-1	3	1	2	25
27	2	Hola	2020-02-21	6.90	-1	2	1	1	25
26	1	por apertura del negocio	2020-02-10	6.90	-1	1	1	1	25
29	4	Apertura de Sociedad	2020-01-01	6.90	1	1	1	1	25
30	5	Por compra de mercaderia	2020-01-02	6.90	1	3	1	1	25
31	6	Por pago de debito fiscal e IT por pagar con cheque	2020-01-03	6.90	1	3	1	1	25
32	7	Por venta de mercaderia	2020-01-05	6.90	1	2	1	1	25
33	8	Por compra de material de escritorio	2020-01-06	6.90	1	3	1	1	25
34	9	Por cancelacion de deuda	2020-02-09	6.90	1	3	1	1	25
35	10	Por cancelación de cuentas por cobrar	2020-02-10	6.90	1	2	1	1	25
62	13	Venta de Mercaderias	2022-06-13	6.97	1	2	1	1	27
61	12	Venta de Mercaderias	2022-06-13	6.97	-1	2	1	1	27
58	9	Compra de Mercaderias	2022-06-13	6.97	-1	3	1	1	27
36	1	Por Apertura	2022-01-01	6.97	-1	1	1	1	26
37	2	Por apertura de actividades	2022-01-02	6.97	1	1	1	1	26
38	3	venta de articulos	2022-01-05	6.97	1	2	1	1	26
39	4	compra de merc	2022-01-10	6.97	1	3	1	1	26
40	5	deposito	2022-01-12	6.97	1	4	1	1	26
41	6	ventas en dolares	2022-05-25	6.97	1	2	1	2	26
42	7	Compra de Mercaderias	2022-06-12	6.97	-1	3	1	1	26
43	8	Venta de Mercaderias	2022-06-12	6.97	1	2	1	1	26
44	9	Venta de Mercaderias	2022-06-12	6.97	1	2	1	1	26
45	10	Venta de Mercaderias	2022-06-12	6.97	1	2	1	1	26
46	11	Compra de Mercaderias	2022-01-01	6.97	1	3	1	1	26
47	12	Compra de Mercaderias	2022-03-15	6.97	1	3	1	1	26
48	13	Venta de Mercaderias	2022-06-10	6.97	1	2	1	1	26
49	14	Venta de Mercaderias	2022-06-12	6.97	-1	2	1	1	26
50	1	Apertura de Sociedad	2022-04-01	6.97	1	1	1	1	27
51	2	Por Compra de Mercaderia, se paga con cheque y letra de cambio	2022-04-10	6.97	1	2	1	1	27
52	3	Por Pago de Debito Fiscal e IT por pagar con cheque	2022-04-15	6.97	1	2	1	1	27
53	4	Por venta de mercaderia	2022-04-17	6.97	1	2	1	1	27
54	5	Por compra de Material de escritorio	2022-04-20	6.97	1	2	1	1	27
55	6	Por cancelacion de Deuda	2022-06-13	6.97	-1	4	1	1	27
56	7	Por cancelacion de Deuda	2022-04-25	6.97	1	4	1	1	27
57	8	Por cancelacion de cuentas por cobrar	2022-04-30	6.97	1	4	1	1	27
63	1	Apertura de Sociedad	2021-04-01	6.97	1	1	1	1	28
64	2	Por Pago de Debito Fiscal e IT por pagar con cheque	2021-04-15	6.97	1	3	1	1	28
65	3	Por venta de mercaderia	2021-04-17	6.97	1	2	1	1	28
66	4	Por Compra de Mercaderia, se paga con cheque y letra de cambio	2021-04-10	6.97	1	3	1	1	28
67	5	Por compra de Material de escritorio	2021-04-20	6.97	1	3	1	1	28
68	6	Por cancelacion de Deuda	2021-04-25	6.97	1	3	1	1	28
69	7	Por cancelacion de cuentas por cobrar	2021-04-30	6.97	1	2	1	1	28
70	8	Compra de Mercaderias	2021-06-15	6.97	1	3	1	1	28
71	9	Compra de Mercaderias	2021-06-15	6.97	1	3	1	1	28
73	11	Venta de Mercaderias	2021-06-15	6.97	1	2	1	1	28
72	10	Compra de Mercaderias	2021-06-15	6.97	-1	3	1	1	28
74	12	Venta de Mercaderias	2021-06-15	6.97	-1	2	1	1	28
75	1	Apertura de Sociedad	2022-04-01	6.96	1	1	1	1	29
76	2	Por Compra de Mercaderia, se paga con cheque y letra de cambio	2022-04-10	6.96	1	3	1	1	29
77	3	Por Pago de Debito Fiscal e IT por pagar con cheque	2022-04-15	6.96	1	3	1	1	29
78	4	Por venta de mercaderia	2022-04-17	6.96	1	2	1	1	29
79	5	Por compra de Material de escritorio	2022-04-20	6.96	1	3	1	1	29
80	6	Por cancelacion de Deuda	2022-04-25	6.96	1	3	1	1	29
81	7	Por cancelacion de cuentas por cobrar	2022-04-30	6.96	1	2	1	1	29
82	13	Compra de Mercaderias	2021-06-22	6.97	1	3	1	1	28
83	14	Venta de Mercaderias	2021-06-22	6.97	-1	2	1	1	28
84	15	Venta de Mercaderias	2021-06-28	6.97	1	2	1	1	28
\.


--
-- TOC entry 3483 (class 0 OID 34072)
-- Dependencies: 218
-- Data for Name: cuenta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuenta (idcuenta, codigo, nombre, nivel, tipocuenta, idusuario, idempresa, idcuentapadre) FROM stdin;
139	1.0.0.0.0.0	Activo	1	0	1	21	\N
140	2.0.0.0.0.0	Pasivo	1	0	1	21	\N
141	3.0.0.0.0.0	Patrimonio	1	0	1	21	\N
142	4.0.0.0.0.0	Inresos	1	0	1	21	\N
143	5.0.0.0.0.0	Egresos	1	0	1	21	\N
144	5.1.0.0.0.0	Costos	2	0	1	21	143
145	5.2.0.0.0.0	Gastos	2	0	1	21	143
146	1.0.0.0.0	Activo	1	0	1	22	\N
147	2.0.0.0.0	Pasivo	1	0	1	22	\N
148	3.0.0.0.0	Patrimonio	1	0	1	22	\N
149	4.0.0.0.0	Inresos	1	0	1	22	\N
150	5.0.0.0.0	Egresos	1	0	1	22	\N
151	5.1.0.0.0	Costos	2	0	1	22	150
152	5.2.0.0.0	Gastos	2	0	1	22	150
153	1.0.0	Activo	1	0	1	23	\N
154	2.0.0	Pasivo	1	0	1	23	\N
155	3.0.0	Patrimonio	1	0	1	23	\N
156	4.0.0	Inresos	1	0	1	23	\N
157	5.0.0	Egresos	1	0	1	23	\N
159	5.2.0	Gastos	2	0	1	23	157
158	5.1.0	Costos F	2	0	1	23	157
160	5.1.1	Costos Fijos	3	1	1	23	158
162	5.2.1	Gastos Fijos	3	1	1	23	159
163	5.2.2	Gastos Varios	3	1	1	23	159
164	1.1.0	Activo Corriente	2	0	1	23	153
165	1.2.0	Activo No Corriente	2	0	1	23	153
166	1.1.1	Caja M/N	3	1	1	23	164
167	1.1.2	Caja M/E	3	1	1	23	164
168	1.1.3	Clientes x Cobrar	3	1	1	23	164
169	2.1.0	Pasivo Corriente	2	0	1	23	154
170	2.2.0	Pasivo No Corriente	2	0	1	23	154
171	2.1.1	Prestamos Bancarios	3	1	1	23	169
172	2.1.2	Intereses Por Paar	3	1	1	23	169
173	2.1.3	Cuentas Por Pagar	3	1	1	23	169
174	2.1.4	Aportes Personales	3	1	1	23	169
175	1.0.0	Activo	1	0	1	24	\N
176	2.0.0	Pasivo	1	0	1	24	\N
177	3.0.0	Patrimonio	1	0	1	24	\N
178	4.0.0	Inresos	1	0	1	24	\N
179	5.0.0	Egresos	1	0	1	24	\N
180	5.1.0	Costos	2	0	1	24	179
181	5.2.0	Gastos	2	0	1	24	179
182	1.1.0	Activo Corriente	2	0	1	24	175
183	1.2.0	Activo No Corriente	2	0	1	24	175
184	1.1.1	Caja M/N	3	1	1	24	182
185	1.1.2	Caja Chica	3	1	1	24	182
186	1.1.3	Caja M/E	3	1	1	24	182
187	1.1.4	Banco	3	1	1	24	182
188	1.2.1	Maquina y Equipo	3	1	1	24	183
189	1.2.2	Muebles y Enseres	3	1	1	24	183
190	1.2.3	Terrenos	3	1	1	24	183
191	1.2.4	Vehículos	3	1	1	24	183
192	2.1.0	Pasivo Corriente	2	0	1	24	176
193	2.2.0	Pasivo No Corriente	2	0	1	24	176
194	3.1.0	Capital Contable	2	0	1	24	177
195	2.1.1	Cuentas por Pagar	3	1	1	24	192
197	2.1.3	Impuestos por Pagar	3	1	1	24	192
196	2.1.2	Salarios por Pagar	3	1	1	24	192
198	2.1.4	Aportes a Pagar	3	1	1	24	192
199	2.2.1	Prestamos hipotecarios	3	1	1	24	193
200	2.2.2	Previsiones	3	1	1	24	193
201	3.1.1	Capital Social	3	1	1	24	194
202	3.1.2	Reserva Legal	3	1	1	24	194
203	3.1.3	Ajuste global de patrimonio	3	1	1	24	194
204	3.1.4	Utilidad de Gestion	3	1	1	24	194
205	1.0.0	Activo	1	0	1	25	\N
206	2.0.0	Pasivo	1	0	1	25	\N
207	3.0.0	Patrimonio	1	0	1	25	\N
208	4.0.0	Inresos	1	0	1	25	\N
209	5.0.0	Egresos	1	0	1	25	\N
210	5.1.0	Costos	2	0	1	25	209
211	5.2.0	Gastos	2	0	1	25	209
212	1.1.0	Activo Corriente	2	0	1	25	205
213	1.2.0	Activo No Corriente	2	0	1	25	205
214	1.1.1	Caja MN	3	1	1	25	212
215	1.1.2	Banco MN	3	1	1	25	212
216	1.1.3	Cuentas Por Cobrar	3	1	1	25	212
217	1.1.4	Credito Fiscal	3	1	1	25	212
219	1.2.2	Material De Escritorio	3	1	1	25	213
234	1.1.1.1.0	asdawdasda	4	0	1	22	233
218	1.2.1	Equipos De Computación	3	1	1	25	213
220	2.1.0	Pasivo Corriente	2	0	1	25	206
221	2.1.1	Debito Fiscal	3	1	1	25	220
222	2.1.2	Documentos por pagar	3	1	1	25	220
223	2.1.3	IT por pagar	3	1	1	25	220
224	2.1.4	Cuentas por pagar	3	1	1	25	220
225	3.1.0	Patrimonio 1	2	0	1	25	207
226	3.1.1	Capital Social	3	1	1	25	225
227	4.1.0	Ingresos 1	2	0	1	25	208
228	4.1.1	Ventas	3	1	1	25	227
229	5.1.1	IT	3	1	1	25	210
230	5.1.2	Compras	3	1	1	25	210
231	5.2.1	Sueldos	3	1	1	25	211
232	1.1.0.0.0	asddawd	2	0	1	22	146
233	1.1.1.0.0	asdawdasd	3	0	1	22	232
235	1.1.1.1.1	asdawawdaw	5	1	1	22	234
236	2.1.0.0.0	zxczs	2	0	1	22	147
237	2.1.1.0.0	zxczsxcs	3	0	1	22	236
238	2.1.1.1.0	zxczsxc	4	0	1	22	237
239	2.1.1.1.1	zxcszxcsdw	5	1	1	22	238
240	1.0.0	Activo	1	0	1	26	\N
241	2.0.0	Pasivo	1	0	1	26	\N
242	3.0.0	Patrimonio	1	0	1	26	\N
244	5.0.0	Egresos	1	0	1	26	\N
245	5.1.0	Costos	2	0	1	26	244
246	5.2.0	Gastos	2	0	1	26	244
247	1.1.0	Activo Corriente	2	0	1	26	240
248	1.2.0	Activo No Corriente	2	0	1	26	240
249	1.1.1	Caja MN	3	1	1	26	247
250	1.1.2	Banco MN	3	1	1	26	247
251	1.1.3	Cuentas por cobrar	3	1	1	26	247
252	1.1.4	Credito fiscal	3	1	1	26	247
243	4.0.0	Ingresos	1	0	1	26	\N
253	1.2.1	Equipo de Computacion	3	1	1	26	248
254	1.2.2	Material de Escritorio	3	1	1	26	248
255	2.1.0	Pasivo Corriente	2	0	1	26	241
256	2.1.1	Debito fiscal	3	1	1	26	255
257	2.1.2	Documentos por pagar	3	1	1	26	255
258	2.1.3	IT por pagar	3	1	1	26	255
259	2.1.4	Cuentas Por Pagar	3	1	1	26	255
260	3.1.0	Patrimonio y Capital	2	0	1	26	242
261	3.1.1	Capital Social	3	1	1	26	260
263	5.1.1	IT	3	1	1	26	245
264	5.1.2	Compras	3	1	1	26	245
265	5.2.1	Sueldos	3	1	1	26	246
262	4.1.0	Ingresos 1	2	0	1	26	243
266	4.1.1	Ventas	3	1	1	26	262
267	1.0.0	Activo	1	0	1	27	\N
268	2.0.0	Pasivo	1	0	1	27	\N
269	3.0.0	Patrimonio	1	0	1	27	\N
270	4.0.0	Ingresos	1	0	1	27	\N
271	5.0.0	Egresos	1	0	1	27	\N
272	5.1.0	Costos	2	0	1	27	271
273	5.2.0	Gastos	2	0	1	27	271
274	1.1.0	Activo Corriente	2	0	1	27	267
275	1.1.1	Caja MN	3	1	1	27	274
276	1.1.2	Banco MN	3	1	1	27	274
277	1.1.3	Cuentas por Cobrar	3	1	1	27	274
278	1.1.4	Credito Fiscal	3	1	1	27	274
279	1.2.0	Activo No Corriente	2	0	1	27	267
280	1.2.1	Equipo de Computacion	3	1	1	27	279
281	1.2.2	Material de Escritorio	3	1	1	27	279
282	2.1.0	Pasivo Corriente	2	0	1	27	268
283	2.1.1	Debito Fiscal	3	1	1	27	282
284	2.1.2	Documentos por Pagar	3	1	1	27	282
285	2.1.3	IT por Pagar	3	1	1	27	282
286	2.1.4	Cuentas por Pagar	3	1	1	27	282
287	3.1.0	Patrimonio 	2	0	1	27	269
288	3.1.1	Capital Social	3	1	1	27	287
289	4.1.0	Ingresos 	2	0	1	27	270
290	4.1.1	Ventas	3	1	1	27	289
291	5.1.1	IT	3	1	1	27	272
292	5.1.2	Compras	3	1	1	27	272
293	5.2.1	Sueldos	3	1	1	27	273
294	1.0.0	Activo	1	0	1	28	\N
295	2.0.0	Pasivo	1	0	1	28	\N
296	3.0.0	Patrimonio	1	0	1	28	\N
297	4.0.0	Ingresos	1	0	1	28	\N
298	5.0.0	Egresos	1	0	1	28	\N
299	5.1.0	Costos	2	0	1	28	298
300	5.2.0	Gastos	2	0	1	28	298
301	1.1.0	Activo Corriente	2	0	1	28	294
302	1.2.0	Activo No Corriente	2	0	1	28	294
303	1.1.1	Caja M/N	3	1	1	28	301
304	1.1.2	Banco M/N	3	1	1	28	301
305	1.1.3	Cuentas por Cobrar	3	1	1	28	301
306	1.1.4	Credito Fiscal	3	1	1	28	301
307	1.2.1	Equipo de Computacion	3	1	1	28	302
308	1.2.2	Material de Escritorio	3	1	1	28	302
309	2.1.0	Pasivo Corriente	2	0	1	28	295
310	2.1.1	Debito Fiscal	3	1	1	28	309
311	2.1.2	Documentos por Pagar	3	1	1	28	309
312	2.1.3	IT por Pagar	3	1	1	28	309
313	2.1.4	Cuentas por Pagar	3	1	1	28	309
315	3.1.1	Capital Social	3	1	1	28	314
314	3.1.0	Patrimonio  y Capital	2	0	1	28	296
316	4.1.0	Ingresos 1	2	0	1	28	297
317	4.1.1	Ventas	3	1	1	28	316
318	5.1.1	IT	3	1	1	28	299
319	5.1.2	Compras	3	1	1	28	299
320	5.2.1	Sueldos	3	1	1	28	300
321	1.0.0	Activo	1	0	1	29	\N
322	2.0.0	Pasivo	1	0	1	29	\N
323	3.0.0	Patrimonio	1	0	1	29	\N
324	4.0.0	Ingresos	1	0	1	29	\N
325	5.0.0	Egresos	1	0	1	29	\N
326	5.1.0	Costos	2	0	1	29	325
327	5.2.0	Gastos	2	0	1	29	325
328	1.1.0	Activo Corriente	2	0	1	29	321
329	1.2.0	Activo No Corriente	2	0	1	29	321
330	1.1.1	Caja MN	3	1	1	29	328
331	1.1.2	Banco MN	3	1	1	29	328
332	1.2.1	Equipo de Computacion	3	1	1	29	329
333	1.2.2	Material de Escritorio	3	1	1	29	329
334	1.1.3	Cuentas por Cobrar	3	1	1	29	328
335	1.1.4	Credito Fiscal	3	1	1	29	328
336	2.1.0	Pasivo Corriente	2	0	1	29	322
337	2.1.1	Debito Fiscal	3	1	1	29	336
338	2.1.2	Documentos por Pagar	3	1	1	29	336
339	2.1.3	IT por Pagar	3	1	1	29	336
340	2.1.4	Cuentas Por Pagar	3	1	1	29	336
341	3.1.0	Patrimonio y Capital	2	0	1	29	323
342	3.1.1	Capital Social	3	1	1	29	341
343	4.1.0	Ingresos 1	2	0	1	29	324
344	4.1.1	Ventas	3	1	1	29	343
345	5.1.1	IT	3	1	1	29	326
346	5.1.2	Compras	3	1	1	29	326
347	5.2.1	Sueldos	3	1	1	29	327
\.


--
-- TOC entry 3500 (class 0 OID 42476)
-- Dependencies: 235
-- Data for Name: detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle (idarticulo, nrolote, idnota, cantidad, precioventa, estado) FROM stdin;
4	1	8	10	11.50	-1
4	1	9	6	11.50	-1
4	3	9	5	11.50	-1
6	2	9	10	40.00	-1
6	2	14	1	40.00	1
4	3	15	15	11.50	-1
4	3	18	15	11.50	1
6	6	21	1	40.00	1
6	7	21	2	40.00	1
4	4	21	1	11.50	1
5	4	21	1	10.00	1
4	5	22	2	11.50	-1
5	5	22	2	10.00	-1
8	3	27	15	40.00	1
7	1	27	5	28.00	1
9	1	27	15	20.00	1
8	2	26	10	40.00	-1
8	3	26	5	40.00	-1
7	1	26	15	28.00	-1
14	1	31	2	25.00	1
15	1	31	1	120.00	1
10	1	31	4	10.00	1
11	1	31	1	10.00	1
14	1	32	4	25.00	-1
12	1	32	4	7.00	-1
10	1	32	4	10.00	-1
4	1	13	3	11.50	-1
5	1	13	3	10.00	-1
12	2	34	10	7.00	-1
13	2	34	10	7.50	-1
10	1	35	2	10.00	1
14	1	35	3	25.00	1
\.


--
-- TOC entry 3491 (class 0 OID 34154)
-- Dependencies: 226
-- Data for Name: detallecomprobante; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detallecomprobante (iddetallecomprobante, numero, glosa, montodebe, montohaber, montodebealt, montohaberalt, idusuario, idcomprobante, idcuenta) FROM stdin;
3	1	a	50.00	0.00	135.62	0.00	1	4	166
4	2	d	0.00	50.00	0.00	135.62	1	4	174
5	1	a	50.00	0.00	135.62	0.00	1	5	166
6	2	d	0.00	50.00	0.00	135.62	1	5	174
7	1	a	50.00	0.00	135.62	0.00	1	6	166
8	2	d	0.00	50.00	0.00	135.62	1	6	174
9	1	a	50.00	0.00	135.62	0.00	1	7	166
10	2	d	0.00	50.00	0.00	135.62	1	7	174
11	1	a	50.00	0.00	135.62	0.00	1	8	166
12	2	d	0.00	50.00	0.00	135.62	1	8	174
13	1	a	50.00	0.00	135.62	0.00	1	9	166
14	2	d	0.00	50.00	0.00	135.62	1	9	174
15	1	a	50.00	0.00	135.62	0.00	1	10	166
16	2	d	0.00	50.00	0.00	135.62	1	10	174
17	1	Prueba2	100.00	0.00	170.00	0.00	1	11	166
18	2	asdwads	0.00	60.00	0.00	102.00	1	11	171
19	3		0.00	40.00	0.00	68.00	1	11	173
20	1	HOlalaasd	500.00	0.00	350.00	0.00	1	12	167
21	2	asdwad	0.00	500.00	0.00	350.00	1	12	174
22	1	Supercomprobante	0.00	300.00	0.00	210.00	1	13	171
23	2	Supercomprobante	300.00	0.00	210.00	0.00	1	13	167
24	1	ahjjjj	40.00	0.00	228.00	0.00	1	14	166
25	2	ñkjg	0.00	40.00	0.00	228.00	1	14	171
26	1	asd	40.00	0.00	148.00	0.00	1	15	166
27	2	fgh	0.00	40.00	0.00	148.00	1	15	162
28	1	asd	40.00	0.00	148.00	0.00	1	16	166
29	2	fgh	0.00	40.00	0.00	148.00	1	16	162
30	1	Prueba MA	400.00	0.00	2784.00	0.00	1	17	186
31	2	Prueba MA	0.00	400.00	0.00	2784.00	1	17	189
32	1	Apertura	50.00	0.00	348.50	0.00	1	18	185
33	2	Apertura	0.00	50.00	0.00	348.50	1	18	195
34	1	Por apertura de negocio	30000.00	0.00	209100.00	0.00	1	19	184
35	2	Por apertura de negocio	50000.00	0.00	348500.00	0.00	1	19	186
36	3	Por apertura de negocio	50000.00	0.00	348500.00	0.00	1	19	187
37	4	Por apertura de negocio	80000.00	0.00	557600.00	0.00	1	19	190
38	5	Por apertura de negocio	80000.00	0.00	557600.00	0.00	1	19	191
39	6	Por apertura de negocio	0.00	30000.00	0.00	209100.00	1	19	195
40	7	Por apertura de negocio	0.00	260000.00	0.00	1812200.00	1	19	201
41	1	Prueba Alt	348.50	0.00	50.00	50.00	1	20	184
42	2	Prueba Alt	697.00	0.00	100.00	100.00	1	20	186
43	3	Prueba Alt	0.00	697.00	0.00	0.00	1	20	196
44	4	Prueba Alt	0.00	348.50	0.00	0.00	1	20	195
45	1	Egreso Bs	60.00	0.00	8.61	0.00	1	21	185
46	2	Egreso Bs	100.00	0.00	14.35	0.00	1	21	187
47	3	Egreso Bs	0.00	80.00	0.00	11.48	1	21	195
48	4	Egreso Bs	0.00	80.00	0.00	11.48	1	21	201
49	1	Comprobante F	200.00	0.00	100.00	100.00	1	22	184
50	2	Comprobante F	0.00	200.00	0.00	0.00	1	22	196
51	1	asdaw	100.00	0.00	14.35	0.00	1	23	168
52	2	asdaw	0.00	100.00	0.00	14.35	1	23	173
53	1	asdawd	697.00	0.00	100.00	0.00	1	24	168
54	2	asdawd	0.00	697.00	0.00	100.00	1	24	173
55	1	asdw	120.00	0.00	100.00	0.00	1	25	235
56	2	asdw	0.00	120.00	0.00	100.00	1	25	239
57	1	por apertura del negocio	1000.00	0.00	144.93	0.00	1	26	214
58	2	por apertura del negocio	4000.00	0.00	579.71	0.00	1	26	215
59	3	por apertura del negocio	0.00	2500.00	0.00	362.32	1	26	218
60	4	por apertura del negocio	0.00	2500.00	0.00	362.32	1	26	219
61	1	Hola	100.00	0.00	14.49	0.00	1	27	214
62	2	Hola	0.00	100.00	0.00	14.49	1	27	219
63	1	HOla2	1392.00	0.00	200.00	0.00	1	28	215
64	2	HOla2	0.00	1392.00	0.00	200.00	1	28	222
65	1	Apertura de Sociedad	3500.00	0.00	507.25	0.00	1	29	214
66	2	Apertura de Sociedad	60000.00	0.00	8695.65	0.00	1	29	215
67	3	Apertura de Sociedad	5000.00	0.00	724.64	0.00	1	29	218
68	4	Apertura de Sociedad	1000.00	0.00	144.93	0.00	1	29	216
69	5	Apertura de Sociedad	0.00	7000.00	0.00	1014.49	1	29	221
70	6	Apertura de Sociedad	0.00	3200.00	0.00	463.77	1	29	223
71	7	Apertura de Sociedad	0.00	12500.00	0.00	1811.59	1	29	224
72	8	Apertura de Sociedad	0.00	46800.00	0.00	6782.61	1	29	226
73	1	Por compra de mercaderia	15660.00	0.00	2269.57	0.00	1	30	230
74	2	Por compra de mercaderia	2340.00	0.00	339.13	0.00	1	30	217
75	3	Por compra de mercaderia	0.00	15000.00	0.00	2173.91	1	30	215
76	4	Por compra de mercaderia	0.00	3000.00	0.00	434.78	1	30	222
77	1	Por pago de debito fiscal e IT por pagar con cheque	7000.00	0.00	1014.49	0.00	1	31	221
78	2	Por pago de debito fiscal e IT por pagar con cheque	3200.00	0.00	463.77	0.00	1	31	223
79	3	Por pago de debito fiscal e IT por pagar con cheque	0.00	10200.00	0.00	1478.26	1	31	215
80	1	Por venta de mercaderia	25600.00	0.00	3710.14	0.00	1	32	214
81	2	Por venta de mercaderia	768.00	0.00	111.30	0.00	1	32	229
82	3	Por venta de mercaderia	0.00	768.00	0.00	111.30	1	32	223
83	4	Por venta de mercaderia	0.00	22272.00	0.00	3227.83	1	32	228
84	5	Por venta de mercaderia	0.00	3328.00	0.00	482.32	1	32	221
85	1	Por compra de material de escritorio	2001.00	0.00	290.00	0.00	1	33	219
86	2	Por compra de material de escritorio	299.00	0.00	43.33	0.00	1	33	217
87	3	Por compra de material de escritorio	0.00	2300.00	0.00	333.33	1	33	215
88	1	Por cancelacion de deuda	12500.00	0.00	1811.59	0.00	1	34	224
89	2	Por cancelacion de deuda	0.00	12500.00	0.00	1811.59	1	34	215
90	1	Por cancelación de cuentas por cobrar	1000.00	0.00	144.93	0.00	1	35	214
91	2	Por cancelación de cuentas por cobrar	0.00	1000.00	0.00	144.93	1	35	216
92	1	Por Apertura	100.00	0.00	14.35	0.00	1	36	249
93	2	Por Apertura	0.00	100.00	0.00	14.35	1	36	250
94	1	Por apertura de actividades	20000.00	0.00	2869.44	0.00	1	37	249
95	2	Por apertura de actividades	15000.00	0.00	2152.08	0.00	1	37	250
96	3	Por apertura de actividades	1000.00	0.00	143.47	0.00	1	37	252
97	4	Por apertura de actividades	20000.00	0.00	2869.44	0.00	1	37	253
98	5	Por apertura de actividades	5000.00	0.00	717.36	0.00	1	37	254
99	6	Por apertura de actividades	0.00	10000.00	0.00	1434.72	1	37	257
100	7	Por apertura de actividades	0.00	5000.00	0.00	717.36	1	37	259
101	8	Por apertura de actividades	0.00	46000.00	0.00	6599.71	1	37	261
102	1	venta de articulos	1500.00	0.00	215.21	0.00	1	38	249
103	2	venta de articulos	0.00	1200.00	0.00	172.17	1	38	266
104	3	venta de articulos	0.00	300.00	0.00	43.04	1	38	256
105	1	compra de merc	15000.00	0.00	2152.08	0.00	1	39	264
106	2	compra de merc	300.00	0.00	43.04	0.00	1	39	252
107	3	compra de merc	0.00	5300.00	0.00	760.40	1	39	249
108	4	compra de merc	0.00	10000.00	0.00	1434.72	1	39	250
109	1	deposito	5000.00	0.00	717.36	0.00	1	40	250
110	2	deposito	0.00	5000.00	0.00	717.36	1	40	249
111	1	ventas en dolares	6970.00	0.00	1000.00	0.00	1	41	249
112	2	ventas en dolares	0.00	697.00	0.00	100.00	1	41	256
113	3	ventas en dolares	0.00	6273.00	0.00	900.00	1	41	266
114	1	Compra de Mercaderias	83.52	0.00	11.98	0.00	1	42	264
115	2	Compra de Mercaderias	12.48	0.00	1.79	0.00	1	42	252
116	3	Compra de Mercaderias	0.00	96.00	0.00	13.77	1	42	249
117	1	Venta de Mercaderias	40.00	0.00	5.74	0.00	1	43	249
118	2	Venta de Mercaderias	1.20	0.00	0.17	0.00	1	43	263
119	3	Venta de Mercaderias	0.00	5.20	0.00	0.75	1	43	256
120	4	Venta de Mercaderias	0.00	34.80	0.00	4.99	1	43	266
121	5	Venta de Mercaderias	0.00	1.20	0.00	0.17	1	43	258
122	1	Venta de Mercaderias	172.50	0.00	24.75	0.00	1	44	249
123	2	Venta de Mercaderias	5.18	0.00	0.74	0.00	1	44	263
124	3	Venta de Mercaderias	0.00	22.43	0.00	3.22	1	44	256
125	4	Venta de Mercaderias	0.00	150.08	0.00	21.53	1	44	266
126	5	Venta de Mercaderias	0.00	5.18	0.00	0.74	1	44	258
127	1	Venta de Mercaderias	172.50	0.00	24.75	0.00	1	45	249
128	2	Venta de Mercaderias	5.18	0.00	0.74	0.00	1	45	263
129	3	Venta de Mercaderias	0.00	22.43	0.00	3.22	1	45	256
130	4	Venta de Mercaderias	0.00	150.08	0.00	21.53	1	45	266
131	5	Venta de Mercaderias	0.00	5.18	0.00	0.74	1	45	258
132	1	Compra de Mercaderias	2.61	0.00	0.37	0.00	1	46	264
133	2	Compra de Mercaderias	0.39	0.00	0.06	0.00	1	46	252
134	3	Compra de Mercaderias	0.00	3.00	0.00	0.43	1	46	249
135	1	Compra de Mercaderias	10.44	0.00	1.50	0.00	1	47	264
136	2	Compra de Mercaderias	1.56	0.00	0.22	0.00	1	47	252
137	3	Compra de Mercaderias	0.00	12.00	0.00	1.72	1	47	249
138	1	Venta de Mercaderias	141.50	0.00	20.30	0.00	1	48	249
139	2	Venta de Mercaderias	4.25	0.00	0.61	0.00	1	48	263
140	3	Venta de Mercaderias	0.00	18.40	0.00	2.64	1	48	256
141	4	Venta de Mercaderias	0.00	123.11	0.00	17.66	1	48	266
142	5	Venta de Mercaderias	0.00	4.25	0.00	0.61	1	48	258
143	1	Venta de Mercaderias	43.00	0.00	6.17	0.00	1	49	249
144	2	Venta de Mercaderias	1.29	0.00	0.19	0.00	1	49	263
145	3	Venta de Mercaderias	0.00	5.59	0.00	0.80	1	49	256
146	4	Venta de Mercaderias	0.00	37.41	0.00	5.37	1	49	266
147	5	Venta de Mercaderias	0.00	1.29	0.00	0.19	1	49	258
148	1	Apertura de Sociedad	3500.00	0.00	502.15	0.00	1	50	275
149	2	Apertura de Sociedad	60000.00	0.00	8608.32	0.00	1	50	276
150	3	Apertura de Sociedad	5000.00	0.00	717.36	0.00	1	50	280
151	4	Apertura de Sociedad	1000.00	0.00	143.47	0.00	1	50	277
152	5	Apertura de Sociedad	0.00	7000.00	0.00	1004.30	1	50	283
153	6	Apertura de Sociedad	0.00	3200.00	0.00	459.11	1	50	285
154	7	Apertura de Sociedad	0.00	12500.00	0.00	1793.40	1	50	286
155	8	Apertura de Sociedad	0.00	46800.00	0.00	6714.49	1	50	288
156	1	Por Compra de Mercaderia, se paga con cheque y letra de cambio	15660.00	0.00	2246.77	0.00	1	51	292
157	2	Por Compra de Mercaderia, se paga con cheque y letra de cambio	2340.00	0.00	335.72	0.00	1	51	278
158	3	Por Compra de Mercaderia, se paga con cheque y letra de cambio	0.00	15000.00	0.00	2152.08	1	51	276
159	4	Por Compra de Mercaderia, se paga con cheque y letra de cambio	0.00	3000.00	0.00	430.42	1	51	284
160	1	Por Pago de Debito Fiscal e IT por pagar con cheque	7000.00	0.00	1004.30	0.00	1	52	283
161	2	Por Pago de Debito Fiscal e IT por pagar con cheque	3200.00	0.00	459.11	0.00	1	52	285
162	3	Por Pago de Debito Fiscal e IT por pagar con cheque	0.00	10200.00	0.00	1463.41	1	52	276
163	1	Por venta de mercaderia	25600.00	0.00	3672.88	0.00	1	53	275
164	2	Por venta de mercaderia	768.00	0.00	110.19	0.00	1	53	291
165	3	Por venta de mercaderia	0.00	768.00	0.00	110.19	1	53	285
166	4	Por venta de mercaderia	0.00	22272.00	0.00	3195.41	1	53	290
167	5	Por venta de mercaderia	0.00	3328.00	0.00	477.47	1	53	283
168	1	Por compra de Material de escritorio	2001.00	0.00	287.09	0.00	1	54	281
169	2	Por compra de Material de escritorio	299.00	0.00	42.90	0.00	1	54	278
170	3	Por compra de Material de escritorio	0.00	2300.00	0.00	329.99	1	54	276
171	1	Por cancelacion de Deuda	12500.00	0.00	1793.40	0.00	1	55	286
172	2	Por cancelacion de Deuda	0.00	12500.00	0.00	1793.40	1	55	276
173	1	Por cancelacion de Deuda	12500.00	0.00	1793.40	0.00	1	56	286
174	2	Por cancelacion de Deuda	0.00	12500.00	0.00	1793.40	1	56	276
175	1	Por cancelacion de cuentas por cobrar	1000.00	0.00	143.47	0.00	1	57	275
176	2	Por cancelacion de cuentas por cobrar	0.00	1000.00	0.00	143.47	1	57	277
177	1	Compra de Mercaderias	556.80	0.00	79.89	0.00	1	58	292
178	2	Compra de Mercaderias	83.20	0.00	11.94	0.00	1	58	278
179	3	Compra de Mercaderias	0.00	640.00	0.00	91.82	1	58	275
180	1	Compra de Mercaderias	269.70	0.00	38.69	0.00	1	59	292
181	2	Compra de Mercaderias	40.30	0.00	5.78	0.00	1	59	278
182	3	Compra de Mercaderias	0.00	310.00	0.00	44.48	1	59	275
183	1	Compra de Mercaderias	582.90	0.00	83.63	0.00	1	60	292
184	2	Compra de Mercaderias	87.10	0.00	12.50	0.00	1	60	278
185	3	Compra de Mercaderias	0.00	670.00	0.00	96.13	1	60	275
186	1	Venta de Mercaderias	1020.00	0.00	146.34	0.00	1	61	275
187	2	Venta de Mercaderias	30.60	0.00	4.39	0.00	1	61	291
188	3	Venta de Mercaderias	0.00	132.60	0.00	19.02	1	61	283
189	4	Venta de Mercaderias	0.00	887.40	0.00	127.32	1	61	290
190	5	Venta de Mercaderias	0.00	30.60	0.00	4.39	1	61	285
191	1	Venta de Mercaderias	1040.00	0.00	149.21	0.00	1	62	275
192	2	Venta de Mercaderias	31.20	0.00	4.48	0.00	1	62	291
193	3	Venta de Mercaderias	0.00	135.20	0.00	19.40	1	62	283
194	4	Venta de Mercaderias	0.00	904.80	0.00	129.81	1	62	290
195	5	Venta de Mercaderias	0.00	31.20	0.00	4.48	1	62	285
196	1	Apertura de Sociedad	3500.00	0.00	502.15	0.00	1	63	303
197	2	Apertura de Sociedad	60000.00	0.00	8608.32	0.00	1	63	304
198	3	Apertura de Sociedad	5000.00	0.00	717.36	0.00	1	63	307
199	4	Apertura de Sociedad	1000.00	0.00	143.47	0.00	1	63	305
200	5	Apertura de Sociedad	0.00	7000.00	0.00	1004.30	1	63	310
201	6	Apertura de Sociedad	0.00	3200.00	0.00	459.11	1	63	312
202	7	Apertura de Sociedad	0.00	12500.00	0.00	1793.40	1	63	313
203	8	Apertura de Sociedad	0.00	46800.00	0.00	6714.49	1	63	315
204	1	Por Pago de Debito Fiscal e IT por pagar con cheque	7000.00	0.00	1004.30	0.00	1	64	310
205	2	Por Pago de Debito Fiscal e IT por pagar con cheque	3200.00	0.00	459.11	0.00	1	64	312
206	3	Por Pago de Debito Fiscal e IT por pagar con cheque	0.00	10200.00	0.00	1463.41	1	64	304
207	1	Por venta de mercaderia	25600.00	0.00	3672.88	0.00	1	65	303
208	2	Por venta de mercaderia	768.00	0.00	110.19	0.00	1	65	318
209	3	Por venta de mercaderia	0.00	768.00	0.00	110.19	1	65	312
210	4	Por venta de mercaderia	0.00	22272.00	0.00	3195.41	1	65	317
211	5	Por venta de mercaderia	0.00	3328.00	0.00	477.47	1	65	310
212	1	Por Compra de Mercaderia, se paga con cheque y letra de cambio	15660.00	0.00	2246.77	0.00	1	66	319
213	2	Por Compra de Mercaderia, se paga con cheque y letra de cambio	2340.00	0.00	335.72	0.00	1	66	306
214	3	Por Compra de Mercaderia, se paga con cheque y letra de cambio	0.00	15000.00	0.00	2152.08	1	66	304
215	4	Por Compra de Mercaderia, se paga con cheque y letra de cambio	0.00	3000.00	0.00	430.42	1	66	311
216	1	Por compra de Material de escritorio	2001.00	0.00	287.09	0.00	1	67	308
217	2	Por compra de Material de escritorio	299.00	0.00	42.90	0.00	1	67	306
218	3	Por compra de Material de escritorio	0.00	2300.00	0.00	329.99	1	67	304
219	1	Por cancelacion de Deuda	12500.00	0.00	1793.40	0.00	1	68	313
220	2	Por cancelacion de Deuda	0.00	12500.00	0.00	1793.40	1	68	304
221	1	Por cancelacion de cuentas por cobrar	1000.00	0.00	143.47	0.00	1	69	303
222	2	Por cancelacion de cuentas por cobrar	0.00	1000.00	0.00	143.47	1	69	305
223	1	Compra de Mercaderias	369.75	0.00	53.05	0.00	1	70	319
224	2	Compra de Mercaderias	55.25	0.00	7.93	0.00	1	70	306
225	3	Compra de Mercaderias	0.00	425.00	0.00	60.98	1	70	303
226	1	Compra de Mercaderias	1348.50	0.00	193.47	0.00	1	71	319
227	2	Compra de Mercaderias	201.50	0.00	28.91	0.00	1	71	306
228	3	Compra de Mercaderias	0.00	1550.00	0.00	222.38	1	71	303
229	1	Compra de Mercaderias	87.00	0.00	12.48	0.00	1	72	319
230	2	Compra de Mercaderias	13.00	0.00	1.87	0.00	1	72	306
231	3	Compra de Mercaderias	0.00	100.00	0.00	14.35	1	72	303
232	1	Venta de Mercaderias	220.00	0.00	31.56	0.00	1	73	303
233	2	Venta de Mercaderias	6.60	0.00	0.95	0.00	1	73	318
234	3	Venta de Mercaderias	0.00	28.60	0.00	4.10	1	73	310
235	4	Venta de Mercaderias	0.00	191.40	0.00	27.46	1	73	317
236	5	Venta de Mercaderias	0.00	6.60	0.00	0.95	1	73	312
237	1	Venta de Mercaderias	168.00	0.00	24.10	0.00	1	74	303
238	2	Venta de Mercaderias	5.04	0.00	0.72	0.00	1	74	318
239	3	Venta de Mercaderias	0.00	21.84	0.00	3.13	1	74	310
240	4	Venta de Mercaderias	0.00	146.16	0.00	20.97	1	74	317
241	5	Venta de Mercaderias	0.00	5.04	0.00	0.72	1	74	312
242	1	Apertura de Sociedad	3500.00	0.00	502.87	0.00	1	75	330
243	2	Apertura de Sociedad	60000.00	0.00	8620.69	0.00	1	75	331
244	3	Apertura de Sociedad	5000.00	0.00	718.39	0.00	1	75	332
245	4	Apertura de Sociedad	1000.00	0.00	143.68	0.00	1	75	334
246	5	Apertura de Sociedad	0.00	7000.00	0.00	1005.75	1	75	337
247	6	Apertura de Sociedad	0.00	3200.00	0.00	459.77	1	75	339
248	7	Apertura de Sociedad	0.00	12500.00	0.00	1795.98	1	75	340
249	8	Apertura de Sociedad	0.00	46800.00	0.00	6724.14	1	75	342
250	1	Por Compra de Mercaderia, se paga con cheque y letra de cambio	15660.00	0.00	2250.00	0.00	1	76	346
251	2	Por Compra de Mercaderia, se paga con cheque y letra de cambio	2340.00	0.00	336.21	0.00	1	76	335
252	3	Por Compra de Mercaderia, se paga con cheque y letra de cambio	0.00	15000.00	0.00	2155.17	1	76	331
253	4	Por Compra de Mercaderia, se paga con cheque y letra de cambio	0.00	3000.00	0.00	431.03	1	76	338
254	1	Por Pago de Debito Fiscal e IT por pagar con cheque	7000.00	0.00	1005.75	0.00	1	77	337
255	2	Por Pago de Debito Fiscal e IT por pagar con cheque	3200.00	0.00	459.77	0.00	1	77	339
256	3	Por Pago de Debito Fiscal e IT por pagar con cheque	0.00	10200.00	0.00	1465.52	1	77	331
257	1	Por venta de mercaderia	25600.00	0.00	3678.16	0.00	1	78	330
258	2	Por venta de mercaderia	768.00	0.00	110.34	0.00	1	78	345
259	3	Por venta de mercaderia	0.00	768.00	0.00	110.34	1	78	339
260	4	Por venta de mercaderia	0.00	22272.00	0.00	3200.00	1	78	344
261	5	Por venta de mercaderia	0.00	3328.00	0.00	478.16	1	78	337
262	1	Por compra de Material de escritorio	2001.00	0.00	287.50	0.00	1	79	333
263	2	Por compra de Material de escritorio	299.00	0.00	42.96	0.00	1	79	335
264	3	Por compra de Material de escritorio	0.00	2300.00	0.00	330.46	1	79	331
265	1	Por cancelacion de Deuda	12500.00	0.00	1795.98	0.00	1	80	340
266	2	Por cancelacion de Deuda	0.00	12500.00	0.00	1795.98	1	80	331
267	1	Por cancelacion de cuentas por cobrar	1000.00	0.00	143.68	0.00	1	81	330
268	2	Por cancelacion de cuentas por cobrar	0.00	1000.00	0.00	143.68	1	81	334
269	1	Compra de Mercaderias	87.00	0.00	12.48	0.00	1	82	319
270	2	Compra de Mercaderias	13.00	0.00	1.87	0.00	1	82	306
271	3	Compra de Mercaderias	0.00	100.00	0.00	14.35	1	82	303
272	1	Venta de Mercaderias	145.00	0.00	20.80	0.00	1	83	303
273	2	Venta de Mercaderias	4.35	0.00	0.62	0.00	1	83	318
274	3	Venta de Mercaderias	0.00	18.85	0.00	2.70	1	83	310
275	4	Venta de Mercaderias	0.00	126.15	0.00	18.10	1	83	317
276	5	Venta de Mercaderias	0.00	4.35	0.00	0.62	1	83	312
277	1	Venta de Mercaderias	95.00	0.00	13.63	0.00	1	84	303
278	2	Venta de Mercaderias	2.85	0.00	0.41	0.00	1	84	318
279	3	Venta de Mercaderias	0.00	12.35	0.00	1.77	1	84	310
280	4	Venta de Mercaderias	0.00	82.65	0.00	11.86	1	84	317
281	5	Venta de Mercaderias	0.00	2.85	0.00	0.41	1	84	312
\.


--
-- TOC entry 3477 (class 0 OID 25893)
-- Dependencies: 212
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empresa (idempresa, nombre, nit, sigla, telefono, correo, direccion, niveles, estado, idusuario) FROM stdin;
22	Cuentas 2	12345789	CUENTA				5	0	1
21	Cuenta Moneda	12345678	CUEMON	75566987	cuenta@google.com	Calle 3	6	0	1
24	Empresa 14	12345648	EMP1	74412357			3	0	1
26	Examen	1110421541	EXAMEN				3	1	1
23	Test	465446544	TEST				3	0	1
25	Ejemplo Contable	1111111111	EJCONT	33321548			3	0	1
27	Prueba Contable	1231233321	PC123	774421123			3	1	1
28	Tercer Parcial	3333213332	PARCIAL3				3	1	1
29	Examen Final	3214542123	FINERP				3	1	1
\.


--
-- TOC entry 3487 (class 0 OID 34107)
-- Dependencies: 222
-- Data for Name: empresamoneda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empresamoneda (idempresamoneda, cambio, activo, fecharegistro, idempresa, idmonedaprincipal, idmonedaalternativa, idusuario) FROM stdin;
15	\N	0	2022-04-13 20:41:51.323166	21	2	\N	1
16	6.96	0	2022-04-13 21:11:10.052971	21	2	1	1
18	\N	0	2022-04-13 21:20:07.984102	22	4	\N	1
19	1.00	0	2022-04-13 22:04:51.595396	22	4	5	1
20	2.00	0	2022-04-13 22:05:01.617579	22	4	2	1
21	1.00	0	2022-04-13 22:05:06.646882	22	4	5	1
22	1.20	0	2022-04-13 22:05:58.714805	22	4	5	1
23	1.20	1	2022-04-13 22:06:23.304184	22	4	5	1
24	\N	0	2022-04-13 22:09:26.189856	23	1	\N	1
25	6.97	0	2022-04-13 22:10:18.478572	23	1	2	1
26	6.95	0	2022-04-13 22:11:07.13476	23	1	2	1
27	0.70	0	2022-04-23 10:02:47.261971	23	1	4	1
29	\N	0	2022-05-15 22:10:12.992678	24	1	\N	1
17	6.98	0	2022-04-13 21:16:34.295831	21	2	1	1
31	8.00	1	2022-05-16 18:56:12.223802	21	2	4	1
30	6.96	0	2022-05-15 22:28:12.468981	24	1	2	1
32	7.96	0	2022-05-16 20:04:29.560338	24	1	2	1
33	6.97	1	2022-05-16 20:39:14.168967	24	1	2	1
34	\N	0	2022-05-18 21:14:28.274725	25	1	\N	1
28	0.70	0	2022-04-27 21:54:10.793454	23	1	3	1
36	6.97	1	2022-05-18 21:44:18.471556	23	1	3	1
35	6.97	0	2022-05-18 21:15:08.359934	25	1	2	1
37	6.90	1	2022-05-18 21:48:57.757537	25	1	2	1
38	\N	0	2022-05-23 19:22:09.089193	26	1	\N	1
39	6.97	1	2022-05-25 21:08:23.641691	26	1	2	1
40	\N	0	2022-06-13 20:10:22.19338	27	1	\N	1
41	6.97	1	2022-06-13 20:31:12.237195	27	1	2	1
42	\N	0	2022-06-15 18:21:45.428141	28	1	\N	1
43	6.97	1	2022-06-15 18:33:31.407533	28	1	2	1
44	\N	0	2022-06-22 19:16:11.69827	29	1	\N	1
45	6.96	1	2022-06-22 19:22:58.517486	29	1	2	1
\.


--
-- TOC entry 3479 (class 0 OID 25909)
-- Dependencies: 214
-- Data for Name: gestion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gestion (idgestion, nombre, fechainicio, fechafin, estado, idusuario, idempresa) FROM stdin;
24	Gestion 2022	2022-01-01	2022-12-31	1	1	23
25	Gestion 2022	2022-01-01	2022-12-31	1	1	24
26	Gestion 2020	2020-01-01	2020-12-01	1	1	24
27	Gestion 2020	2020-01-01	2020-12-31	1	1	25
28	G1	2000-01-01	2000-12-31	1	1	22
29	Gestion 2022	2022-01-01	2022-12-31	1	1	26
30	Gestion 2022	2022-01-01	2022-12-31	1	1	27
31	Gestion 2021	2021-01-01	2021-12-31	1	1	28
32	Gestion 2022	2022-01-01	2022-12-31	1	1	29
\.


--
-- TOC entry 3501 (class 0 OID 42493)
-- Dependencies: 236
-- Data for Name: integracion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integracion (idempresa, caja, creditofiscal, debitofiscal, compras, ventas, it, itxpagar, estado) FROM stdin;
26	249	252	256	264	266	263	258	1
27	275	278	283	292	290	291	285	1
28	303	306	310	319	317	318	312	1
29	\N	\N	\N	\N	\N	\N	\N	0
\.


--
-- TOC entry 3499 (class 0 OID 42461)
-- Dependencies: 234
-- Data for Name: lote; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lote (idarticulo, nrolote, fechaingreso, fechavencimiento, cantidad, preciocompra, stock, idnota, estado) FROM stdin;
4	5	2022-03-15	\N	2	2.00	2	20	1
5	5	2022-03-15	\N	2	2.00	2	20	1
9	2	2022-06-01	\N	5	10.00	5	25	1
4	2	2022-06-07	2022-07-12	5	7.15	5	5	-1
5	2	2022-06-07	\N	6	4.60	6	5	-1
6	1	2022-06-07	\N	30	17.00	30	5	-1
9	1	2022-05-04	\N	15	10.00	0	24	0
8	2	2022-05-04	2022-07-26	10	16.00	10	24	1
5	3	2022-06-12	\N	40	3.00	40	6	1
8	3	2022-06-01	2022-08-05	20	16.00	5	25	1
7	1	2022-06-01	2022-06-18	20	15.00	15	25	1
8	1	2022-06-13	2022-09-01	40	16.00	40	23	-1
6	3	2022-06-12	\N	30	11.00	30	10	1
6	4	2022-06-12	\N	12	8.00	12	11	-1
6	5	2022-06-12	\N	2	8.00	2	12	-1
6	2	2022-06-12	\N	20	12.00	19	6	1
13	1	2021-06-15	\N	50	3.00	50	29	1
4	3	2022-06-12	2022-07-29	15	7.00	0	6	0
6	6	2022-01-01	\N	1	1.00	0	19	0
6	7	2022-03-15	\N	2	2.00	0	20	0
4	4	2022-01-01	\N	1	1.00	0	19	0
5	4	2022-01-01	\N	1	1.00	0	19	0
15	1	2021-06-15	\N	25	40.00	24	29	1
11	1	2021-06-15	2021-12-15	50	4.00	49	28	1
10	2	2021-06-15	\N	10	5.00	10	30	-1
11	2	2021-06-15	\N	10	5.00	10	30	-1
12	1	2021-06-15	\N	50	3.00	50	29	1
4	1	2022-03-04	2022-08-04	36	7.80	36	4	1
5	1	2022-03-04	\N	50	6.20	50	4	1
12	2	2021-06-22	\N	10	5.00	10	33	1
13	2	2021-06-22	\N	10	5.00	10	33	1
10	1	2021-06-15	2021-12-15	50	4.50	44	28	1
14	1	2021-06-15	\N	25	10.00	20	29	1
\.


--
-- TOC entry 3485 (class 0 OID 34095)
-- Dependencies: 220
-- Data for Name: moneda; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.moneda (idmoneda, nombre, descripcion, abreviatura, idusuario) FROM stdin;
2	Dólar estadounidense	Moneda de Estados Unidos	$	1
3	Real brasileño	Moneda de Brasil	R$	1
4	Euro	Moneda de Europa	€	1
5	Libra esterlina	Moneda del Reino Unido	£	1
1	Boliviano	Moneda de Bolivia	Bs	1
\.


--
-- TOC entry 3498 (class 0 OID 42440)
-- Dependencies: 233
-- Data for Name: nota; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota (idnota, nronota, fecha, descripcion, total, tipo, idempresa, idusuario, idcomprobante, estado) FROM stdin;
4	1	2022-03-04	Primer Nota	590.80	1	26	1	\N	1
6	3	2022-06-12	Se compra todo	465.00	1	26	1	\N	1
8	1	2022-06-12	Venta de Coca Cola	115.00	2	26	1	\N	-1
9	2	2022-05-04	Venta Segunda	526.50	2	26	1	\N	-1
10	4	2022-06-12	Compra F	330.00	1	26	1	\N	1
5	2	2022-06-07	Compra de todo	573.35	1	26	1	\N	-1
11	5	2022-06-12	Compra de Audifonos	96.00	1	26	1	42	-1
12	6	2022-06-12	casdwad	16.00	1	26	1	\N	-1
14	4	2022-06-12	Venta Audifono	40.00	2	26	1	\N	1
15	5	2022-06-12	asdwad	172.50	2	26	1	\N	-1
16	6	2022-06-12	asdawsd 2	172.50	2	26	1	\N	1
17	7	2022-06-12	asdawsd 2	172.50	2	26	1	\N	1
18	8	2022-06-12	asdawsd 2	172.50	2	26	1	45	1
19	7	2022-01-01	Compra de Enero	3.00	1	26	1	46	1
20	8	2022-03-15	Compra Marzo	12.00	1	26	1	47	1
21	9	2022-06-10	Agotado T	141.50	2	26	1	48	1
22	10	2022-06-12	TEST AGOTADO	43.00	2	26	1	49	-1
24	2	2022-05-04	Compra Combo	310.00	1	27	1	59	1
25	3	2022-06-01	Compra de Todo	670.00	1	27	1	60	1
27	2	2022-06-13	Venta Ok	1040.00	2	27	1	62	1
26	1	2022-06-13	Venta Fail	1020.00	2	27	1	61	-1
23	1	2022-06-13	Compra de Leche en Polvo	640.00	1	27	1	58	-1
28	1	2021-06-15	Compra de Bebidas	425.00	1	28	1	70	1
29	2	2021-06-15	Compra Snacks	1550.00	1	28	1	71	1
31	1	2021-06-15	Consumo Mesa 1	220.00	2	28	1	73	1
30	3	2021-06-15	Compra de Bebidas	100.00	1	28	1	72	-1
32	2	2021-06-15	Consumo mesa 2	168.00	2	28	1	74	-1
13	3	2022-06-12	Primera Venta	64.50	2	26	1	\N	-1
33	4	2021-06-22	compras	100.00	1	28	1	82	1
34	3	2021-06-22	ventas	145.00	2	28	1	83	-1
35	4	2021-06-28	Venta	95.00	2	28	1	84	1
\.


--
-- TOC entry 3481 (class 0 OID 25927)
-- Dependencies: 216
-- Data for Name: periodo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.periodo (idperiodo, nombre, fechainicio, fechafin, estado, idusuario, idgestion) FROM stdin;
41	Enero	2022-01-01	2022-01-31	1	1	24
42	Enero	2022-01-01	2022-01-31	1	1	25
43	Febrero	2022-02-01	2022-02-28	1	1	25
44	Marzo	2022-03-01	2022-03-31	1	1	25
45	Abril	2022-04-01	2022-04-30	1	1	25
46	Mayo	2022-05-01	2022-05-31	1	1	25
47	Enero	2020-01-01	2020-01-31	1	1	26
48	Enero	2020-01-01	2020-01-31	1	1	27
49	Febrero	2020-02-01	2020-02-28	1	1	27
51	Enero	2022-01-01	2022-01-31	1	1	29
52	Febrero	2022-02-01	2022-02-28	1	1	29
53	Marzo	2022-03-01	2022-03-31	1	1	29
54	Abril	2022-04-01	2022-04-30	1	1	29
55	Mayo	2022-05-01	2022-05-31	1	1	29
56	Junio	2022-06-01	2022-06-30	1	1	29
57	Enero	2022-01-01	2022-01-31	1	1	30
58	Febrero	2022-02-01	2022-02-28	1	1	30
59	Marzo	2022-03-01	2022-03-31	1	1	30
60	Abril	2022-04-01	2022-04-30	1	1	30
61	Mayo	2022-05-01	2022-05-31	1	1	30
62	Junio	2022-06-01	2022-06-30	1	1	30
63	Julio	2022-07-01	2022-07-31	1	1	30
64	Agosto	2022-08-01	2022-08-31	1	1	30
65	Septiembre	2022-09-01	2022-09-30	1	1	30
66	Octubre	2022-10-01	2022-10-31	1	1	30
67	Enero	2021-01-01	2021-01-31	1	1	31
68	Febrero	2021-02-01	2021-02-28	1	1	31
69	Marzo	2021-03-01	2021-03-31	1	1	31
70	Abril	2021-04-01	2021-04-30	1	1	31
71	Mayo	2021-05-01	2021-05-31	1	1	31
72	Junio	2021-06-01	2021-06-30	1	1	31
73	Julio	2021-07-01	2021-07-31	1	1	31
74	Agosto	2021-08-01	2021-08-31	1	1	31
75	Enero	2022-01-01	2022-01-31	1	1	32
76	Febrero	2022-02-01	2022-02-28	1	1	32
77	Marzo	2022-03-01	2022-03-31	1	1	32
78	Abril	2022-04-01	2022-04-30	1	1	32
79	Mayo	2022-05-01	2022-05-31	1	1	32
80	Junio	2022-06-01	2022-06-30	1	1	32
81	Julio	2022-07-01	2022-07-31	1	1	32
\.


--
-- TOC entry 3475 (class 0 OID 25885)
-- Dependencies: 210
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (idusuario, nombre, usuario, pass, tipo) FROM stdin;
1	Mauricio Justiniano	mauricio	mauricio123	1
\.


--
-- TOC entry 3522 (class 0 OID 0)
-- Dependencies: 227
-- Name: articulo_idarticulo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articulo_idarticulo_seq', 16, true);


--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 229
-- Name: categoria_idcategoria_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categoria_idcategoria_seq', 33, true);


--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 223
-- Name: comprobante_idcomprobante_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comprobante_idcomprobante_seq', 84, true);


--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 217
-- Name: cuenta_idcuenta_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuenta_idcuenta_seq', 347, true);


--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 225
-- Name: detallecomprobante_iddetallecomprobante_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detallecomprobante_iddetallecomprobante_seq', 281, true);


--
-- TOC entry 3527 (class 0 OID 0)
-- Dependencies: 211
-- Name: empresa_idempresa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empresa_idempresa_seq', 29, true);


--
-- TOC entry 3528 (class 0 OID 0)
-- Dependencies: 221
-- Name: empresamoneda_idempresamoneda_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empresamoneda_idempresamoneda_seq', 45, true);


--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 213
-- Name: gestion_idgestion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gestion_idgestion_seq', 32, true);


--
-- TOC entry 3530 (class 0 OID 0)
-- Dependencies: 219
-- Name: moneda_idmoneda_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.moneda_idmoneda_seq', 5, true);


--
-- TOC entry 3531 (class 0 OID 0)
-- Dependencies: 232
-- Name: nota_idnota_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_idnota_seq', 35, true);


--
-- TOC entry 3532 (class 0 OID 0)
-- Dependencies: 215
-- Name: periodo_idperiodo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.periodo_idperiodo_seq', 81, true);


--
-- TOC entry 3533 (class 0 OID 0)
-- Dependencies: 209
-- Name: usuario_idusuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_idusuario_seq', 1, true);


--
-- TOC entry 3284 (class 2606 OID 42391)
-- Name: articulo articulo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo
    ADD CONSTRAINT articulo_pkey PRIMARY KEY (idarticulo);


--
-- TOC entry 3288 (class 2606 OID 42428)
-- Name: articulocategoria articulocategoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulocategoria
    ADD CONSTRAINT articulocategoria_pkey PRIMARY KEY (idarticulo, idcategoria);


--
-- TOC entry 3286 (class 2606 OID 42408)
-- Name: categoria categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_pkey PRIMARY KEY (idcategoria);


--
-- TOC entry 3280 (class 2606 OID 34142)
-- Name: comprobante comprobante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comprobante
    ADD CONSTRAINT comprobante_pkey PRIMARY KEY (idcomprobante);


--
-- TOC entry 3272 (class 2606 OID 34078)
-- Name: cuenta cuenta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta
    ADD CONSTRAINT cuenta_pkey PRIMARY KEY (idcuenta);


--
-- TOC entry 3294 (class 2606 OID 42480)
-- Name: detalle detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle
    ADD CONSTRAINT detalle_pkey PRIMARY KEY (idarticulo, nrolote, idnota);


--
-- TOC entry 3282 (class 2606 OID 34159)
-- Name: detallecomprobante detallecomprobante_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallecomprobante
    ADD CONSTRAINT detallecomprobante_pkey PRIMARY KEY (iddetallecomprobante);


--
-- TOC entry 3266 (class 2606 OID 25902)
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (idempresa);


--
-- TOC entry 3277 (class 2606 OID 34114)
-- Name: empresamoneda empresamoneda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresamoneda
    ADD CONSTRAINT empresamoneda_pkey PRIMARY KEY (idempresamoneda);


--
-- TOC entry 3268 (class 2606 OID 25915)
-- Name: gestion gestion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestion
    ADD CONSTRAINT gestion_pkey PRIMARY KEY (idgestion);


--
-- TOC entry 3296 (class 2606 OID 42498)
-- Name: integracion integracion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integracion
    ADD CONSTRAINT integracion_pkey PRIMARY KEY (idempresa);


--
-- TOC entry 3292 (class 2606 OID 42465)
-- Name: lote lote_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT lote_pkey PRIMARY KEY (idarticulo, nrolote);


--
-- TOC entry 3275 (class 2606 OID 34100)
-- Name: moneda moneda_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.moneda
    ADD CONSTRAINT moneda_pkey PRIMARY KEY (idmoneda);


--
-- TOC entry 3290 (class 2606 OID 42445)
-- Name: nota nota_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota
    ADD CONSTRAINT nota_pkey PRIMARY KEY (idnota);


--
-- TOC entry 3270 (class 2606 OID 25933)
-- Name: periodo periodo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodo
    ADD CONSTRAINT periodo_pkey PRIMARY KEY (idperiodo);


--
-- TOC entry 3264 (class 2606 OID 25891)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (idusuario);


--
-- TOC entry 3273 (class 1259 OID 34218)
-- Name: fki_cuenta_idempresa_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_cuenta_idempresa_fkey ON public.cuenta USING btree (idempresa);


--
-- TOC entry 3278 (class 1259 OID 34212)
-- Name: fki_empresamoneda_idempresa_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_empresamoneda_idempresa_fkey ON public.empresamoneda USING btree (idempresa);


--
-- TOC entry 3333 (class 2620 OID 42510)
-- Name: detalle trigg_detalle_anular; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigg_detalle_anular AFTER UPDATE ON public.detalle FOR EACH ROW EXECUTE FUNCTION public.detalle_anular_trigger();


--
-- TOC entry 3334 (class 2620 OID 42508)
-- Name: detalle trigg_detalle_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigg_detalle_insert AFTER INSERT ON public.detalle FOR EACH ROW EXECUTE FUNCTION public.detalle_insert_trigger();


--
-- TOC entry 3332 (class 2620 OID 42506)
-- Name: lote trigg_lote_anular; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigg_lote_anular AFTER UPDATE ON public.lote FOR EACH ROW EXECUTE FUNCTION public.lote_anular_trigger();


--
-- TOC entry 3331 (class 2620 OID 42492)
-- Name: lote trigg_lote_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigg_lote_insert AFTER INSERT ON public.lote FOR EACH ROW EXECUTE FUNCTION public.lote_insert_trigger();


--
-- TOC entry 3316 (class 2606 OID 42392)
-- Name: articulo articulo_idempresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo
    ADD CONSTRAINT articulo_idempresa_fkey FOREIGN KEY (idempresa) REFERENCES public.empresa(idempresa);


--
-- TOC entry 3317 (class 2606 OID 42397)
-- Name: articulo articulo_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulo
    ADD CONSTRAINT articulo_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);


--
-- TOC entry 3321 (class 2606 OID 42429)
-- Name: articulocategoria articulocategoria_idarticulo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulocategoria
    ADD CONSTRAINT articulocategoria_idarticulo_fkey FOREIGN KEY (idarticulo) REFERENCES public.articulo(idarticulo);


--
-- TOC entry 3322 (class 2606 OID 42434)
-- Name: articulocategoria articulocategoria_idcategoria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articulocategoria
    ADD CONSTRAINT articulocategoria_idcategoria_fkey FOREIGN KEY (idcategoria) REFERENCES public.categoria(idcategoria);


--
-- TOC entry 3320 (class 2606 OID 42419)
-- Name: categoria categoria_idcategoriapadre_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_idcategoriapadre_fkey FOREIGN KEY (idcategoriapadre) REFERENCES public.categoria(idcategoria);


--
-- TOC entry 3318 (class 2606 OID 42409)
-- Name: categoria categoria_idempresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_idempresa_fkey FOREIGN KEY (idempresa) REFERENCES public.empresa(idempresa);


--
-- TOC entry 3319 (class 2606 OID 42414)
-- Name: categoria categoria_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categoria
    ADD CONSTRAINT categoria_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);


--
-- TOC entry 3312 (class 2606 OID 34182)
-- Name: comprobante comprobante_idempresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comprobante
    ADD CONSTRAINT comprobante_idempresa_fkey FOREIGN KEY (idempresa) REFERENCES public.empresa(idempresa);


--
-- TOC entry 3311 (class 2606 OID 34148)
-- Name: comprobante comprobante_idmoneda_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comprobante
    ADD CONSTRAINT comprobante_idmoneda_fkey FOREIGN KEY (idmoneda) REFERENCES public.moneda(idmoneda);


--
-- TOC entry 3310 (class 2606 OID 34143)
-- Name: comprobante comprobante_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comprobante
    ADD CONSTRAINT comprobante_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);


--
-- TOC entry 3303 (class 2606 OID 34089)
-- Name: cuenta cuenta_idcuentapadre_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta
    ADD CONSTRAINT cuenta_idcuentapadre_fkey FOREIGN KEY (idcuentapadre) REFERENCES public.cuenta(idcuenta);


--
-- TOC entry 3304 (class 2606 OID 34213)
-- Name: cuenta cuenta_idempresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta
    ADD CONSTRAINT cuenta_idempresa_fkey FOREIGN KEY (idempresa) REFERENCES public.empresa(idempresa) ON DELETE CASCADE;


--
-- TOC entry 3302 (class 2606 OID 34079)
-- Name: cuenta cuenta_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuenta
    ADD CONSTRAINT cuenta_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);


--
-- TOC entry 3328 (class 2606 OID 42481)
-- Name: detalle detalle_idarticulo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle
    ADD CONSTRAINT detalle_idarticulo_fkey FOREIGN KEY (idarticulo) REFERENCES public.articulo(idarticulo);


--
-- TOC entry 3329 (class 2606 OID 42486)
-- Name: detalle detalle_idnota_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle
    ADD CONSTRAINT detalle_idnota_fkey FOREIGN KEY (idnota) REFERENCES public.nota(idnota);


--
-- TOC entry 3313 (class 2606 OID 34165)
-- Name: detallecomprobante detallecomprobante_idcomprobante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallecomprobante
    ADD CONSTRAINT detallecomprobante_idcomprobante_fkey FOREIGN KEY (idcomprobante) REFERENCES public.comprobante(idcomprobante);


--
-- TOC entry 3314 (class 2606 OID 34170)
-- Name: detallecomprobante detallecomprobante_idcuenta_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallecomprobante
    ADD CONSTRAINT detallecomprobante_idcuenta_fkey FOREIGN KEY (idcuenta) REFERENCES public.cuenta(idcuenta);


--
-- TOC entry 3315 (class 2606 OID 34160)
-- Name: detallecomprobante detallecomprobante_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detallecomprobante
    ADD CONSTRAINT detallecomprobante_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);


--
-- TOC entry 3297 (class 2606 OID 25903)
-- Name: empresa empresa_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);


--
-- TOC entry 3309 (class 2606 OID 34207)
-- Name: empresamoneda empresamoneda_idempresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresamoneda
    ADD CONSTRAINT empresamoneda_idempresa_fkey FOREIGN KEY (idempresa) REFERENCES public.empresa(idempresa) ON DELETE CASCADE;


--
-- TOC entry 3307 (class 2606 OID 34125)
-- Name: empresamoneda empresamoneda_idmonedaalternativa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresamoneda
    ADD CONSTRAINT empresamoneda_idmonedaalternativa_fkey FOREIGN KEY (idmonedaalternativa) REFERENCES public.moneda(idmoneda);


--
-- TOC entry 3306 (class 2606 OID 34120)
-- Name: empresamoneda empresamoneda_idmonedaprincipal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresamoneda
    ADD CONSTRAINT empresamoneda_idmonedaprincipal_fkey FOREIGN KEY (idmonedaprincipal) REFERENCES public.moneda(idmoneda);


--
-- TOC entry 3308 (class 2606 OID 34130)
-- Name: empresamoneda empresamoneda_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresamoneda
    ADD CONSTRAINT empresamoneda_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);


--
-- TOC entry 3299 (class 2606 OID 25921)
-- Name: gestion gestion_idempresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestion
    ADD CONSTRAINT gestion_idempresa_fkey FOREIGN KEY (idempresa) REFERENCES public.empresa(idempresa);


--
-- TOC entry 3298 (class 2606 OID 25916)
-- Name: gestion gestion_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gestion
    ADD CONSTRAINT gestion_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);


--
-- TOC entry 3330 (class 2606 OID 42499)
-- Name: integracion integracion_idempresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integracion
    ADD CONSTRAINT integracion_idempresa_fkey FOREIGN KEY (idempresa) REFERENCES public.empresa(idempresa);


--
-- TOC entry 3326 (class 2606 OID 42466)
-- Name: lote lote_idarticulo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT lote_idarticulo_fkey FOREIGN KEY (idarticulo) REFERENCES public.articulo(idarticulo);


--
-- TOC entry 3327 (class 2606 OID 42471)
-- Name: lote lote_idnota_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT lote_idnota_fkey FOREIGN KEY (idnota) REFERENCES public.nota(idnota);


--
-- TOC entry 3305 (class 2606 OID 34101)
-- Name: moneda moneda_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.moneda
    ADD CONSTRAINT moneda_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);


--
-- TOC entry 3325 (class 2606 OID 42456)
-- Name: nota nota_idcomprobante_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota
    ADD CONSTRAINT nota_idcomprobante_fkey FOREIGN KEY (idcomprobante) REFERENCES public.comprobante(idcomprobante);


--
-- TOC entry 3323 (class 2606 OID 42446)
-- Name: nota nota_idempresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota
    ADD CONSTRAINT nota_idempresa_fkey FOREIGN KEY (idempresa) REFERENCES public.empresa(idempresa);


--
-- TOC entry 3324 (class 2606 OID 42451)
-- Name: nota nota_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota
    ADD CONSTRAINT nota_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);


--
-- TOC entry 3301 (class 2606 OID 25939)
-- Name: periodo periodo_idgestion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodo
    ADD CONSTRAINT periodo_idgestion_fkey FOREIGN KEY (idgestion) REFERENCES public.gestion(idgestion);


--
-- TOC entry 3300 (class 2606 OID 25934)
-- Name: periodo periodo_idusuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodo
    ADD CONSTRAINT periodo_idusuario_fkey FOREIGN KEY (idusuario) REFERENCES public.usuario(idusuario);


-- Completed on 2023-01-18 22:33:06

--
-- PostgreSQL database dump complete
--

