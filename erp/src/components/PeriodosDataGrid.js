import { DataGrid, GridActionsCellItem, GridRowParams, esES   } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import BorderColorSharpIcon from '@mui/icons-material/BorderColorSharp';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import AssessmentSharpIcon from '@mui/icons-material/AssessmentSharp';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/system/Box';
import AlertDialog from './AlertDialog';
import clsx from 'clsx';
import { useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import ModalForm from './FormPeriodos/ModalForm';
import { useRouter } from "next/router";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { obtenerPeriodos, eliminarPeriodo } from '../services/Periodos'



export default function PeriodosDataGrid(props){
  const router = useRouter();
  const [state, setState] = useState({
    periodos:[],
    isfetched: false
  });
  const [modalform, setModalform] = useState({
    open:false,
    tipo:'nuevo',
    datos:null
  });
  const [pageSize, setPageSize] = useState(15);
  const [openDialog, setOpenDialog] = useState({state: false, id:0});

  const handleNuevo = () => {
    setModalform({
      open:true,
      tipo:'nuevo',
      datos:null
    });
  };
  const handleEditar = (data) =>{
    setModalform({
      open:true,
      tipo:'editar',
      datos: data
    });
  }
  const handleCloseModal = () => {
    setModalform({
      open:false,
      tipo:'nuevo',
      datos:null
    });
  };
  const handleEliminar = async (idperiodo) => {
    let eliminar = await eliminarPeriodo(idperiodo, props.jwt);
    if(eliminar.ok){
      handleSubmit();
      setOpenDialog({state:false, id:0});
    }else{
      toast.error(eliminar.mensaje,{theme: "colored"});
    }
  }
  const handleSubmit = () =>{
    setState({
      periodos: state.periodos,
      isfetched:false
    })
  }

  const cargarDatos= async () =>{
    let periodos = await obtenerPeriodos(props.idgestion, props.jwt);
    if(periodos.ok){
      let data = periodos.data;
      let count = 0
      setState({
        periodos: data,
        isfetched: true
      })
    }
  }
  

  if(!state.isfetched){
    cargarDatos();
  }

  const handleReport= () =>{
   // window.open(`http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2Freports&reportUnit=%2Freports%2FPeriodos&standAlone=true&id_gestion=${props.idgestion}&j_username=joeuser&j_password=123&sessionDecorator=no`, '_blank');
  }

  const columns = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      minWidth:200
    },
    {
      field: 'fechainicio',
      headerName: 'Fecha Inicio',
      type: 'date',
      minWidth:200,
      valueFormatter: (params) => {
        const valueFormatted =formatInTimeZone(params.value, 'UTC', 'dd/MM/yyy')
        return valueFormatted;
      },
    },
    {
      field: 'fechafin',
      headerName: 'Fecha Fin',
      type: 'date',
      minWidth:200,
      valueFormatter: (params) => {
        const valueFormatted =formatInTimeZone(params.value, 'UTC', 'dd/MM/yyy')
        return valueFormatted;
      },
    },
    {
      field: 'estado',
      headerName: 'Estado',
      minWidth:200,
      valueGetter: (params) => {
        if(params.value===1){
          return "Abierto"
        }else{
          return "Cerrado"
        }
      },
      cellClassName: (params) =>
      clsx('estado', {
        abierto: params.value === "Abierto",
        cerrado: params.value === "Cerrado",
      }),
    },
    {
      field: 'accions',
      headerName: 'Acciones',
      type:'actions',
      minWidth:300,
      getActions: (params) =>{
        let disabled = params.row.estado === 0;
        return(
          [
            <GridActionsCellItem key={params.id}
              icon={<> <b style={{color:'black'}}></b><BorderColorSharpIcon color={!disabled?'warning':''}/></>}
              label="Editar"
              onClick={()=>{handleEditar(params.row)}}
              disabled={disabled}
            />,
            <GridActionsCellItem key={params.id}
              icon={<> <b style={{color:'black'}}></b><DeleteSharpIcon color={!disabled?'error':''}/></>}
              label="Eliminar"
              onClick={()=>{setOpenDialog({state: true,id:params.id})}}
              disabled={disabled}
            />,
          ]
        )
      } 
    },
  ];

    return(
        <Box sx={
          { 
            height: 400, width: 1,
            '& .estado.abierto': {
                // backgroundColor: '#00c292',
                // color: '#f9f9f9',
                fontWeight: '600',
              },
            '& .estado.cerrado': {
                // backgroundColor: '#e46a76',
                // color: '#f9f9f9',
                fontWeight: '600',
              }, 
          }
        }>
          <Stack sx={{ '& button': { m: 1 } }} direction="row">
            <Button variant="contained" color="success" disabled={state.disabledNuevo} onClick={handleNuevo}>Crear<AddIcon/></Button>
            
            <Button variant="contained" color="secondary" onClick={handleReport} >Reporte<AssessmentSharpIcon/></Button>
            <Button onClick={() => router.back()} variant="contained" color="danger" sx={{color:'white'}}>Atras<ArrowBackRoundedIcon/></Button>
          </Stack>
      <DataGrid
        rows={state.periodos}
        columns={columns}
        getRowId={(row) => row.idperiodo}
        autoPageSize
        disableRowSelectionOnClick
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
      />
      <AlertDialog open={openDialog.state} title={"¿Seguro que desea eliminar este periodo?"} body={"El periodo se eliminará de forma permanente"} btnText={"Eliminar"} close={() => setOpenDialog({state:false,id:0})} confirm={()=>{handleEliminar(openDialog.id)}} />
      <ModalForm open={modalform.open} tipo={modalform.tipo} datos={modalform.datos} close={handleCloseModal} submit={handleSubmit} idgestion={props.idgestion} mindate={props.mindate} maxdate={props.maxdate} jwt={props.jwt} />
    </Box>
    )
}