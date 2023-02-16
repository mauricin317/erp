import Button from '@mui/material/Button';
import { TextField } from '@mui/material';
import { MenuItem } from '@mui/material';
import { Container,Box, Grid } from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import _ from 'lodash';
import * as Yup from 'yup';
import 'react-toastify/dist/ReactToastify.min.css';


function FormLibroMayor(props) {
    const formik = useFormik({
        initialValues: {
          idgestion: '',
          idperiodo: '',
          idmoneda: '',
        },
        validationSchema: Yup.object({
          idgestion: Yup.number().required('Requerido'), 
          idperiodo: Yup.number().required('Requerido'),
          idmoneda: Yup.number().required('Requerido')
        }),
        onSubmit: async values => {
          console.log("Values",values)
          console.log("Periodos",props.periodos)
          if(values.idperiodo!=0){
            openReportP(0,values.idperiodo ,values.idmoneda)
          }else{
            let _periodo = _.find(props.periodos,{ 'idgestion':values.idgestion })
           openReportT(values.idgestion,_periodo.idperiodo ,values.idmoneda)
          }
        }
      });

      const openReportP= (idgestion, idperiodo, idmoneda) =>{
        window.open(`http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2Freports&reportUnit=%2Freports%2FLibroMayorP&standAlone=true&id_gestion=${idgestion}&id_periodo=${idperiodo}&id_moneda=${idmoneda}&j_username=joeuser&j_password=123&sessionDecorator=no`, '_blank');
      }
      const openReportT= (idgestion, idperiodo, idmoneda) =>{
        window.open(`http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2Freports&reportUnit=%2Freports%2FLibroMayorT&standAlone=true&id_gestion=${idgestion}&id_periodo=${idperiodo}&id_moneda=${idmoneda}&j_username=joeuser&j_password=123&sessionDecorator=no`, '_blank');
      }

    return ( 
        <Container maxWidth="md">
            <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
            <Grid item md={3} xs={12}>
              <TextField
                fullWidth
                error={Boolean(formik.touched.idgestion && formik.errors.idgestion)}
                helperText={formik.touched.idgestion && formik.errors.idgestion}
                label="Gestion"
                margin="normal"
                name="idgestion"
                onBlur={formik.handleBlur}
                onChange={(e) => {formik.setFieldValue("idperiodo",'');formik.handleChange(e)}}
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
              <Grid item md={3} xs={12}>
                <TextField
                    fullWidth
                    error={Boolean(formik.touched.idperiodo && formik.errors.idperiodo)}
                    helperText={formik.touched.idperiodo && formik.errors.idperiodo}
                    label="Periodo"
                    margin="normal"
                    name="idperiodo"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    select
                    focused
                    value={formik.values.idperiodo}
                    variant="outlined" >
                    {formik.values.idgestion!=''?<MenuItem key={0} value={0}>Todos</MenuItem>:''}
                    {props.periodos.map((option,i) => (
                        option.idgestion == formik.values.idgestion ?
                            <MenuItem key={option.idperiodo} value={option.idperiodo}>
                                {option.nombre}
                            </MenuItem> : ''
                        ))} 
                        
                    </TextField>
              </Grid>
              
              <Grid item md={3} xs={12}>
              <TextField
                fullWidth
                error={Boolean(formik.touched.idmoneda && formik.errors.idmoneda)}
                helperText={formik.touched.idmoneda && formik.errors.idmoneda}
                label="Moneda"
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
              <Grid item md={3} xs={12} sx={{justifyContent:'center' ,display: "inline-flex", alignItems: "center"}}>
                <Button sx={{height:"52px", marginTop: "7px", color:"white"}} color="info" type="submit" variant="contained"><AssignmentRoundedIcon /></Button>
              </Grid>
            </Grid>
            
                

        </form>
    </Container> );
}


export default FormLibroMayor;