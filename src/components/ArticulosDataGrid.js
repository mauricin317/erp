import { DataGrid, GridActionsCellItem, GridRowParams, esES } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import BatchPredictionSharp from '@mui/icons-material/BatchPredictionSharp';
import Box from '@mui/system/Box';
import AlertDialog from './AlertDialog';
import { useState } from 'react';
import ModalForm from './FormArticulos/ModalForm';
import ModalLotes from './LotesModal/ModalLotes';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';


async function obtenerArticulos() {
  return fetch('http://localhost:3000/api/articulos', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(result => result.json())
 }

 async function eliminarArticulo(idarticulo) {
  return fetch(`http://localhost:3000/api/articulos/${idarticulo}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(result => result.json())
 }



export default function ArticulosDataGrid(){

  const [state, setState] = useState({
    articulos:[],
    categorias:[],
    isfetched: false
  });
  const [modalform, setModalform] = useState({
    open:false,
    tipo:'nuevo',
    datos:null
  });

  const [modallotes, setModallotes] = useState({
    open:false,
    datos:null
  });

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
  const handleLotes = (data) =>{
    setModallotes({
      open:true,
      datos: data
    });
  }
  const handleCloseModal = () => {
    setModalform({
      open:false,
      tipo:'nuevo',
      datos:null
    });
    setModallotes({
      open:false,
      datos:null
    });
  };
  const handleEliminar = async (idarticulo) => {
    let eliminar = await eliminarArticulo(idarticulo);
    if(eliminar.ok){
      handleSubmit();
      setOpenDialog({state:false, id:0})
    }else{
      toast.error(eliminar.mensaje,{theme: "colored"});
    }
  }
  const handleSubmit = () =>{
    setState({
      articulos: state.articulos,
      categorias: state.categorias,
      isfetched:false
    })
  }
  /*const handleEntrar = (id) =>{
    router.push(`/articulos/${id}`)
  }*/

  const cargarDatos= async () =>{
    let articulos = await obtenerArticulos();
    if(articulos.ok){
      setState({
        articulos: articulos.data,
        categorias: articulos.categorias,
        isfetched: true
      })
    }
  }

  if(!state.isfetched){
    cargarDatos();
  }

  const columns = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      minWidth:300
    },
    {
      field: 'descripcion',
      headerName: 'Descripcion',
      minWidth:400,
      
    },
    {
      field: 'cantidad',
      headerName: 'Cantidad',
      minWidth:100,
      type: 'number',
    },
    {
      field: 'precioventa',
      headerName: 'Precio de Venta',
      minWidth:150,
      type: 'number',
    },
    {
      field: 'accions',
      headerName: 'Acciones',
      minWidth:200,
      type:'actions',
      getActions: (params) =>{
        return(
          [
            <GridActionsCellItem key={params.id}
            icon={<BatchPredictionSharp color={'secondary'}/>}
            label="Lotes"
            onClick={()=>{handleLotes(params.row)}}
          />,
            <GridActionsCellItem key={params.id}
              icon={<EditRoundedIcon color={'info'}/>}
              label="Editar"
              onClick={()=>{handleEditar(params.row)}}
            />,
            <GridActionsCellItem key={params.id}
              icon={<DeleteIcon color={'error'}/>}
              label="Eliminar"
              onClick={()=>{setOpenDialog({state:true, id: params.id})}}
            />,
          ]
        )
      } 
    },
  ];

    return(
        <Box sx={{ height: 400, width: 1 }}>
          <Stack sx={{ '& button': { m: 1 } }} direction="row">
            <Button variant="contained" color="primary" disabled={state.disabledNuevo} onClick={handleNuevo}><AddCircleRoundedIcon/></Button>
          </Stack>
      <DataGrid
        localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        rows={state.articulos}
        columns={columns}
      />
      <AlertDialog open={openDialog.state} title={"¿Seguro que desea eliminar este artículo?"} body={"El artículo se eliminará de forma permanente"} btnText={"Eliminar"} close={() => setOpenDialog({state:false,id:0})} confirm={()=>{handleEliminar(openDialog.id)}} />
      <ModalForm open={modalform.open} tipo={modalform.tipo} datos={modalform.datos} categorias={state.categorias}  close={handleCloseModal} submit={handleSubmit}></ModalForm>
      <ModalLotes open={modallotes.open} close={handleCloseModal} data={modallotes.datos}></ModalLotes>
    </Box>
    )
}