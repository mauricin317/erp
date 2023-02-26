import Head from 'next/head';
import { useState } from 'react';
import { useRouter } from "next/router";
import FullLayout from "../../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../../theme/theme";
import FormBalanceInicial from '../../components/ReportesForm/FormBalanceInicial';
import FormLibroDiario from '../../components/ReportesForm/FormLibroDiario';
import FormLibroMayor from '../../components/ReportesForm/FormLibroMayor';
import FormSumasSaldos from '../../components/ReportesForm/FormSumasSaldos';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';


async function obtenerDatosReporte() {
  return fetch(`http://localhost:3000/api/reportes/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(result => result.json())
 }

export default function Reportes() {

  const router = useRouter();
  const { reporte } = router.query
  let titulo = '';
  switch (reporte) {
    case '1':
      titulo='Balance Inicial';
      break;
    case '2':
      titulo= 'Libro Diario';
      break;
    case '3':
      titulo= 'Libro Mayor';
      break;
    case '4':
      titulo= 'Comprobacion de Sumas y Saldos';
      break;
    default:
      titulo= '';
      break;
  }
  const [state, setState] = useState({
    gestiones:[],
    periodos:[],
    monedas:[],
    isfetched:false
  })

  const cargarDatos = async () =>{
    let datos = await obtenerDatosReporte();
    if(datos.ok){
      setState({
        gestiones:datos.gestiones,
        periodos:datos.periodos,
        monedas:datos.monedas,
        isfetched:true
      })
    }else{
      
      toast.warn(datos.mensaje, {theme:'colored'});
      setState({
        gestiones:datos.gestiones,
        periodos:datos.periodos,
        monedas:datos.monedas,
        isfetched:true
      })
    }
  }

  if(!state.isfetched){
    cargarDatos();
  }
  
  return (
    <>
      <Head>
          <title>Reporte {titulo} | ERP</title>
      </Head>
          <h2>Reporte {titulo}</h2>
          {reporte==1 ? <FormBalanceInicial gestiones={state.gestiones} monedas={state.monedas} /> : ''}
          {reporte==2 ? <FormLibroDiario gestiones={state.gestiones} periodos={state.periodos} monedas={state.monedas} />:''}
          {reporte==3 ? <FormLibroMayor gestiones={state.gestiones} periodos={state.periodos} monedas={state.monedas} />:''}
          {reporte==4 ? <FormSumasSaldos gestiones={state.gestiones} monedas={state.monedas} />:''}
          <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
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