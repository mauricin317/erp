import Head from 'next/head';
import { useState } from 'react';
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import CircularProgress from '@mui/material/CircularProgress'
import theme from "../theme/theme";
import { ToastContainer } from 'react-toastify';
import IntegracionForm from "../components/IntegracionForm";
import _ from 'lodash';
import 'react-toastify/dist/ReactToastify.min.css';

async function obtenerIntegracion() {
  return fetch('http://localhost:3000/api/integracion', {
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

export default function Integracion() {

  //ESTADO PARA  OBTENER LA INTEGRACION Y PASARLA COMO PROPS AL FORMULARIO

  const [state, setState] = useState({
    formData:[],
    cuentas:[],
    isfetched: false
  })

  const cargarDatos = async () =>{
    let integracion = await obtenerIntegracion();
    if(integracion.ok){
      let cuentas = await obtenerCuentas();
      let _cuentas = _.cloneDeep(cuentas.data)
      if(integracion.data.length > 0){
        if(integracion.data[0].caja != null){
          let _integracion = integracion.data[0]
          let ci = _.omit(_integracion, ['estado', 'idempresa'])
          _integracion.caja = _.find(_cuentas, ['id',_integracion.caja])
          _integracion.creditofiscal = _.find(_cuentas, ['id',_integracion.creditofiscal])
          _integracion.debitofiscal = _.find(_cuentas, ['id',_integracion.debitofiscal])
          _integracion.compras = _.find(_cuentas, ['id',_integracion.compras])
          _integracion.ventas = _.find(_cuentas, ['id',_integracion.ventas])
          _integracion.it = _.find(_cuentas, ['id',_integracion.it])
          _integracion.itxpagar = _.find(_cuentas, ['id',_integracion.itxpagar])
          _cuentas = _.remove(_cuentas, function(c) {
            return !_.includes(ci,c.id);
          });
        

          setState({
            formData: _integracion,
            cuentas: _cuentas,
            isfetched: true,
          })

        }else{
          setState({
            formData: integracion.data[0],
            cuentas: _cuentas,
            isfetched: true,
          })
        }
      }else{
        setState({
          formData: [],
          cuentas: _cuentas,
          isfetched: true,
        })
      }

      
    }
  }

  if(!state.isfetched){
    cargarDatos();
  }

  const handleSubmit = () => {
    setState({
        formData: state.formData,
        cuentas: state.cuentas,
        isfetched: false,
    })
  };

  return (
    <>
        <Head>
            <title>Cuentas de Integración | ERP</title>
        </Head>
          <h2>Configuracion de Cuentas de Integracion</h2>
          {!state.isfetched ? <CircularProgress sx={{ml:'50%', mt:'100px'}} color="primary" /> :  <IntegracionForm integracion={state.formData} cuentas={state.cuentas} submit={handleSubmit} /> }
          <ToastContainer position="top-right" autoClose={2500} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
    </>
  );
}

Integracion.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullLayout>
          {page}
      </FullLayout>
    </ThemeProvider>
  )
}