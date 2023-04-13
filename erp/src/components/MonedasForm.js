import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import { MenuItem } from '@mui/material';
import Box from '@mui/system/Box';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';
import { crearEmpresamoneda } from '../services/EmpresaMonedas';
import Grid from '@mui/material/Grid';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { useEffect } from 'react';


function MonedasForm(props) {
    let datos = props.datos

    useEffect(()=>{
      formik.setValues({
        monedaalternativa: datos != null ? datos?.idmonedaalternativa : '',
          cambio: datos != null ? datos?.cambio : 0,
      })
    },[props])
    const formik = useFormik({
        initialValues: {
          monedaalternativa: datos != null ? datos?.idmonedaalternativa : '',
          cambio: datos != null ? datos?.cambio : 0,
        },
        validationSchema: Yup.object({
            monedaalternativa: Yup.number().required('Requerido'),
            cambio: Yup.number().typeError('Debe ser un número').positive('Debe ser un número positivo').required('Requerido'),
        }),
        onSubmit: async values => {
          if(values.monedaalternativa === datos.idmonedaalternativa && values.cambio === Number(datos.cambio)){
            toast.error("Debe modificar los datos para guardar un nuevo registro",{theme: "colored"});
          }else{
            let data ={
              idempresamoneda: datos.id,
              idmonedaalternativa: values.monedaalternativa,
              cambio: values.cambio
            }
            let crear = await crearEmpresamoneda(data, props.jwt);
              if(crear.ok){
                props.submit();
                toast.success("Creado con éxito",{theme: "colored"});
              }else{
                toast.error(crear.mensaje,{theme: "colored"});
              }
          }
        }
      });

    return ( 
        <Box  textAlign={'center'} sx={{mb:2}}>
            <form onSubmit={formik.handleSubmit}>
            <Stack direction="row" spacing={2} justifyContent={'center'} alignItems={"flex-start"}>
            <Typography sx={{textAlign:'center',paddingTop:'15px'}}>
              Moneda Principal:
            </Typography>
                <TextField 
                sx={{width:'150px'}}
                margin="normal"
                name="monedaprincipal"
                type="text"
                value={datos != null ? datos?.monedaprincipal : ''}
                variant="outlined"
                inputProps={
                  {disabled: true}
                }
                 />
                      <Typography sx={{textAlign:'center',paddingTop:'15px'}}>
              Moneda Alternativa:
            </Typography>
                <TextField
                sx={{width:'150px'}}
                error={Boolean(formik.touched.monedaalternativa && formik.errors.monedaalternativa)}
                helperText={formik.touched.monedaalternativa && formik.errors.monedaalternativa}
            
                margin="normal"
                name="monedaalternativa"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                select
                inputProps={
                  {disabled: props.readOnly}
                }
                focused={!props.readOnly}
                value={formik.values.monedaalternativa}
                variant="outlined" >
                  {props.monedas.map((option,i) => (
                    option.idmoneda != datos.idmonedaprincipal ?  
                    <MenuItem key={option.idmoneda} value={option.idmoneda}>
                      {option.nombre}
                    </MenuItem> : ''
                  ))}
                    
                </TextField>    
          
                <Typography sx={{textAlign:'center',paddingTop:'15px'}}>
              Tipo de Cambio:
            </Typography>
                <TextField sx={{width:'150px'}}
                error={Boolean(formik.touched.cambio && formik.errors.cambio)}
                helperText={formik.touched.cambio && formik.errors.cambio}
                margin="normal"
                name="cambio"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                type="number"
                value={formik.values.cambio}
                variant="outlined"
                focused
                inputProps={{
                  step:".01",
                  min: 0,
                  lang:"en",
                  style: { textAlign: "right" }
                }}
                />

                <Button sx={{height:'55px'}}  size="large" color="success" type="submit" variant="contained">Guardar</Button>

            </Stack>
            
            </form>
            
    </Box> );
}

export default MonedasForm;