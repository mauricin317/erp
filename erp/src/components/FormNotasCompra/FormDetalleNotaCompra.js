import _, { values } from 'lodash'
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Autocomplete from '@mui/material/Autocomplete';
import { formatInTimeZone } from 'date-fns-tz';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { toast } from 'react-toastify';


export default function FormDetalleNotaCompra(props){

   let edit_detalle = null;
   let pos = 0
   if(props.tipo == "editar"){
    edit_detalle = props.datos; 
    pos = _.findIndex(props.articulos, ['idarticulo', props.datos.idarticulo]);
  }

    const [articulo, setArticulo] = useState(edit_detalle == null ? null : props.articulos[pos]);
    const formik = useFormik({
        initialValues: {
          fechavencimiento: edit_detalle == null ? '' : edit_detalle.fechavencimiento != '' ? formatInTimeZone(edit_detalle.fechavencimiento, 'UTC', 'yyy-MM-dd') : '',
          cantidad: edit_detalle == null ? '' : edit_detalle.cantidad,
          preciocompra: edit_detalle == null ? '' : edit_detalle.preciocompra,
        },
        validationSchema: Yup.object({
          fechavencimiento: Yup.date(),
          cantidad: Yup.number().typeError('Debe ser un número').integer('Debe ser un número entero').min(0,"Debe ser un número positivo").required('Requerido'),
          preciocompra: Yup.number().typeError('Debe ser un número').min(0,"Debe ser un número positivo").required('Requerido'),
        }),
        onSubmit: async values => {
          if(articulo != null){
              let preciocompra= Number(values.preciocompra);
              let subtotal = (values.cantidad*preciocompra).toFixed(2)
              let detalle = {
                "id": articulo.idarticulo,
                "idarticulo": articulo.idarticulo,
                "nombre": articulo.nombre,
                "fechavencimiento": values.fechavencimiento,
                "cantidad": values.cantidad,
                "preciocompra": preciocompra.toFixed(2),
                "subtotal": subtotal
              }
              props.submit(detalle);
              if(props.tipo == "nuevo"){
                //values.glosa = "";
                values.fechavencimiento = ''
                values.cantidad = '';
                values.preciocompra = '';
                setArticulo(null)
              }else{
                props.close()
              }
          }else{
            toast.error("Campo Articulo es Obligatorio",{theme: "colored"})
          }
        }
      });

    return(
      <Container maxWidth="xl">
        <form onSubmit={formik.handleSubmit}>   
            <Box sx={{pb: 1, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
              <Typography align="center" color="textSecondary" variant="h5">
                {props.tipo === "nuevo" ? "Agregar" : "Editar"} Articulo
              </Typography>
              <Button size="large" color="error" variant="contained" disabled={formik.isSubmitting}  onClick={props.close}>X</Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item md={4} xs={12}>
                <Autocomplete
                    id="combo-box-demo"
                    name="articulo"
                    options={props.articulos}
                    value={articulo}
                    getOptionLabel={(option) => option.nombre}
                    onChange={(event, newValue) => {
                      setArticulo(newValue);
                    }}
                    renderInput={(params) => <TextField
                        fullWidth
                        label="Articulo"
                        margin="normal"
                        type="text"
                        variant="outlined"
                        focused
                        {...params} />}
                />
              </Grid>
              <Grid item md={2} xs={12}>
                <TextField
                  error={Boolean(formik.touched.fechavencimiento && formik.errors.fechavencimiento)}
                  fullWidth
                  helperText={formik.touched.fechavencimiento && formik.errors.fechavencimiento}
                  label="Fecha Vencimiento"
                  margin="normal"
                  name="fechavencimiento"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="date"
                  value={formik.values.fechavencimiento}
                  variant="outlined"
                  focused
                />
              </Grid>
              <Grid item md={2} xs={12}>
                <TextField sx={{textAlign:'right'}}
                  error={Boolean(formik.touched.cantidad && formik.errors.cantidad)}
                  fullWidth
                  helperText={formik.touched.cantidad && formik.errors.cantidad}
                  label="Cantidad"
                  margin="normal"
                  name="cantidad"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="number"
                  value={formik.values.cantidad}
                  variant="outlined"
                  focused
                  inputProps={{
                    step:"1",
                    min: 0,
                    lang:"en",
                    style: { textAlign: "right" }
                  }}
                />
              </Grid>
              <Grid item md={2} xs={12}>
                <TextField sx={{textAlign:'right'}}
                  error={Boolean(formik.touched.preciocompra && formik.errors.preciocompra)}
                  fullWidth
                  helperText={formik.touched.preciocompra && formik.errors.preciocompra}
                  label="Precio"
                  margin="normal"
                  name="preciocompra"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="number"
                  value={formik.values.preciocompra}
                  variant="outlined"
                  focused
                  inputProps={{
                    step:".01",
                    min: 0,
                    lang:"en",
                    style: { textAlign: "right" }
                  }}
                />
              </Grid>
              <Grid item md={2} xs={12}>
                <TextField sx={{textAlign:'right'}}
                  fullWidth
                  label="Subtotal"
                  margin="normal"
                  name="subtotal"
                  type="number"
                  value={Number(formik.values.cantidad*formik.values.preciocompra).toFixed(2)}
                  variant="outlined"
                  disabled
                  inputProps={{
                    step:".01",
                    min: 0,
                    lang:"en",
                    style: { textAlign: "right" }
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ py: 1,display:'flex',justifyContent:'end' }}>
              <Button size="large" color="primary" disabled={formik.isSubmitting} type="submit" variant="contained">
                Guardar
              </Button>
              
            </Box>
          </form>
        </Container>
    )
}