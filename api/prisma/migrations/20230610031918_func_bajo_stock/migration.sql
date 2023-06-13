CREATE OR REPLACE FUNCTION public.articulos_bajo_stock_chart(id_empresa integer, id_categoria integer, max_cantidad integer) RETURNS TABLE(idarticulo integer, nombre character varying, cantidad integer)
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
