import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import {useState} from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from 'react-toastify';

import { crearPeriodo, editarPeriodo } from '../../services/Periodos'

export default function FormPeriodo(props){
    let periodo = props.datos
    const formik = useFormik({
        initialValues: {
          idgestion: props.idgestion,
          nombre: periodo!=null?periodo.nombre:'',
          fechainicio: periodo!=null?formatInTimeZone(periodo.fechainicio, 'UTC', 'yyy-MM-dd'):'',
          fechafin: periodo!=null?formatInTimeZone(periodo.fechafin, 'UTC', 'yyy-MM-dd'):'',
        },
        validationSchema: Yup.object({
          nombre: Yup.string().min(2,'Demasiado Corto').max(30, 'Demasiado Largo').required('Requerido'),
          fechainicio: Yup.date().required('Requerido'),
          fechafin: Yup.date().required('Requerido'),
        }),
        onSubmit: async values => {
          if(values.fechainicio < values.fechafin){
            if(props.tipo === "nuevo"){
              let crear = await crearPeriodo(values, props.jwt);
              if(crear.ok){
                props.submit();
                props.close();
              }else{
                toast.error(crear.mensaje,{theme: "colored"});
              }
              
            }
            if(props.tipo === "editar"){
              let editar = await editarPeriodo(values, periodo.idperiodo, props.jwt);
              if(editar.ok){
                props.submit();
                props.close();
              }else{
                toast.error(editar.mensaje,{theme: "colored"});
              }
            }
          }else{
            toast.error("La fecha de inicio debe ser anterior a la fecha fin",{theme: "colored"});
          }
        }
      });

    return(
      <Container maxWidth="md">
        <form onSubmit={formik.handleSubmit}>   
            <Box sx={{pb: 1,pt: 3}}>
              <Typography align="center" color="textSecondary" variant="h5">
                {props.tipo === "nuevo" ? "Creaar" : "Editar"} Periodo
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item md={12} xs={12}>
                    <Typography>
              Nombre de Periodo
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
              <Grid item md={6} xs={12}>
              <Typography>
              Fecha de Inicio
            </Typography>
                <TextField
                  error={Boolean(formik.touched.fechainicio && formik.errors.fechainicio)}
                  fullWidth
                  helperText={formik.touched.fechainicio && formik.errors.fechainicio}
                
                  margin="normal"
                  name="fechainicio"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="date"
                  value={formik.values.fechainicio}
                  InputProps={{inputProps: { min: `${props.mindate}`, max: `${props.maxdate}`} }}
                  variant="outlined"
                  focused
                />
              </Grid>
              <Grid item md={6} xs={12}>
              <Typography>
              Fecha de Fin
            </Typography>
                <TextField
                  error={Boolean(formik.touched.fechafin && formik.errors.fechafin)}
                  fullWidth
                  helperText={formik.touched.fechafin && formik.errors.fechafin}
               
                  margin="normal"
                  name="fechafin"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="date"
                  value={formik.values.fechafin}
                  InputProps={{inputProps: { min: `${props.mindate}`, max: `${props.maxdate}`} }}
                  variant="outlined"
                  focused
                />
              </Grid>
            </Grid>
            <Box sx={{ py: 2,display:'flex',justifyContent:'end' }}>
              <Button sx={{mx: 3}} size="large" color="success" disabled={formik.isSubmitting} type="submit" variant="contained">
                Guardar
              </Button>
              <Button sx={{mx: 3}} size="large" color="error" variant="contained" disabled={formik.isSubmitting}  onClick={props.close}>Cancelar</Button>
            </Box>
          </form>
        </Container>
    )
}