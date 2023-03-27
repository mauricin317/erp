import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { editarCuenta, crearCuenta } from '../../services/Cuentas';
import 'react-toastify/dist/ReactToastify.min.css';

export default function FormGestion(props){

    let cuenta = props.datos
    
    let generarNuevo = (values) => {
        let cuentaObj = {}
        if(cuenta != undefined) {
            let nuevoNivel = cuenta.dataObj.nivel+1
            let codigo = cuenta.dataObj.codigo
            let primerCodigo = (codigo.split('.').map((num, i) => i==(nuevoNivel-1)? "1": num)).join('.')
            cuentaObj ={
                codigo: primerCodigo,
                nombre:values.nombre,
                nivel:nuevoNivel,
                tipocuenta: nuevoNivel === props.niveles ? 1 : 0,
                idcuentapadre:cuenta.dataObj.idcuenta
            }

        }else{
            let codigo = Array(props.niveles).fill(0)
            let primerCodigo = (codigo.map((num, i) => i==(0)? "1": num)).join('.')
            cuentaObj ={
                codigo: primerCodigo,
                nombre:values.nombre,
                nivel:1,
                tipocuenta:0,
                idcuentapadre:null
            }
        }
        return cuentaObj;
    }

    const formik = useFormik({
        initialValues: {
          nombre: props.tipo==='editar'? cuenta.dataObj.nombre : ''
        },
        validationSchema: Yup.object({
          nombre: Yup.string().min(2,'Demasiado Corto').max(50, 'Demasiado Largo').required('Requerido')
        }),
        onSubmit: async values => {
            if(props.tipo === "nuevo"){
              let crear = await crearCuenta(generarNuevo(values), props.jwt);
              if(crear.ok){
                props.submit(cuenta);
                props.close();
              }else{
                toast.error(crear.mensaje,{theme: "colored"});
              }
            }

            if(props.tipo === "editar"){
              let editar = await editarCuenta(values,cuenta.dataObj.idcuenta, props.jwt);
              if(editar.ok){
                props.submit();
                props.close();
              }else{
                toast.error(editar.mensaje,{theme: "colored"}); 
              }
            } 
        }
      });

    return(
      <Container maxWidth="md">
        <form onSubmit={formik.handleSubmit}>   
            <Box sx={{pb: 1,pt: 3}}>
              <Typography align="center" color="textSecondary" variant="h5">
                {props.tipo === "nuevo" ? "Nueva" : "Editar"} Cuenta
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