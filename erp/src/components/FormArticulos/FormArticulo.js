import { useState } from "react";
import _ from "lodash";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Chip, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useFormik } from "formik";
import * as Yup from "yup";
import { editarArticulo, crearArticulo } from "../../services/Articulos";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

export default function FormArticulo(props) {
  let articulo = props.datos;
  let defaultCategorias = [];
  if (articulo != null) {
    defaultCategorias = _.filter(props.categorias, function (value) {
      if (_.includes(articulo.categorias, value.idcategoria)) return value;
    });
  }

  const [categorias, setCateorias] = useState([]);
  const formik = useFormik({
    initialValues: {
      nombre: articulo != null ? articulo.nombre : "",
      descripcion: articulo != null ? articulo.descripcion : "",
      precioventa: articulo != null ? articulo.precioventa : "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string().required("Requerido"),
      descripcion: Yup.string().required("Requerido"),
      precioventa: Yup.number()
        .typeError("Debe ser un número")
        .positive("Debe ser un número positivo")
        .required("Requerido"),
    }),
    onSubmit: async (values) => {
      if (props.tipo === "nuevo") {
        if (categorias.length <= 0) {
          toast.error("Debe seleccionar una o más categorías", {
            theme: "colored",
          });
          return;
        }
        let data = {
          nombre: values.nombre,
          descripcion: values.descripcion,
          precioventa: values.precioventa,
          categorias: categorias,
        };
        let crear = await crearArticulo(data, props.jwt);
        if (crear.ok) {
          toast.success(crear.mensaje, { theme: "colored" });
          props.submit();
          props.close();
        } else {
          toast.error(crear.mensaje, { theme: "colored" });
        }
      }
      if (props.tipo === "editar") {
        if (categorias.length <= 0) {
          toast.error("Debe seleccionar una o más categorías", {
            theme: "colored",
          });
          return;
        }
        let data = {
          nombre: values.nombre,
          descripcion: values.descripcion,
          precioventa: values.precioventa,
          categorias: categorias,
        };
        let editar = await editarArticulo(data, articulo.idarticulo, props.jwt);
        if (editar.ok) {
          toast.success(editar.mensaje, { theme: "colored" });
          props.submit();
          props.close();
        } else {
          toast.error(editar.mensaje, { theme: "colored" });
        }
      }
    },
  });

  const handleSelect = (event) => {
    const {
      target: { value },
    } = event;
    setCateorias(value);
  };

  return (
    <Container maxWidth="md">
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ pb: 1, pt: 1 }}>
          <Typography align="center" color="textSecondary" variant="h3">
            {props.tipo === "nuevo" ? "Nueva" : "Editar"} Articulo
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item md={12} xs={12}>
            <TextField
              error={Boolean(formik.touched.nombre && formik.errors.nombre)}
              fullWidth
              helperText={formik.touched.nombre && formik.errors.nombre}
              label="Nombre"
              margin="normal"
              name="nombre"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="text"
              focused
              value={formik.values.nombre}
              variant="outlined"
              inputProps={{
                maxLength: 50,
              }}
            />
          </Grid>
          <Grid item md={12} xs={12}>
            <TextField
              error={Boolean(
                formik.touched.descripcion && formik.errors.descripcion
              )}
              fullWidth
              helperText={
                formik.touched.descripcion && formik.errors.descripcion
              }
              label="Descripcion"
              margin="normal"
              name="descripcion"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="text"
              focused
              value={formik.values.descripcion}
              variant="outlined"
              inputProps={{
                maxLength: 80,
              }}
            />
          </Grid>
          <Grid item md={3} xs={12}>
            <TextField
              error={Boolean(
                formik.touched.precioventa && formik.errors.precioventa
              )}
              fullWidth
              helperText={
                formik.touched.precioventa && formik.errors.precioventa
              }
              label="Precio de Venta"
              margin="normal"
              name="precioventa"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="number"
              value={formik.values.precioventa}
              variant="outlined"
              focused
              inputProps={{
                step: ".01",
                min: 0,
                lang: "en",
                style: { textAlign: "right" },
              }}
            />
          </Grid>
          <Grid item md={9} xs={12}>
            <Autocomplete
              sx={{ mt: "16px", mb: "8px", width: "100%" }}
              multiple
              id="tags-outlined"
              options={props.categorias}
              getOptionLabel={(option) => option.nombre}
              filterSelectedOptions
              defaultValue={defaultCategorias}
              onChange={(event, newValue) => {
                setCateorias(newValue);
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={index}
                    color="success"
                    label={option.nombre}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} focused label="Categorias" />
              )}
            />
          </Grid>
        </Grid>
        <Stack
          sx={{ mt: 2 }}
          direction={"row"}
          justifyContent={"end"}
          spacing={2}
        >
          <Button
            size="large"
            color="primary"
            disabled={formik.isSubmitting}
            type="submit"
            variant="contained"
          >
            Guardar
          </Button>
          <Button
            size="large"
            color="error"
            variant="contained"
            disabled={formik.isSubmitting}
            onClick={props.close}
          >
            Cancelar
          </Button>
        </Stack>
      </form>
    </Container>
  );
}
