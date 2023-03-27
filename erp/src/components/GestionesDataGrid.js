import { DataGrid, GridActionsCellItem, esES   } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';

import AssessmentSharpIcon from '@mui/icons-material/AssessmentSharp';
import AddIcon from '@mui/icons-material/Add';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Box from '@mui/system/Box';
import AlertDialog from './AlertDialog';
import clsx from 'clsx';
import { useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import ModalForm from './FormGestiones/ModalForm';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import { useRouter } from "next/router";
import BorderColorSharpIcon from '@mui/icons-material/BorderColorSharp';

import { obtenerGestiones, eliminarGestion } from '../services/Gestiones'


export default function GestionesDataGrid(props){

  const router = useRouter();
  const [state, setState] = useState({
    gestiones:[],
    isfetched: false,
    disabledNuevo: false,
    idempresa:0
  });
  const [modalform, setModalform] = useState({
    open:false,
    tipo:'nuevo',
    datos:null
  });
  const [openDialog, setOpenDialog] = useState({state: false, id:0});

  const handleNuevo = () => {
    if (
      !state.disabledNuevo
    )
    {
      setModalform({
        open:true,
        tipo:'nuevo',
        datos:null
      });
    }
    else
    {
      toast.error('Solo pueden existir dos gestiones abiertas',{theme: "colored"});
    }

    
   
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
  const handleEliminar = async (idgestion) => {
    let eliminar = await eliminarGestion(idgestion, props.jwt);
    if(eliminar.ok){
      handleSubmit();
      setOpenDialog({state:false, id:0})
    }else{
      toast.error(eliminar.mensaje,{theme: "colored"});
    }
  }
  const handleSubmit = () =>{
    setState({
      gestiones: state.gestiones,
      isfetched:false,
      disabledNuevo: true,
      idempresa: state.idempresa
    })
  }
  const handleEntrar = (id) =>{
    router.push(`/gestiones/${id}`)
  }

  const cargarDatos= async () =>{
    let gestiones = await obtenerGestiones(props.jwt);
    if(gestiones.ok){
      let data = gestiones.data;
      let count = 0
      data.forEach(element => {
        if(element.estado===1) count++;
      });
      setState({
        gestiones: data,
        isfetched: true,
        disabledNuevo: count>=2,
        idempresa: gestiones.idempresa
      })
    }
  }
  

  if(!state.isfetched){
    cargarDatos();
  }

  const handleReport= () =>{
    //window.open(`http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2Freports&reportUnit=%2Freports%2FGestiones&standAlone=true&id_empresa=${state.idempresa}&j_username=joeuser&j_password=123&sessionDecorator=no`, '_blank');
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
            icon={<> <b style={{color:'black'}}></b> <RemoveRedEyeIcon color='success'/></>}
            label="Entrar"
            onClick={()=>{handleEntrar(params.id)}}
          />,
            <GridActionsCellItem key={params.id}
              icon={<> <b style={{color:'black'}}></b><BorderColorSharpIcon color={!disabled?'warning':''}/></>}
              label="Editar"
              onClick={()=>{handleEditar(params.row)}}
              disabled={disabled}
            />,
            <GridActionsCellItem key={params.id}
              icon={<> <b style={{color:'black'}}></b><DeleteSharpIcon color={!disabled?'error':''}/></>}
              label="Eliminar"
              onClick={()=>{setOpenDialog({state:true, id: params.id})}}
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
            <Button variant="contained" color="success"  onClick={handleNuevo}>Crear<AddIcon/></Button>
            <Button variant="contained" color="secondary" onClick={handleReport} >Reporte<AssessmentSharpIcon/></Button>
          </Stack>
      <DataGrid
        rows={state.gestiones}
        columns={columns}
        getRowId={(row) => row.idgestion}
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        autoPageSize
        disableRowSelectionOnClick
      />

      <AlertDialog open={openDialog.state} title={"¿Seguro que desea eliminar esta gestión?"} body={"La gestión se eliminará de forma permanente"} btnText={"Eliminar"} close={() => setOpenDialog({state:false,id:0})} confirm={()=>{handleEliminar(openDialog.id)}} />
      <ModalForm open={modalform.open} tipo={modalform.tipo} datos={modalform.datos} close={handleCloseModal} submit={handleSubmit} jwt={props.jwt} />
    </Box>
    )
}