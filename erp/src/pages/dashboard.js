import Head from 'next/head';
import { useState, useEffect } from 'react';
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
//import DashboarGrid from '../components/DashboardGrid';
import { useRouter } from "next/router";
import useStorage from '../utils/storageHook';
import { obtenerSesion } from '../services/Usuarios';
import theme from "../theme/theme";

export default function Dashboard() {

  const { getItem } = useStorage();
  const jwt = getItem('token');
  const router = useRouter();
  const [usuario, setUsuario] = useState(null)

  const cargarUsuario = async () =>{
    let sesion = await obtenerSesion(jwt);
    if(sesion.ok){
      setUsuario(sesion.data);
    }
  }

  useEffect(() => {
      if(jwt == undefined){
        router.push('/login')
        return (<div>Loading...</div>)
      }else{
        cargarUsuario()
      }
  }, []);

  return (
    <>
        <Head>
            <title>Dashboard</title>
        </Head>
          <h2>Dashboard - Bienvenido {usuario?.nombre}</h2>
          {/* <DashboarGrid /> */}
    </>
  );
}

Dashboard.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullLayout>
          {page}
      </FullLayout>
    </ThemeProvider>
  )
}
