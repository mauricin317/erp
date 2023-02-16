import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import { MenuItem } from '@mui/material';
import Box from '@mui/system/Box';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

async function crearEmpresamoneda(datos) {
  return fetch('http://localhost:3000/api/empresamonedas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
    .then(result => result.json())
 }

function MonedasForm(props) {
    let datos = props.datos
    const formik = useFormik({
        initialValues: {
          monedaalternativa: datos.idmonedaalternativa != null ? datos.idmonedaalternativa : '',
          cambio: datos != null ? datos.cambio : 0,
        },
        validationSchema: Yup.object({
            monedaalternativa: Yup.number().required('Requerido'),
            cambio: Yup.number().typeError('Debe ser un número').positive('Debe ser un número positivo').required('Requerido'),
        }),
        onSubmit: async values => {
          if(values.monedaalternativa === datos.idmonedaalternativa && values.cambio === datos.cambio){
            toast.error("Debe modificar los datos para guardar un nuevo registro",{theme: "colored"});
          }else{
            let d ={
              idempresamoneda: datos.id,
              idmonedaalternativa: values.monedaalternativa,
              cambio: values.cambio
            }
            let crear = await crearEmpresamoneda(d);
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
            <Stack direction="row" spacing={2} justifyContent={'center'}>
                <TextField 
                sx={{margin:0}}
                label="Moneda Principal"
                margin="normal"
                name="monedaprincipal"
                type="text"
                value={datos != null ? datos.monedaprincipal : ''}
                variant="outlined"
                inputProps={
                  {disabled: true}
                }
                 />
                <TextField
                sx={{width:'250px'}}
                error={Boolean(formik.touched.monedaalternativa && formik.errors.monedaalternativa)}
                helperText={formik.touched.monedaalternativa && formik.errors.monedaalternativa}
                label="Moneda Alternativa"
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
                <TextField sx={{textAlign:'right'}}
                error={Boolean(formik.touched.cambio && formik.errors.cambio)}
                helperText={formik.touched.cambio && formik.errors.cambio}
                label="Tipo de Cambio"
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
              <Box sx={{justifyContent:'end' ,display: "inline-flex", alignItems: "center"}}>
                <Button sx={{height:"52px"}} color="primary"  type="submit" variant="contained"><AddCircleRoundedIcon /></Button>
              </Box>
            </Stack>
            
            </form>
            
    </Box> );
}

export default MonedasForm;