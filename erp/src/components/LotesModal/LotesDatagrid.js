import { useState } from 'react';
import _ from 'lodash';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Button from '@mui/material/Button';
import { formatInTimeZone } from 'date-fns-tz';
import clsx from 'clsx';
import Container from '@mui/material/Container';
import { DataGrid, esES } from '@mui/x-data-grid';
import 'react-toastify/dist/ReactToastify.min.css';

async function obtenerLotes(idarticulo) {
  return fetch(`http://localhost:3000/api/articulos/${idarticulo}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(result => result.json())
 }

 

export default function LotesDataGrid(props){
    
    const [state, setState] = useState({
      lotes:[],
      isfetched: false
    })
   
    const cargarDatos= async () =>{
      let lotes = await obtenerLotes(props.data.idarticulo);
      if(lotes.ok){
        setState({
          lotes: lotes.data,
          isfetched: true
        })
      }
    }
  
    if(!state.isfetched){
      cargarDatos();
    }

      
    const columns = [
      {
        field: 'nrolote',
        headerName: '# Lote',
        width:100
      },
      {
        field: 'fechaingreso',
        headerName: 'Fecha Ingreso',
        width:200,
        valueFormatter: (params) => {
          if(params.value != '' && params.value != null){
            let valueFormatted =formatInTimeZone(params.value, 'UTC', 'dd/MM/yyy') 
            return valueFormatted; 
          }else{
            return '';
          }
        },
        
      },
      {
        field: 'fechavencimiento',
        headerName: 'Fecha Vencimiento',
        width:200,
        valueFormatter: (params) => {
          if(params.value != '' && params.value != null){
            let valueFormatted =formatInTimeZone(params.value, 'UTC', 'dd/MM/yyy') 
            return valueFormatted; 
          }else{
            return '';
          }
        },
      },
      {
        field: 'cantidad',
        headerName: 'Cantidad',
        width:100,
        type: 'number',
      },
      {
        field: 'stock',
        headerName: 'Stock',
        width:100,
        type: 'number',
      },
      {
        field: 'estado',
        headerName: 'Estado',
        width:200,
        valueGetter: (params) => {
          switch (params.value) {
            case 1:
              return "Activo"
            case 0:
              return "Agotado"
            case -1:
              return "Anulado"
            default:
              return "Agotado"
          }
        },
        cellClassName: (params) =>
        clsx('estado', {
          activo: params.value === "Activo",
          agotado: params.value === "Agotado",
          anulado: params.value === "Anulado",
        }),
      }
    ];

    return(
      <Container maxWidth="md">
        <Box sx={{pb: 1,pt: 1}}>
          <Typography align="center" color="textSecondary" variant="h3">
            Lotes del Articulo: {props.data.nombre}
          </Typography>
        </Box>
        <Box sx={{ height: 400, width: 1,
                        '& .estado.activo': {
                          backgroundColor: '#00c292',
                          color: '#f9f9f9',
                          fontWeight: '600',
                        },
                        '& .estado.agotado': {
                          backgroundColor: '#f1c40f',
                          color: '#f9f9f9',
                          fontWeight: '600',
                        },
                        '& .estado.anulado': {
                          backgroundColor: '#e46a76',
                          color: '#f9f9f9',
                          fontWeight: '600',
                        } 
        }}>
        <DataGrid
          rows={state.lotes}
          columns={columns}
          localeText={esES.components.MuiDataGrid.defaultProps.localeText}
        />
        </Box>
        <Box sx={{ py: 2,display:'flex',justifyContent:'end' }}>
          <Button sx={{mx: 3}} size="large" color="error" variant="contained" startIcon={<CloseRoundedIcon />}  onClick={props.close}>Cerrar</Button>
        </Box>
      </Container>
    )
}