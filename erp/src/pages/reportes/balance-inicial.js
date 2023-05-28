import Head from 'next/head';
import { useState, useEffect } from 'react';
import FullLayout from "../../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../../theme/theme";
import FormBalanceInicial from '../../components/ReportesForm/FormBalanceInicial';
import { ToastContainer, toast } from 'react-toastify';
import { obtenerDatosReporte } from '../../services/Reportes';
import useStorage from './../../utils/storageHook';
import 'react-toastify/dist/ReactToastify.min.css';


export default function Reportes() {
  const { getItem } = useStorage();
  const jwt = getItem('token');

  const [state, setState] = useState({
    gestiones:[],
    periodos:[],
    monedas:[]
  })

  const cargarDatos = async () =>{
    let datos = await obtenerDatosReporte(jwt);
    if(datos.ok){
      setState({
        gestiones:datos.gestiones,
        periodos:datos.periodos,
        monedas:datos.monedas,
      })
    }else{
      toast.warn(datos.mensaje, {theme:'colored'});
      setState({
        gestiones:[],
        periodos:[],
        monedas:[],
      })
    }
  }

  useEffect(()=>{
    cargarDatos();
  },[])
  
  return (
    <>
      <Head>
          <title>Reporte Balance Inicial</title>
      </Head>
          <h2>Reporte Balance Inicial</h2>
          <FormBalanceInicial gestiones={state.gestiones} monedas={state.monedas} />
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
    </>
  );
}

Reportes.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullLayout>
          {page}
      </FullLayout>
    </ThemeProvider>
  )
}