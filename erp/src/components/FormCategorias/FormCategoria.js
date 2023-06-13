import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { useFormik } from "formik";
import * as Yup from "yup";
import { editarCategoria, crearCategoria } from "../../services/Categorias";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

export default function FormCategoria(props) {
  let categoria = props.datos;

  let generarNuevo = (values) => {
    let categoriaObj = {};
    if (categoria != undefined) {
      categoriaObj = {
        nombre: values.nombre,
        descripcion: values.descripcion,
        idcategoriapadre: categoria.dataObj.idcategoria,
      };
    } else {
      categoriaObj = {
        nombre: values.nombre,
        descripcion: values.descripcion,
        idcategoriapadre: null,
      };
    }
    return categoriaObj;
  };

  const formik = useFormik({
    initialValues: {
      nombre: props.tipo === "editar" ? categoria.dataObj.nombre : "",
      descripcion: props.tipo === "editar" ? categoria.dataObj.descripcion : "",
    },
    validationSchema: Yup.object({
      nombre: Yup.string().max(50, "Demasiado Largo").required("Requerido"),
      descripcion: Yup.string()
        .max(100, "Demasiado Largo")
        .required("Requerido"),
    }),
    onSubmit: async (values) => {
      if (props.tipo === "nuevo") {
        let crear = await crearCategoria(generarNuevo(values), props.jwt);
        if (crear.ok) {
          props.submit();
          props.close();
        } else {
          toast.error(crear.mensaje, { theme: "colored" });
        }
      }

      if (props.tipo === "editar") {
        let editar = await editarCategoria(
          values,
          categoria.dataObj.idcategoria,
          props.jwt
        );
        if (editar.ok) {
          props.submit();
          props.close();
        } else {
          toast.error(editar.mensaje, { theme: "colored" });
        }
      }
    },
  });

  return (
    <Container maxWidth="md">
      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ pb: 1, pt: 3 }}>
          <Typography align="center" color="textSecondary" variant="h5">
            {props.tipo === "nuevo" ? "Nueva" : "Editar"} Categoría
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item md={12} xs={12}>
          <Typography>
              Nombre de Categoria
            </Typography>
            <TextField
              error={Boolean(formik.touched.nombre && formik.errors.nombre)}
              fullWidth
              helperText={formik.touched.nombre && formik.errors.nombre}
             
              margin="normal"
              name="nombre"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="text"
              value={formik.values.nombre}
              variant="outlined"
              focused
            />
          </Grid>
          <Grid item md={12} xs={12}>
          <Typography>
              Descripcion
            </Typography>
            <TextField
              error={Boolean(
                formik.touched.descripcion && formik.errors.descripcion
              )}
              fullWidth
              helperText={
                formik.touched.descripcion && formik.errors.descripcion
              }
           
              margin="normal"
              name="descripcion"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="text"
              value={formik.values.descripcion}
              variant="outlined"
              focused
            />
          </Grid>
        </Grid>
        <Box sx={{ py: 2, display: "flex", justifyContent: "end" }}>
          <Button
            sx={{ mx: 3 }}
            size="large" color="success"
            disabled={formik.isSubmitting}
            type="submit"
            variant="contained"
          >
            Guardar
          </Button>
          <Button
            sx={{ mx: 3 }}
            size="large"
            color="error"
            variant="contained"
            disabled={formik.isSubmitting}
            onClick={props.close}
          >
            Cancelar
          </Button>
        </Box>
      </form>
    </Container>
  );
}
