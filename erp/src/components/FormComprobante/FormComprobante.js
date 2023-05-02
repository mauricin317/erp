import { DataGrid, GridActionsCellItem, GridFooterContainer, esES   } from '@mui/x-data-grid';
import _ from 'lodash'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import AddToPhotosRoundedIcon from '@mui/icons-material/AddToPhotosRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import DoDisturbOnRoundedIcon from '@mui/icons-material/DoDisturbOnRounded';
import AlertDialog from '../AlertDialog';
import { useState, useEffect } from 'react';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import Box from '@mui/system/Box';
import { formatInTimeZone } from 'date-fns-tz';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ModalForm from './ModalForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { obtenerDetalles, crearComrpobante, anularComprobante } from '../../services/Comprobantes';

export default function FormComprobante(props){

    const formData = props.formData;

    const formik = useFormik({
      initialValues: {
        serie: formData.nro_serie,
        fecha: props.readOnly == true ? formatInTimeZone(formData.fecha, 'UTC', 'yyy-MM-dd') : formatInTimeZone(new Date(), 'UTC', 'yyy-MM-dd'),
        tipo_comprobante: props.readOnly == true ? formData.tipocomprobante : "",
        tipo_cambio: formData.tipo_cambio == undefined ? '': formData.tipo_cambio,
        moneda: props.readOnly == true ? formData.idmoneda : formData.monedas[0].idmoneda,
        glosa:  props.readOnly == true ? formData.glosa : ""
      },
      validationSchema: Yup.object({
          fecha: Yup.date().required('Requerido'),
          glosa: Yup.string().required('Requerido'),
          tipo_comprobante: Yup.string().required('Requerido'),
          tipo_cambio: Yup.number().typeError('Debe ser un número Decimal').positive('Debe ser un número positivo').required('Requerido'),
      }),
      onSubmit: async values => {
        if(detalles.length >= 2){
          let totales = _.cloneDeep(detalles)
          let debe=0;
          let haber=0;
          totales.forEach(elem => {
            debe = Number(debe) + Number(elem.debe);
            haber = Number(haber)+ Number(elem.haber);
          })
          if(debe == haber){
            let comprobante = {
              serie: values.serie,
              glosa: values.glosa,
              fecha: values.fecha,
              tc: values.tipo_cambio,
              tipocomprobante: values.tipo_comprobante,
              idmoneda: values.moneda,
              detalles: detalles
            }
            let resultado = await crearComrpobante(comprobante, props.jwt);
            if (resultado.ok){
              toast.success(resultado.mensaje,{theme: "colored"});
              values.serie=resultado.datos.serie;
              props.enableReadOnly(comprobante, resultado.datos.idcomprobante, resultado.datos.serie);
            }else{
              toast.error(resultado.mensaje,{theme: "colored"});
            }

          }else{
            toast.error("Los totales del Debe Y Haber deben sumar Igual",{theme: "colored"})
          }
        }else{
          toast.error("Debe registrar 2 detalles como mínimo",{theme: "colored"});
        }
      }
    });

    const [modalform, setModalform] = useState({
      open:false,
      tipo:'nuevo',
      datos:null,
      cuenta: []
    });
    const [openDialog, setOpenDialog] = useState({state: false});
    const [openDialogAnular, setOpenDialogAnular] = useState({state: false});
    const [estado, setEstado] = useState(props.readOnly == true ? formData.estado : "Abierto");
    const [detalles, setDetalles] = useState([]);

    const cargarDetalles = async () =>{
      let traerDetalles = await obtenerDetalles(formData.idcomprobante, props.jwt)
      if(traerDetalles.ok){
        setDetalles(traerDetalles.data);
      }
    }

    useEffect(()=>{
      if(props.readOnly && detalles.length == 0){
        cargarDetalles();
      }
    },[])
    

    let _cuentas = _.differenceBy(props.formData.cuentas,detalles, 'idcuenta');

    const handleNuevo = () => {
      setModalform({
        open:true,
        tipo:'nuevo',
        datos:null,
        cuenta: []
      });
    };

    const handleCloseModal = () => {
      setModalform({
        open:false,
        tipo:'nuevo',
        datos:null,
        cuenta: []
      });
    };

    

    const handleSubmitDetalle = (detalle) =>{
        var detalles_hack = _.cloneDeep(detalles);
        let existe_detalle = _.findIndex(detalles_hack, { 'id': detalle.id })
        if(existe_detalle == -1){
          detalles_hack.push(detalle)
          setDetalles(detalles_hack);
        }else{
          detalles_hack[existe_detalle] = detalle;
          setDetalles(detalles_hack);
        }
        
    }

    const handleEditarDetalle = (detalle) =>{
      let detalles_hack = _.without(detalles,detalle);
      setModalform({
        open:true,
        tipo:'editar',
        datos:detalle,
        cuenta: _.differenceBy(props.formData.cuentas,detalles_hack, 'idcuenta')
      });
    }

    const handleEliminarDetalle = (detalle) =>{
      var detalles_hack = _.without(detalles,detalle);
      setDetalles(detalles_hack);

    }

    const handleAnular = async () => {
      setOpenDialogAnular({state:false})
      let data = {
        idcomprobante: formData.idcomprobante,
        estado: -1
      }
      let respuesta = await anularComprobante(data, props.jwt);
      if (respuesta.ok){
        setEstado("Anulado");
        toast.success("Comprobante Anulado",{theme: "colored"});
        
      }else{
        toast.warn(respuesta.mensaje,{theme: "colored"});
      }
    }

    const openReport= () =>{
      window.open(`http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2Freports&reportUnit=%2Freports%2FComprobante&standAlone=true&id_comprobante=${formData.idcomprobante}&j_username=joeuser&j_password=123&sessionDecorator=no`, '_blank');
    }


    const columns = [
        {
            field: 'cuenta',
            headerName: 'Cuenta',
            width:300
        },
        {
            field: 'glosa',
            headerName: 'Glosa',
            width:500
            
        },
        {
          field: 'debe',
          headerName: 'Debe',
          type: 'number',
          width:150
        },
        {
            field: 'haber',
            headerName: 'Haber',
            type: 'number',
            width:150
        },
        {
          field: 'accions',
          headerName: 'Acciones',
          type:'actions',
          getActions: (params) =>{
            let disabled = props.readOnly;
            return(
              [
                <GridActionsCellItem key={params.id}
                  icon={<EditRoundedIcon color={!disabled?'info':''}/>}
                  label="Editar"
                  onClick={()=>{handleEditarDetalle(params.row)}}
                  disabled={disabled}
                />,
                <GridActionsCellItem key={params.id}
                  icon={<DeleteRoundedIcon color={!disabled?'danger':''}/>}
                  label="Eliminar"
                  onClick={()=>{handleEliminarDetalle(params.row)}}
                  disabled={disabled}
                />
              ]
            )
          } 
        },
      ];

    return(
        <Box sx={
          { 
            width: 1,
            mt:3
          }
        }>
        <form onSubmit={formik.handleSubmit}>   
            
            <Stack sx={{ justifyContent:'space-between', alignItems:'center',height:'50px'}} direction="row">
            <h2>{`${!props.readOnly ? 'Nuevo' : 'Ver'} Comprobante`}</h2>
            <Stack sx={{ '& button': { my: 1, ml:1 }, justifyContent:'end'}} direction="row">
            <Button variant="contained" color="secondary" disabled={formik.isSubmitting} onClick={() => {props.readOnly == true ? props.closeForm() : setOpenDialog({state:true})}} ><ArrowBackRoundedIcon/></Button>
            {
              props.readOnly == false ?
                <Button variant="contained" color="success" disabled={formik.isSubmitting || props.readOnly} type="submit" ><SaveRoundedIcon/></Button>
              :<>
              {/* <Button variant="contained" color="success" sx={{color:'white'}} ><AddCircleRoundedIcon/></Button>*/}
                <Button variant="contained" color="info" disabled={formik.isSubmitting}  sx={{color:'white'}} onClick={openReport} ><AssignmentRoundedIcon/></Button>
              </>
            }
              <Button variant="contained" color="danger" disabled={formik.isSubmitting || estado != 'Abierto' || props.readOnly == false}  sx={{color:'white'}} onClick={() => setOpenDialogAnular({state:true})}><DoDisturbOnRoundedIcon/></Button>
            </Stack>
            </Stack>
            <Grid container spacing={1}>
              <Grid item md={1} xs={12}>
                <TextField
                  error={Boolean(formik.touched.serie && formik.errors.serie)}
                  fullWidth
                  helperText={formik.touched.serie && formik.errors.serie}
                  label="Serie"
                  margin="normal"
                  name="serie"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.serie}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled={props.readOnly}
                />
              </Grid>
              <Grid item md={2} xs={12}>
                <TextField
                  error={Boolean(formik.touched.fecha && formik.errors.fecha)}
                  fullWidth
                  helperText={formik.touched.fecha && formik.errors.fecha}
                  label="Fecha"
                  margin="normal"
                  name="fecha"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="date"
                  value={formik.values.fecha}
                  variant="outlined"
                  focused
                  disabled={props.readOnly}
                />
              </Grid>
              <Grid item md={2} xs={12}>
                <TextField
                  fullWidth
                  label="Estado"
                  margin="normal"
                  name="estado1"
                  type="text"
                  value={estado}
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled={props.readOnly}
                />
              </Grid>
              <Grid item md={3} xs={12}>
                <TextField
                  error={Boolean(formik.touched.tipo_comprobante && formik.errors.tipo_comprobante)}
                  helperText={formik.touched.tipo_comprobante && formik.errors.tipo_comprobante}
                  fullWidth
                  label="Tipo Comprobante"
                  margin="normal"
                  name="tipo_comprobante"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  select
                  focused
                  disabled={props.readOnly}
                  value={formik.values.tipo_comprobante}
                  variant="outlined"> 
                    <MenuItem key={1} value={1}>{"Apertura"}</MenuItem>
                    <MenuItem key={2} value={2}>{"Ingreso"}</MenuItem>
                    <MenuItem key={3} value={3}>{"Egreso"}</MenuItem>
                    <MenuItem key={4} value={4}>{"Traspaso"}</MenuItem>
                    <MenuItem key={5} value={5}>{"Ajuste"}</MenuItem>
                </TextField>
              </Grid>
              <Grid item md={3} xs={12}>
                <TextField
                  error={Boolean(formik.touched.moneda && formik.errors.moneda)}
                  helperText={formik.touched.moneda && formik.errors.moneda}
                  fullWidth
                  label="Moneda"
                  margin="normal"
                  name="moneda"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  select
                  focused
                  disabled={props.readOnly}
                  value={formik.values.moneda}
                  variant="outlined"> 
                    {formData.monedas.map((option,i) => ( 
                      <MenuItem key={option.idmoneda} value={option.idmoneda}>
                        {option.nombre}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item md={1} xs={12}>
                <TextField
                  error={Boolean(formik.touched.tipo_cambio && formik.errors.tipo_cambio)}
                  fullWidth
                  helperText={formik.touched.tipo_cambio && formik.errors.tipo_cambio}
                  label="Tipo Cambio"
                  margin="normal"
                  name="tipo_cambio"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="text"
                  value={formik.values.tipo_cambio}
                  inputProps={{
                    maxLength: 9,
                    style: { textAlign: "right" }
                  }}
                  variant="outlined"
                  focused
                  disabled={props.readOnly}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item md={11} xs={12}>
                <TextField
                  error={Boolean(formik.touched.glosa && formik.errors.glosa)}
                  fullWidth
                  helperText={formik.touched.glosa && formik.errors.glosa}
                  label="Glosa"
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
                  disabled={props.readOnly}
                />
              </Grid>
              <Grid item md={1} xs={12} sx={{justifyContent:'end' ,display: "inline-flex", alignItems: "center"}}>
                <Button sx={{height: "56px", marginTop: "7px", width:"100%"}} variant="contained" color="primary" disabled={formik.isSubmitting || props.readOnly} onClick={handleNuevo} ><AddToPhotosRoundedIcon/></Button>
              </Grid>
            </Grid>
          </form>
          <Box sx={{ height: 370, width: 1}}>            
                <DataGrid
                    rows={detalles}
                    columns={columns}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                    hideFooterPagination
                    hideFooterSelectedRowCount
                    components={{
                      Footer: () => <TotalesFooter detalles={detalles} />,
                    }}
                    rowHeight={30}
                />    
          </Box>
          <AlertDialog open={openDialog.state} title={"¿Seguro que desea salir?"} body={"Se perderán todos los datos de este comprobante"} btnText={"Sí, Salir"} close={() => setOpenDialog({state:false})} confirm={props.closeForm} />
          <AlertDialog open={openDialogAnular.state} title={"¿Seguro que desea anular este comprobante?"} body={"El comprobante será anulado de forma permanente"} btnText={"Anular"} close={() => setOpenDialogAnular({state:false})} confirm={handleAnular} />
          <ModalForm open={modalform.open} tipo={modalform.tipo} datos={modalform.datos} close={handleCloseModal} glosa={formik.values.glosa} cuentas={modalform.tipo == "nuevo" ? _cuentas : modalform.cuenta} submit={handleSubmitDetalle}/>
    </Box>
    )
}


const TotalesFooter = (props) =>{
  var _detalles = _.cloneDeep(props.detalles);
  var datos = _detalles.map((d,i)=>{
    return {debe: d.debe, haber: d.haber}
  })
  var debe = 0;
  var haber = 0;
  if(datos.length > 0){
    debe=0;
    haber=0;
    datos.forEach(elem => {
      debe = Number(debe) + Number(elem.debe);
      haber = Number(haber)+ Number(elem.haber);
    })
  }

  return(
    <GridFooterContainer>
      <Stack direction="row"  >
        <div style={{width:'800px', textAlign:'right'}}>
          <b>Totales</b>
        </div>
        <div style={{width:'150px', textAlign:'right'}}>
        <b>{debe.toFixed(2)}</b>
        </div>
        <div style={{width:'150px', textAlign:'right'}}>
        <b>{haber.toFixed(2)}</b>
        </div>
      </Stack>
    </GridFooterContainer>
  )
}