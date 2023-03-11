import { DataGrid, GridActionsCellItem, esES   } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Box from '@mui/system/Box';
import clsx from 'clsx';
import { useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import FormNotaCompra from './FormNotasCompra/FormNotaCompra';
import { ToastContainer, toast } from 'react-toastify';

async function obtenerNotasCompra() {
  return fetch(`http://localhost:3000/api/notascompra/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(result => result.json())
 }

 async function obtenerArticulos() {
  return fetch('http://localhost:3000/api/articulos?nota=compra', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(result => result.json())
 }

export default function NotaCompraDataGrid(){

    const [pageSize, setPageSize] = useState(10);
    const [state, setState] = useState({
        notascompra:[],
        isfetched: false,
        showForm: false,
        formData:{
          nro_nota:1,
          articulos: []
        }
      });
  
    const cargarDatos= async () =>{
      let datos_notascompra = await obtenerNotasCompra();
      let datos_articulos = await obtenerArticulos();
      if(datos_notascompra.ok){
        let articulos= []
        if(datos_articulos.ok) articulos = datos_articulos.data
        let nronota = datos_notascompra.data.length + 1;
          setState({
            notascompra: datos_notascompra.data,
            isfetched:true,
            showForm:false,
            formData:{
              nro_nota: nronota,
              articulos: articulos
            },
            readOnly: false
          });
      }
    }

    const enableReadOnly = (notacompra, idnota, nronota) =>{

      let newData = {
        nro_nota: nronota,
        fecha: notacompra.fecha,
        estado: "Abierto",
        idnota: idnota, 
        descripcion: notacompra.descripcion,
        articulos: state.formData.articulos
      }

      setState({
        notascompra:state.notascompra,
        isfetched: state.isfetched,
        showForm: state.showForm,
        formData: newData,
        readOnly: true
      })
    }


    if(!state.isfetched){
        cargarDatos();
    }

    const openForm = () =>{
      if(state.formData.articulos.length<1){
        toast.error("Antes debe crear artículos",{theme: "colored"});
        return
      }
      setState({
        notascompra:state.notascompra,
        isfetched: state.isfetched,
        showForm: true,
        formData: {
          nro_nota: state.formData.nro_nota,
          articulos: state.formData.articulos
        },
        readOnly: false
      })
    }

    const closeForm = () =>{
      
      setState({
        notascompra:state.notascompra,
        isfetched: false,
        showForm: false,
        formData: state.formData,
        readOnly: false
      })
    }

    const showNota = (nota) =>{
      let n_estado = "Abierto";
      switch(nota.estado) {
        case 1:
          n_estado = "Abierto";
          break;
        case 0:
          n_estado = "Cerrado"; 
          break;
        default:
          n_estado = "Anulado";
          break;
      }
      let newData = {
        nro_nota: nota.nronota,
        fecha: nota.fecha,
        estado: n_estado,
        idnota: nota.idnota, 
        descripcion: nota.descripcion,
        total: nota.total,
        articulos: state.formData.articulos
      }
      setState({
        notascompra:state.notascompra,
        isfetched: state.isfetched,
        showForm: true,
        formData: newData,
        readOnly: true
      })
    }

    const columns = [
        {
            field: 'nronota',
            headerName: '# Nota',
            minWidth:50
        },
        {
          field: 'descripcion',
          headerName: 'Descripcion',
          minWidth:300
        },
        {
          field: 'fecha',
          headerName: 'Fecha',
          type: 'date',
          minWidth:100,
          valueFormatter: (params) => {
            const valueFormatted =formatInTimeZone(params.value, 'UTC', 'dd/MM/yyy')
            return valueFormatted;
          },
        },
        {
          field: 'total',
          headerName: 'Total',
          minWidth:200,
        },
        {
          field: 'estado',
          headerName: 'Estado',
          minWidth:100,
          valueGetter: (params) => {
            switch (params.value) {
              case 1:
                return "Abierto"
              case 0:
                return "Cerrado"
              default:
                return "Anulado"
            }
          },
          cellClassName: (params) =>
          clsx('estado', {
            abierto: params.value === "Abierto",
            cerrado: params.value === "Anulado",
          }),
        },
        {
          field: 'accions',
          headerName: 'Acciones',
          type:'actions',
          getActions: (params) =>{
            return(
              [
                <GridActionsCellItem key={params.id}
                  icon={<VisibilityRoundedIcon color={'info'}/>}
                  label="Ver"
                  onClick={()=>{showNota(params.row)}}
                />,
              ]
            )
          } 
        },
      ];

    return(
        <div>
            {!state.showForm ?
            <div>
              <h2>Notas de Compra</h2>
            <Stack sx={{ '& button': { m: 1 } }} direction="row">
                <Button variant="contained" color="primary" onClick={openForm} disabled={!state.isfetched}><AddCircleRoundedIcon/></Button>
            </Stack>
            <Box sx={{ height: 500, width: 1,
                        '& .estado.abierto': {
                          backgroundColor: '#00c292',
                          color: '#f9f9f9',
                          fontWeight: '600',
                        },
                        '& .estado.cerrado': {
                          backgroundColor: '#e46a76',
                          color: '#f9f9f9',
                          fontWeight: '600',
                        } }} 
            >
            <DataGrid
                rows={state.notascompra}
                columns={columns}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                pageSize={pageSize}
                rowsPerPageOptions={[10,50,100]}
                localeText={esES.components.MuiDataGrid.defaultProps.localeText}
            /></Box>
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
            </div>
            : <FormNotaCompra formData={state.formData} closeForm={closeForm} readOnly={state.readOnly} enableReadOnly={enableReadOnly} newForm={openForm}/>}
        </div>
        
    )
}