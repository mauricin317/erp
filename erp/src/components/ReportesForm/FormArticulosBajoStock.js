import Button from "@mui/material/Button";
import { TextField } from "@mui/material";
import { MenuItem } from "@mui/material";
import { Container, Box, Grid } from "@mui/material";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import { useFormik } from "formik";
import Typography from "@mui/material/Typography";

import * as Yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

function FormArticulosBajoStock(props) {
  const formik = useFormik({
    initialValues: {
      idcategoria: "",
      cantidad: "0",
    },
    validationSchema: Yup.object({
      idcategoria: Yup.number().required("Requerido"),
      cantidad: Yup.number().required("Requerido"),
    }),
    onSubmit: async (values) => {
      openReport(values.idcategoria, values.cantidad, props.idempresa);
    },
  });

  const openReport = (idcategoria, cantidad, idempresa) => {
    window.open(
      `http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2Freports&reportUnit=%2Freports%2FLibroDiario&standAlone=true&idcategoria=${idcategoria}&cantidad=${cantidad}&idempresa=${idempresa}&j_username=joeuser&j_password=123&sessionDecorator=no`,
      "_blank"
    );
  };

  return (
    <Container maxWidth="md">
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item md={10} xs={12}>
            <Typography>Categoria</Typography>
            <TextField
              fullWidth
              error={Boolean(
                formik.touched.idcategoria && formik.errors.idcategoria
              )}
              helperText={
                formik.touched.idcategoria && formik.errors.idcategoria
              }
              margin="normal"
              name="idcategoria"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              select
              focused
              value={formik.values.idcategoria}
              variant="outlined"
            >
              {props.categorias.map((option, i) => (
                <MenuItem key={option.idcategoria} value={option.idcategoria}>
                  {option.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item md={10} xs={12}>
            <Typography>Cantidad</Typography>
            <TextField
              fullWidth
              margin="normal"
              name="cantidad"
              error={Boolean(formik.touched.cantidad && formik.errors.cantidad)}
              helperText={formik.touched.cantidad && formik.errors.cantidad}
              type="number"
              focused
              required
              size="small"
              onChange={formik.handleChange}
              value={formik.values.cantidad}
              variant="outlined"
              inputProps={{
                min: 1,
              }}
            />
          </Grid>
          <Grid
            item
            md={10}
            xs={12}
            sx={{
              justifyContent: "center",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <Button
              sx={{ color: "white" }}
              fullWidth
              size="large"
              color="info"
              type="submit"
              variant="contained"
            >
              <AssignmentRoundedIcon />
              Reporte
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default FormArticulosBajoStock;
