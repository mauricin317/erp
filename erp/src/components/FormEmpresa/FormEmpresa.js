import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

import { crearEmpresa, editarEmpresa } from '../../services/Empresas';

export default function FormEmpresa(props){

    let empresa = props.datos;
    
    const formik = useFormik({
        initialValues: {
          nombre: empresa!=null ? empresa.nombre : '',
          nit: empresa!=null ? empresa.nit : '',
          sigla: empresa!=null ? empresa.sigla : '',
          telefono: empresa!=null ? empresa.telefono : '',
          correo: empresa!=null ? empresa.correo : '',
          direccion: empresa!=null ? empresa.direccion : '',
          niveles: empresa!=null ? empresa.niveles : '3',
          moneda: empresa!=null ? empresa.empresamoneda[0].idmonedaprincipal : '1'
        },
        validationSchema: Yup.object({
          nombre: Yup.string().min(2,'Demasiado Corto').max(80, 'Demasiado Largo').required('Requerido'),
          nit:  Yup.string().required('Requerido').min(5,'Muy corto').max(20, 'Demasiado Largo'),
          sigla:  Yup.string().min(2,'Demasiado Corto').max(15, 'Demasiado Largo').required('Requerido'),
          telefono:  Yup.number().typeError('Debe ser numérico').positive('Debe ser un número positivo').integer('Debe ser un número entero').max(10000000000000,'Muy largo'),
          correo:  Yup.string().email('Correo Inválido').max(50, 'Demasiado Largo'),
          direccion:  Yup.string().max(150, 'Demasiado Largo')
        }),
        onSubmit: async values => {
          if(props.tipo === "nuevo"){
            let crear = await crearEmpresa(values, props.jwt);
            if(crear.ok){
              props.submit();
              toast.success(crear.mensaje,{theme: "colored"});
              props.close();
            }else{
              toast.error(crear.mensaje,{theme: "colored"});
            }
            
          }
          if(props.tipo === "editar"){
            let editar = await editarEmpresa(values,empresa.idempresa,props.jwt);
            if(editar.ok){
              props.submit();
              toast.success(editar.mensaje,{theme: "colored"});
              props.close();
            }else{
              toast.error(editar.mensaje,{theme: "colored"});
            }
          }
          
        }
      });
    return(
      <Container maxWidth="md">
        <form onSubmit={formik.handleSubmit} >   
            <Box sx={{pb: 1,pt: 3}}>
              <Typography align="center" color="textSecondary" variant="h3">
                {props.tipo === "nuevo" ? "Crear" : "Editar"} Empresa
              </Typography>
            </Box>
            <Grid container spacing={1}>
              <Grid item md={9} xs={12}>
              <Typography>
            Nombre
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
                  inputProps={
                    {maxLength: 80}
                  }
                />
              </Grid>
              <Grid item md={3} xs={12}>
              <Typography>
NIT
            </Typography>
                <TextField
                  error={Boolean(formik.touched.nit && formik.errors.nit)}
                  fullWidth
                  helperText={formik.touched.nit && formik.errors.nit}
                 
                  margin="normal"
                  name="nit"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.nit}
                  variant="outlined"
                  inputProps={
                    {maxLength: 20}
                  }
                />
              </Grid>
              <Grid item md={4} xs={12}>
              <Typography>
Niveles
            </Typography>
                <TextField
                  fullWidth
                  error={Boolean(formik.touched.niveles && formik.errors.niveles)}
                  helperText={formik.touched.niveles && formik.errors.niveles}
                
                  margin="normal"
                  name="niveles"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  select
                  disabled={props.tipo === "editar"}
                  value={formik.values.niveles}
                  variant="outlined"
                >
                  <MenuItem value={3} >3</MenuItem>
                  <MenuItem value={4} >4</MenuItem>
                  <MenuItem value={5} >5</MenuItem>
                  <MenuItem value={6} >6</MenuItem>
                  <MenuItem value={7} >7</MenuItem>
                </TextField>
              </Grid>
              <Grid item md={4} xs={12}>
              <Typography>
Sigla
            </Typography>
                <TextField
                  error={Boolean(formik.touched.sigla && formik.errors.sigla)}
                  fullWidth
                  helperText={formik.touched.sigla && formik.errors.sigla}
              
                  margin="normal"
                  name="sigla"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.sigla}
                  variant="outlined"
                  inputProps={
                    {maxLength: 15}
                  }
                />
              </Grid>
              <Grid item md={4} xs={12}>
              <Typography>
Monedaa Principal
            </Typography>
                <TextField
                  fullWidth
                  error={Boolean(formik.touched.moneda && formik.errors.moneda)}
                  helperText={formik.touched.moneda && formik.errors.moneda}
              
                  margin="normal"
                  name="moneda"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  disabled={props.tipo === "editar" && empresa.empresamoneda[0].idmonedaalternativa != null}
                  select
                  value={formik.values.moneda}
                  variant="outlined"
                >
                  {props.monedas.map((option,i) => (
                    <MenuItem key={option.idmoneda} value={option.idmoneda}>
                      {option.nombre+" - "+option.abreviatura}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>             
              <Grid item md={6} xs={12}>
              <Typography>
Telefono
            </Typography>
                <TextField
                  fullWidth
                  error={Boolean(formik.touched.telefono && formik.errors.telefono)}
                  helperText={formik.touched.telefono && formik.errors.telefono}
                
                  margin="normal"
                  name="telefono"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.telefono}
                  variant="outlined"
                  inputProps={
                    {maxLength: 14}
                  }
                  
                />
              </Grid>
              
              <Grid item md={6} xs={12}>
              <Typography>
Correo
            </Typography>
                <TextField
                  fullWidth
                  error={Boolean(formik.touched.correo && formik.errors.correo)}
                  helperText={formik.touched.correo && formik.errors.correo}
                
                  margin="normal"
                  name="correo"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="email"
                  value={formik.values.correo}
                  variant="outlined"
                  inputProps={
                    {maxLength: 50}
                  }
                />
              </Grid>
              
              <Grid item md={12} xs={12}>
              <Typography>
Direccion
            </Typography>
                <TextField
                  fullWidth
                  error={Boolean(formik.touched.direccion && formik.errors.direccion)}
         
                  helperText={formik.touched.direccion && formik.errors.direccion}
     
                  margin="normal"
                  name="direccion"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.direccion}
                  variant="outlined"
                  
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