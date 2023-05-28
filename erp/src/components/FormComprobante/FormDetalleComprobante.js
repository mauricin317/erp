import _ from 'lodash'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Autocomplete from '@mui/material/Autocomplete';
import AddIcon from '@mui/icons-material/Add';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { toast } from 'react-toastify';


export default function FormDetalleComprobante(props){

   let edit_detalle = null;
   let pos = 0
   if(props.tipo == "editar"){
    edit_detalle = props.datos; 
    pos = _.findIndex(props.cuentas, ['idcuenta', props.datos.idcuenta]);
  }

    const [cuenta, setCuenta] = useState(edit_detalle == null ? null : props.cuentas[pos]);
    
    const formik = useFormik({
        initialValues: {
          glosa: edit_detalle == null ? props.glosa : edit_detalle.glosa,
          debe: edit_detalle == null ? 0 : edit_detalle.debe,
          haber: edit_detalle == null ? 0 : edit_detalle.haber,
        },
        validationSchema: Yup.object({
          debe: Yup.number().typeError('Debe ser un número').min(0,"Debe ser un número positivo").required('Requerido'),
          haber: Yup.number().typeError('Debe ser un número').min(0,"Debe ser un número positivo").required('Requerido'),
        }),
        onSubmit: async values => {
          if(cuenta != null){
            if(!(values.debe == 0 && values.haber == 0)){
              let debedecimal= Number(values.debe);
              let haberdecimal= Number(values.haber);

              let detalle = {
                "id": cuenta.idcuenta,
                "idcuenta": cuenta.idcuenta,
                "cuenta": cuenta.label,
                "glosa": values.glosa,
                "debe": debedecimal.toFixed(2),
                "haber": haberdecimal.toFixed(2)
              }
              setCuenta(null)
              props.submit(detalle);
              if(props.tipo == "nuevo"){
                //values.glosa = "";
                values.debe = 0;
                values.haber = 0;
                setCuenta(null)
              }else{
                props.close()
              }
              
            }else{
              toast.error("Campos Debe o Haber debe ser mayor a 0",{theme: "colored"})
            }
          }else{
            toast.error("Campo Cuenta es Obligatorio",{theme: "colored"})
          }
        }
      });

    return(
      <Container maxWidth="xl">
        <form onSubmit={formik.handleSubmit}>   
            <Box sx={{pb: 1, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <Typography align="center" color="black" variant="h2">
                {props.tipo === "nuevo" ? "Nuevo" : "Editar"} Detalle Comprobante
              </Typography>
            
            </Box>
            <Grid container spacing={2}>
              <Grid item md={4} xs={12}>
              <Typography>
           Cuenta
            </Typography>
                <Autocomplete
                    id="combo-box-demo"
                    name="cuenta"
                    size="small"
                    options={props.cuentas}
                    value={cuenta}
                    onChange={(event, newValue) => {
                      setCuenta(newValue);
                    }}
                    renderInput={(params) => <TextField
                        fullWidth
                        size="small"
                        margin="normal"
                        type="text"
                        variant="outlined"
                        focused
                        {...params} />}
                />
              </Grid>
              <Grid item md={4} xs={12}>
              <Typography>
           Glosa
            </Typography>
                <TextField
                  error={Boolean(formik.touched.glosa && formik.errors.glosa)}
                  fullWidth
                  helperText={formik.touched.glosa && formik.errors.glosa}
                  size="small"
                  margin="normal"
                  name="glosa"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.glosa}
                  inputProps={{
                    maxLength: 99
                  }}
                  variant="outlined"
                  focused
                />
              </Grid>
              <Grid item md={2} xs={12}>
              <Typography>
       Debe
            </Typography>
                <TextField sx={{textAlign:'right'}}
                  error={Boolean(formik.touched.debe && formik.errors.debe)}
                  fullWidth
                  helperText={formik.touched.debe && formik.errors.debe}
                  size="small"
                  margin="normal"
                  name="debe"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="number"
                  value={formik.values.debe}
                  variant="outlined"
                  focused
                  inputProps={{
                    step:".01",
                    min: 0,
                    lang:"en",
                    style: { textAlign: "right" }
                  }}
                  disabled={formik.values.haber>0}
                />
              </Grid>
              <Grid item md={2} xs={12}>
              <Typography>
       Haber
            </Typography>
                <TextField sx={{textAlign:'right'}}
                  error={Boolean(formik.touched.haber && formik.errors.haber)}
                  fullWidth
                  helperText={formik.touched.haber && formik.errors.haber}
                  size="small"
                  margin="normal"
                  name="haber"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="number"
                  value={formik.values.haber}
                  variant="outlined"
                  focused
                  inputProps={{
                    step:".01",
                    min: 0,
                    lang:"en",
                    style: { textAlign: "right" }
                  }}
                  disabled={formik.values.debe>0}
                />
              </Grid>
              
            </Grid>
            <Box sx={{ py: 1,display:'flex',justifyContent:'end' }}>
              <Button size="medium" color="success" disabled={formik.isSubmitting} type="submit" variant="contained">
              <AddIcon/>Guardar
              </Button>
              
            </Box>
          </form>
        </Container>
    )
}