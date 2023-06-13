import Head from 'next/head';
import { useEffect, useState } from 'react';
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import CircularProgress from '@mui/material/CircularProgress'
import theme from "../theme/theme";
import { ToastContainer } from 'react-toastify';
import IntegracionForm from "../components/IntegracionForm";
import { obtenerIntegracion } from "../services/Integracion";
import { obtenerDetalleCuentas } from "../services/Cuentas";
import useStorage from '../utils/storageHook';
import _ from 'lodash';
import 'react-toastify/dist/ReactToastify.min.css';

export default function Integracion() {

  const { getItem } = useStorage();
  const jwt = getItem('token');

  const [state, setState] = useState({
    formData:null,
    cuentas:null
  })

  const cargarDatos = async () =>{
    let integracion = await obtenerIntegracion(jwt);
    if(integracion.ok){
      let cuentas = await obtenerDetalleCuentas(jwt);
      let _cuentas = _.cloneDeep(cuentas.data)
      if(integracion.data){
        if(integracion.data.caja != null){
          let _integracion = integracion.data
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
          })
        }else{
          setState({
            formData: integracion.data,
            cuentas: _cuentas,
          })
        }
      }else{
        setState({
          formData: [],
          cuentas: _cuentas,
        })
      }
    }else{
      setState({
        ...state,
        error:integracion.mensaje ?? "Error"
      })
    }
  }

  useEffect(()=>{
    cargarDatos();
  }, [])

  const handleSubmit = () => {
    setState({
        formData: state.formData,
        cuentas: state.cuentas
    })
  };

  return (
    <>
        <Head>
            <title>Integración</title>
        </Head>
        <div  style={{padding:'0 100px'}}>
          <h2>Integracion</h2>
          {state?.error 
            ? "Error" 
            : !state.cuentas 
              ? <CircularProgress sx={{ml:'50%', mt:'100px'}} color="primary" /> 
              :  <IntegracionForm jwt={jwt} integracion={state.formData} cuentas={state.cuentas} submit={handleSubmit} /> }
          <ToastContainer position="top-right" autoClose={2500} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
   
          </div>
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