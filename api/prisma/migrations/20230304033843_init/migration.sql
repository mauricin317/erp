-- CreateTable
CREATE TABLE "articulo" (
    "idarticulo" SERIAL NOT NULL,
    "nombre" VARCHAR(50),
    "descripcion" VARCHAR(100),
    "cantidad" INTEGER,
    "precioventa" DECIMAL(10,2),
    "idempresa" INTEGER,
    "idusuario" INTEGER,

    CONSTRAINT "articulo_pkey" PRIMARY KEY ("idarticulo")
);

-- CreateTable
CREATE TABLE "articulocategoria" (
    "idarticulo" INTEGER NOT NULL,
    "idcategoria" INTEGER NOT NULL,

    CONSTRAINT "articulocategoria_pkey" PRIMARY KEY ("idarticulo","idcategoria")
);

-- CreateTable
CREATE TABLE "categoria" (
    "idcategoria" SERIAL NOT NULL,
    "nombre" VARCHAR(50),
    "descripcion" VARCHAR(100),
    "idempresa" INTEGER,
    "idusuario" INTEGER,
    "idcategoriapadre" INTEGER,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("idcategoria")
);

-- CreateTable
CREATE TABLE "comprobante" (
    "idcomprobante" SERIAL NOT NULL,
    "serie" INTEGER,
    "glosa" VARCHAR(100),
    "fecha" DATE,
    "tc" DECIMAL(10,2),
    "estado" SMALLINT DEFAULT 2,
    "tipocomprobante" SMALLINT,
    "idusuario" INTEGER,
    "idmoneda" INTEGER,
    "idempresa" INTEGER,

    CONSTRAINT "comprobante_pkey" PRIMARY KEY ("idcomprobante")
);

-- CreateTable
CREATE TABLE "cuenta" (
    "idcuenta" SERIAL NOT NULL,
    "codigo" VARCHAR(30),
    "nombre" VARCHAR(50),
    "nivel" SMALLINT,
    "tipocuenta" SMALLINT,
    "idusuario" INTEGER,
    "idempresa" INTEGER,
    "idcuentapadre" INTEGER,

    CONSTRAINT "cuenta_pkey" PRIMARY KEY ("idcuenta")
);

-- CreateTable
CREATE TABLE "detalle" (
    "idarticulo" INTEGER NOT NULL,
    "nrolote" INTEGER NOT NULL,
    "idnota" INTEGER NOT NULL,
    "cantidad" INTEGER,
    "precioventa" DECIMAL(10,2),
    "estado" SMALLINT DEFAULT 1,

    CONSTRAINT "detalle_pkey" PRIMARY KEY ("idarticulo","nrolote","idnota")
);

-- CreateTable
CREATE TABLE "detallecomprobante" (
    "iddetallecomprobante" SERIAL NOT NULL,
    "numero" INTEGER,
    "glosa" VARCHAR(100),
    "montodebe" DECIMAL(10,2),
    "montohaber" DECIMAL(10,2),
    "montodebealt" DECIMAL(10,2),
    "montohaberalt" DECIMAL(10,2),
    "idusuario" INTEGER,
    "idcomprobante" INTEGER,
    "idcuenta" INTEGER,

    CONSTRAINT "detallecomprobante_pkey" PRIMARY KEY ("iddetallecomprobante")
);

-- CreateTable
CREATE TABLE "empresa" (
    "idempresa" SERIAL NOT NULL,
    "nombre" VARCHAR(100),
    "nit" VARCHAR(20),
    "sigla" VARCHAR(15),
    "telefono" VARCHAR(20),
    "correo" VARCHAR(50),
    "direccion" TEXT,
    "niveles" SMALLINT DEFAULT 3,
    "estado" SMALLINT DEFAULT 1,
    "idusuario" INTEGER,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("idempresa")
);

-- CreateTable
CREATE TABLE "empresamoneda" (
    "idempresamoneda" SERIAL NOT NULL,
    "cambio" DECIMAL(10,2),
    "activo" SMALLINT DEFAULT 1,
    "fecharegistro" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "idempresa" INTEGER,
    "idmonedaprincipal" INTEGER,
    "idmonedaalternativa" INTEGER,
    "idusuario" INTEGER,

    CONSTRAINT "empresamoneda_pkey" PRIMARY KEY ("idempresamoneda")
);

-- CreateTable
CREATE TABLE "gestion" (
    "idgestion" SERIAL NOT NULL,
    "nombre" VARCHAR(50),
    "fechainicio" DATE,
    "fechafin" DATE,
    "estado" SMALLINT DEFAULT 1,
    "idusuario" INTEGER,
    "idempresa" INTEGER,

    CONSTRAINT "gestion_pkey" PRIMARY KEY ("idgestion")
);

-- CreateTable
CREATE TABLE "integracion" (
    "idempresa" INTEGER NOT NULL,
    "caja" INTEGER,
    "creditofiscal" INTEGER,
    "debitofiscal" INTEGER,
    "compras" INTEGER,
    "ventas" INTEGER,
    "it" INTEGER,
    "itxpagar" INTEGER,
    "estado" SMALLINT DEFAULT 0,

    CONSTRAINT "integracion_pkey" PRIMARY KEY ("idempresa")
);

-- CreateTable
CREATE TABLE "lote" (
    "idarticulo" INTEGER NOT NULL,
    "nrolote" INTEGER NOT NULL,
    "fechaingreso" DATE,
    "fechavencimiento" DATE,
    "cantidad" INTEGER,
    "preciocompra" DECIMAL(10,2),
    "stock" INTEGER,
    "idnota" INTEGER,
    "estado" SMALLINT,

    CONSTRAINT "lote_pkey" PRIMARY KEY ("idarticulo","nrolote")
);

-- CreateTable
CREATE TABLE "moneda" (
    "idmoneda" SERIAL NOT NULL,
    "nombre" VARCHAR(30),
    "descripcion" VARCHAR(50),
    "abreviatura" VARCHAR(5),
    "idusuario" INTEGER,

    CONSTRAINT "moneda_pkey" PRIMARY KEY ("idmoneda")
);

-- CreateTable
CREATE TABLE "nota" (
    "idnota" SERIAL NOT NULL,
    "nronota" INTEGER,
    "fecha" DATE,
    "descripcion" VARCHAR(100),
    "total" DECIMAL(10,2),
    "tipo" SMALLINT,
    "idempresa" INTEGER,
    "idusuario" INTEGER,
    "idcomprobante" INTEGER,
    "estado" SMALLINT,

    CONSTRAINT "nota_pkey" PRIMARY KEY ("idnota")
);

-- CreateTable
CREATE TABLE "periodo" (
    "idperiodo" SERIAL NOT NULL,
    "nombre" VARCHAR(50),
    "fechainicio" DATE,
    "fechafin" DATE,
    "estado" SMALLINT DEFAULT 1,
    "idusuario" INTEGER,
    "idgestion" INTEGER,

    CONSTRAINT "periodo_pkey" PRIMARY KEY ("idperiodo")
);

-- CreateTable
CREATE TABLE "usuario" (
    "idusuario" SERIAL NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "usuario" VARCHAR(90) NOT NULL,
    "pass" VARCHAR(100) NOT NULL,
    "tipo" SMALLINT DEFAULT 1,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("idusuario")
);

CREATE OR REPLACE FUNCTION public.generar_cuentas_principales(id_empresa bigint, id_usuario bigint, niveles_empresa smallint)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    a_count int;
    b_count int;
    c_count int;
    id_cuenta int;
BEGIN
    INSERT INTO public.cuenta(codigo,nombre,nivel,tipocuenta,idusuario,idempresa,idcuentapadre)
    VALUES(CONCAT('1',REPEAT('.0',niveles_empresa-1)), 'Activo', 1, 0,id_usuario,id_empresa,NULL),
    (CONCAT('2',REPEAT('.0',3-1)), 'Pasivo', 1, 0,id_usuario,id_empresa,NULL),
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
$function$
;

-- CreateIndex
CREATE INDEX "fki_cuenta_idempresa_fkey" ON "cuenta"("idempresa");

-- CreateIndex
CREATE INDEX "fki_empresamoneda_idempresa_fkey" ON "empresamoneda"("idempresa");

-- AddForeignKey
ALTER TABLE "articulo" ADD CONSTRAINT "articulo_idempresa_fkey" FOREIGN KEY ("idempresa") REFERENCES "empresa"("idempresa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "articulo" ADD CONSTRAINT "articulo_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "articulocategoria" ADD CONSTRAINT "articulocategoria_idarticulo_fkey" FOREIGN KEY ("idarticulo") REFERENCES "articulo"("idarticulo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "articulocategoria" ADD CONSTRAINT "articulocategoria_idcategoria_fkey" FOREIGN KEY ("idcategoria") REFERENCES "categoria"("idcategoria") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categoria" ADD CONSTRAINT "categoria_idcategoriapadre_fkey" FOREIGN KEY ("idcategoriapadre") REFERENCES "categoria"("idcategoria") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categoria" ADD CONSTRAINT "categoria_idempresa_fkey" FOREIGN KEY ("idempresa") REFERENCES "empresa"("idempresa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "categoria" ADD CONSTRAINT "categoria_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comprobante" ADD CONSTRAINT "comprobante_idempresa_fkey" FOREIGN KEY ("idempresa") REFERENCES "empresa"("idempresa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comprobante" ADD CONSTRAINT "comprobante_idmoneda_fkey" FOREIGN KEY ("idmoneda") REFERENCES "moneda"("idmoneda") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comprobante" ADD CONSTRAINT "comprobante_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cuenta" ADD CONSTRAINT "cuenta_idcuentapadre_fkey" FOREIGN KEY ("idcuentapadre") REFERENCES "cuenta"("idcuenta") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cuenta" ADD CONSTRAINT "cuenta_idempresa_fkey" FOREIGN KEY ("idempresa") REFERENCES "empresa"("idempresa") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cuenta" ADD CONSTRAINT "cuenta_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle" ADD CONSTRAINT "detalle_idarticulo_fkey" FOREIGN KEY ("idarticulo") REFERENCES "articulo"("idarticulo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalle" ADD CONSTRAINT "detalle_idnota_fkey" FOREIGN KEY ("idnota") REFERENCES "nota"("idnota") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallecomprobante" ADD CONSTRAINT "detallecomprobante_idcomprobante_fkey" FOREIGN KEY ("idcomprobante") REFERENCES "comprobante"("idcomprobante") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallecomprobante" ADD CONSTRAINT "detallecomprobante_idcuenta_fkey" FOREIGN KEY ("idcuenta") REFERENCES "cuenta"("idcuenta") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallecomprobante" ADD CONSTRAINT "detallecomprobante_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "empresa" ADD CONSTRAINT "empresa_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "empresamoneda" ADD CONSTRAINT "empresamoneda_idempresa_fkey" FOREIGN KEY ("idempresa") REFERENCES "empresa"("idempresa") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "empresamoneda" ADD CONSTRAINT "empresamoneda_idmonedaalternativa_fkey" FOREIGN KEY ("idmonedaalternativa") REFERENCES "moneda"("idmoneda") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "empresamoneda" ADD CONSTRAINT "empresamoneda_idmonedaprincipal_fkey" FOREIGN KEY ("idmonedaprincipal") REFERENCES "moneda"("idmoneda") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "empresamoneda" ADD CONSTRAINT "empresamoneda_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gestion" ADD CONSTRAINT "gestion_idempresa_fkey" FOREIGN KEY ("idempresa") REFERENCES "empresa"("idempresa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "gestion" ADD CONSTRAINT "gestion_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "integracion" ADD CONSTRAINT "integracion_idempresa_fkey" FOREIGN KEY ("idempresa") REFERENCES "empresa"("idempresa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_idarticulo_fkey" FOREIGN KEY ("idarticulo") REFERENCES "articulo"("idarticulo") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lote" ADD CONSTRAINT "lote_idnota_fkey" FOREIGN KEY ("idnota") REFERENCES "nota"("idnota") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "moneda" ADD CONSTRAINT "moneda_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_idcomprobante_fkey" FOREIGN KEY ("idcomprobante") REFERENCES "comprobante"("idcomprobante") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_idempresa_fkey" FOREIGN KEY ("idempresa") REFERENCES "empresa"("idempresa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nota" ADD CONSTRAINT "nota_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "periodo" ADD CONSTRAINT "periodo_idgestion_fkey" FOREIGN KEY ("idgestion") REFERENCES "gestion"("idgestion") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "periodo" ADD CONSTRAINT "periodo_idusuario_fkey" FOREIGN KEY ("idusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;
