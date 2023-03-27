import { DataGrid, esES } from '@mui/x-data-grid';
import Box from '@mui/system/Box';
import MonedasForm from './MonedasForm';
import { useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { ToastContainer } from 'react-toastify';
import { obtenerEmpresamonedas } from '../services/EmpresaMonedas';
import 'react-toastify/dist/ReactToastify.min.css';


function MonedasDatarid(props) {

    const [pageSize, setPageSize] = useState(5);
    const [state, setState] = useState({
        empresamonedas:[],
        monedas:[],
        isfetched: false,
        tieneComprobante: false
      });

      const handleSubmit = () =>{
        setState({
            empresamonedas:state.empresamonedas,
            monedas:state.monedas,
            isfetched: false,
            tieneComprobante: state.tieneComprobante
        })
      }

    const cargarDatos= async () =>{
        let registros = await obtenerEmpresamonedas(props.jwt);
        
        if(registros.ok){
            setState({
                empresamonedas: registros.data,
                monedas: registros.monedas,
                isfetched: true,
                tieneComprobante: registros.comprobantes_count != 0
            })
        }
      }
    
    if(!state.isfetched){
        cargarDatos();
    }

    const columns = [
        {
          field: 'fecharegistro',
          headerName: 'Fecha',
          type: 'date',
          minWidth:200,
          valueFormatter: (params) => {
            const valueFormatted =formatInTimeZone(params.value, 'UTC', 'dd/MM/yyy HH:mm:ss')
            return valueFormatted;
          },
        },
        {
            field: 'monedaprincipal',
            headerName: 'Moneda Principal',
            minWidth:200
        },
        {
            field: 'monedaalternativa',
            headerName: 'Moneda Alternativa',
            minWidth:200
        },
        {
            field: 'cambio',
            headerName: 'Cambio',
            type: 'number',
            minWidth:200
        },
        {
          field: 'activo',
          headerName: 'Estado',
          minWidth:200,
          valueGetter: (params) => {
            if(params.value===1){
              return "Activo"
            }else{
              return "Inactivo"
            }
          },
        }
      ];

    return ( <Box>
            {state.isfetched ?
                <MonedasForm monedas={state.monedas} datos={state.isfetched ? state.empresamonedas[0] : null} submit={handleSubmit} readOnly={state.tieneComprobante} jwt={props.jwt} /> : ''}
            <Box>
                <DataGrid
                    autoHeight 
                    rows={state.empresamonedas}
                    columns={columns}
                    onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                    pageSize={pageSize}
                    rowsPerPageOptions={[5,10,20]}
                    localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                />
            </Box>
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
      </Box> );
}

export default MonedasDatarid;