import Head from 'next/head';
import FullLayout from "../../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../../theme/theme";
import Button from '@mui/material/Button';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useRouter } from "next/router";
import { useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import useStorage from '../../utils/storageHook';
import { obtenerGestion } from '../../services/Gestiones'

import PeriodosDataGrid from "../../components/PeriodosDataGrid";



export default function Periodos() {
  const router = useRouter();
  const { getItem } = useStorage();
  const jwt = getItem('token');
  const { idgestion } = router.query
  const [gestion, setGestion] = useState({
    datos: null,
    isfetched: false
  });

  const cargarGestion = async () => {
    let gest = await obtenerGestion(idgestion, jwt);
    if(gest.ok){
      setGestion({
        datos: gest.data,
        isfetched: true
      });
    }

  }

  if(!gestion.isfetched){
    cargarGestion();
  }

  

  return (
    <>
          <Head>
              <title>Periodos</title>
          </Head>
          <div  style={{padding:'0 100px'}}>
           
            <h2 style={{display: 'inline-block'}}>Periodos - {gestion.datos!==null?gestion.datos.nombre:""}</h2>
            <PeriodosDataGrid idgestion={idgestion} mindate={gestion.datos!==null?formatInTimeZone(gestion.datos.fechainicio, 'UTC', 'yyy-MM-dd'):""} maxdate={gestion.datos!==null?formatInTimeZone(gestion.datos.fechafin, 'UTC', 'yyy-MM-dd'):""} jwt={jwt}/>
          </div>
         
          
          </>
  );
}

Periodos.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullLayout>
          {page}
      </FullLayout>
    </ThemeProvider>
  )
}