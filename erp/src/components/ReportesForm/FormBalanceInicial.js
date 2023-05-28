import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import { MenuItem } from '@mui/material';
import { Container,Box, Grid } from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import { useFormik } from 'formik';
import Typography from '@mui/material/Typography';

import * as Yup from 'yup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';


function FormBalanceInicial(props) {
    const formik = useFormik({
        initialValues: {
          idgestion: '',
          idmoneda: '',
        },
        validationSchema: Yup.object({
          idgestion: Yup.number().required('Requerido'),
          idmoneda: Yup.number().required('Requerido')
        }),
        onSubmit: values => {
          
        }
      });

      

    return ( 
        <Container maxWidth="md">
            <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item md={10} xs={12}>
              <Typography>
              Gestion
            </Typography>
                <TextField
                    fullWidth
                    error={Boolean(formik.touched.idgestion && formik.errors.idgestion)}
                    helperText={formik.touched.idgestion && formik.errors.idgestion}
                  
                    margin="normal"
                    name="idgestion"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    select
                    focused
                    value={formik.values.idgestion}
                    variant="outlined" >
                        {props.gestiones.map((option,i) => (
                            <MenuItem key={option.idgestion} value={option.idgestion}>
                                {option.nombre}
                            </MenuItem> 
                        ))}
                        
                    </TextField>
              </Grid>
              <Grid item md={10} xs={12}>
              <Typography>
              Moneda
            </Typography>
              <TextField
                fullWidth
                error={Boolean(formik.touched.idmoneda && formik.errors.idmoneda)}
                helperText={formik.touched.idmoneda && formik.errors.idmoneda}
             
                margin="normal"
                name="idmoneda"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                select
                focused
                value={formik.values.idmoneda}
                variant="outlined" >
                    {props.monedas.map((option,i) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.nombre}
                            </MenuItem> 
                    ))} 
                </TextField> 
              </Grid>
              <Grid item md={10} xs={12} sx={{justifyContent:'center' ,display: "inline-flex", alignItems: "center"}}>
                <Button sx={{color:"white"}} fullWidth size="large" color="info" type="submit" variant="contained"><AssignmentRoundedIcon />Reporte</Button>
              </Grid>
            </Grid>
            
                

        </form>
    </Container> );
}


export default FormBalanceInicial;