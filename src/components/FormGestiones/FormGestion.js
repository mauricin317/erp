import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { formatInTimeZone } from 'date-fns-tz';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

async function crearGestion(datos) {
  return fetch('http://localhost:3000/api/gestiones', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
    .then(result => result.json())
 }

 async function editarGestion(datos, idgestion) {
  return fetch(`http://localhost:3000/api/gestiones/${idgestion}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
    .then(result => result.json())
 }

export default function FormGestion(props){

    let gestion = props.datos
    

    const formik = useFormik({
        initialValues: {
          nombre: gestion!=null?gestion.nombre:'',
          fechainicio: gestion!=null?formatInTimeZone(gestion.fechainicio, 'America/La_Paz', 'yyy-MM-dd'):'',
          fechafin: gestion!=null?formatInTimeZone(gestion.fechafin, 'America/La_Paz', 'yyy-MM-dd'):'',
        },
        validationSchema: Yup.object({
          nombre: Yup.string().min(2,'Demasiado Corto').max(30, 'Demasiado Largo').required('Requerido'),
          fechainicio: Yup.date().required('Requerido'),
          fechafin: Yup.date().required('Requerido'),
        }),
        onSubmit: async values => {
          if(values.fechainicio < values.fechafin){
            if(props.tipo === "nuevo"){
              let crear = await crearGestion(values);
              if(crear.ok){
                props.submit();
                props.close();
              }else{
                toast.error(crear.mensaje,{theme: "colored"});
              }
              
            }
            if(props.tipo === "editar"){
              let editar = await editarGestion(values,gestion.id);
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
                {props.tipo === "nuevo" ? "Nueva" : "Editar"} Gestion
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
                  value={formik.values.nombre}
                  variant="outlined"
                  focused
                />
              </Grid>
              <Grid item md={12} xs={12}>
                <TextField
                  error={Boolean(formik.touched.fechainicio && formik.errors.fechainicio)}
                  fullWidth
                  helperText={formik.touched.fechainicio && formik.errors.fechainicio}
                  label="Fecha de Inicio"
                  margin="normal"
                  name="fechainicio"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="date"
                  value={formik.values.fechainicio}
                  variant="outlined"
                  focused
                />
              </Grid>
              <Grid item md={12} xs={12}>
                <TextField
                  error={Boolean(formik.touched.fechafin && formik.errors.fechafin)}
                  fullWidth
                  helperText={formik.touched.fechafin && formik.errors.fechafin}
                  label="Fecha de Fin"
                  margin="normal"
                  name="fechafin"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="date"
                  value={formik.values.fechafin}
                  variant="outlined"
                  focused
                />
              </Grid>
            </Grid>
            <Box sx={{ py: 2,display:'flex',justifyContent:'end' }}>
              <Button sx={{mx: 3}} size="large" color="primary" disabled={formik.isSubmitting} type="submit" variant="contained">
                Guardar
              </Button>
              <Button sx={{mx: 3}} size="large" color="error" variant="contained" disabled={formik.isSubmitting}  onClick={props.close}>Cancelar</Button>
            </Box>
          </form>
          
        </Container>
    )
}