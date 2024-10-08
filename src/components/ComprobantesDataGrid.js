import { DataGrid, GridActionsCellItem, esES   } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Box from '@mui/system/Box';
import clsx from 'clsx';
import { useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import FormComprobante from './FormComprobante/FormComprobante';
import { ToastContainer, toast } from 'react-toastify';

async function obtenerComprobantes() {
  return fetch(`http://localhost:3000/api/comprobantes/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(result => result.json())
 }

 async function obtenerCuentas() {
  return fetch('http://localhost:3000/api/cuentas/detalle', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(result => result.json())
 }

export default function ComprobantesDataGrid(){

    const [pageSize, setPageSize] = useState(10);
    const [state, setState] = useState({
        comprobantes:[],
        isfetched: false,
        showForm: false,
        formData:{
          monedas:[],
          nro_serie:1,
          tipo_cambio:0,
          cuentas: []
        }
      });
  
    const cargarDatos= async () =>{
      let datos_comprobantes = await obtenerComprobantes();
      let datos_cuentas = await obtenerCuentas();
      if(datos_comprobantes.ok){
        let cuentas= []
        if(datos_cuentas.ok) cuentas = datos_cuentas.data
        let serie = datos_comprobantes.data.length + 1;
          setState({
            comprobantes: datos_comprobantes.data,
            isfetched:true,
            showForm:false,
            formData:{
              monedas: datos_comprobantes.monedas,
              nro_serie: serie,
              tipo_cambio: datos_comprobantes.tipo_cambio,
              cuentas: cuentas
            },
            readOnly: false
          });
      }
    }

    const enableReadOnly = (comprobante, idcomprobante, serie) =>{

      let newData = {
        monedas: state.formData.monedas,
        nro_serie: serie,
        fecha: comprobante.fecha,
        estado: "Abierto",
        idcomprobante: idcomprobante,
        idmoneda: comprobante.idmoneda,
        tipocomprobante: comprobante.tipocomprobante, 
        glosa: comprobante.glosa,
        tipo_cambio: comprobante.tc,
        cuentas: state.formData.cuentas
      }

      setState({
        comprobantes:state.comprobantes,
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
      if(state.formData.monedas.length!=2){
        toast.error("Antes debe configurar una moneda alternativa",{theme: "colored"});
        return
      }
      if(state.formData.cuentas.length<2){
        toast.error("Antes debe configurar las cuentas de detalle",{theme: "colored"});
        return
      }
      setState({
        comprobantes:state.comprobantes,
        isfetched: state.isfetched,
        showForm: true,
        formData: {
          monedas: state.formData.monedas,
          nro_serie: state.formData.nro_serie,
          tipo_cambio: state.formData.tipo_cambio,
          cuentas: state.formData.cuentas
        },
        readOnly: false
      })
    }

    const closeForm = () =>{
      
      setState({
        comprobantes:state.comprobantes,
        isfetched: false,
        showForm: false,
        formData: state.formData,
        readOnly: false
      })
    }

    const showComprobante = (comprobante) =>{
      let c_estado = "Abierto";
      switch(comprobante.estado) {
        case 1:
          c_estado = "Abierto";
          break;
        case 0:
          c_estado = "Cerrado"; 
          break;
        default:
          c_estado = "Anulado";
          break;
      }
      let newData = {
        monedas: state.formData.monedas,
        nro_serie: comprobante.serie,
        fecha: comprobante.fecha,
        estado: c_estado,
        idcomprobante: comprobante.idcomprobante,
        idmoneda: comprobante.idmoneda,
        tipocomprobante: comprobante.tipocomprobante, 
        glosa: comprobante.glosa,
        tipo_cambio: comprobante.tc,
        cuentas: state.formData.cuentas
      }
      setState({
        comprobantes:state.comprobantes,
        isfetched: state.isfetched,
        showForm: true,
        formData: newData,
        readOnly: true
      })
    }

    const columns = [
        {
            field: 'serie',
            headerName: 'Serie',
            minWidth:50
        },
        {
          field: 'glosa',
          headerName: 'Glosa',
          minWidth:300
        },
        {
            field: 'tipocomprobante',
            headerName: 'Tipo',
            minWidth:100,
            valueGetter: (params) => {
              switch (params.value) {
                case 1:
                  return "Apertura";
                case 2:
                  return "Ingreso";
                case 3:
                  return "Egreso";
                case 4:
                  return "Traspaso";
                case 5:
                  return "Ajuste";
                default:
                  return "";
              } 
            }
        },
        {
          field: 'fecha',
          headerName: 'Fecha',
          type: 'date',
          minWidth:100,
          valueFormatter: (params) => {
            const valueFormatted =formatInTimeZone(params.value, 'America/La_Paz', 'dd/MM/yyy')
            return valueFormatted;
          },
        },
        {
          field: 'moneda',
          headerName: 'Moneda',
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
                  label="Editar"
                  onClick={()=>{showComprobante(params.row)}}
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
              <h2>Comprobantes</h2>
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
                rows={state.comprobantes}
                columns={columns}
                localeText={esES.components.MuiDataGrid.defaultProps.localeText}
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                pageSize={pageSize}
                rowsPerPageOptions={[10,20,30]}
            /></Box>
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
            </div>
            : <FormComprobante formData={state.formData} closeForm={closeForm} readOnly={state.readOnly} enableReadOnly={enableReadOnly} newForm={openForm}/>}
        </div>
        
    )
}