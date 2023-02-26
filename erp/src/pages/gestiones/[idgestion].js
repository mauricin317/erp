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

import PeriodosDataGrid from "../../components/PeriodosDataGrid"


async function obtenerGestion(idgestion) {
  return fetch(`http://localhost:3000/api/gestiones/${idgestion}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'some browser'
    },
  })
    .then(data => data.json())
 }

export default function Periodos(props) {
  const router = useRouter();
  const { idgestion } = router.query
  const [gestion, setGestion] = useState({
    datos: null,
    isfetched: false
  });

  const cargarGestion = async () => {
    let gest = await obtenerGestion(idgestion);
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
              <title>Periodos | ERP</title>
          </Head>
          <div>
            <Button onClick={() => router.back()} sx={{display: 'inline-block'}}><ArrowBackRoundedIcon/></Button>
            <h2 style={{display: 'inline-block'}}>Configuracion de Periodos - {gestion.datos!==null?gestion.datos.nombre:""}</h2>
          </div>
          <PeriodosDataGrid idgestion={idgestion} mindate={gestion.datos!==null?formatInTimeZone(gestion.datos.fechainicio, 'America/La_Paz', 'yyy-MM-dd'):""} maxdate={gestion.datos!==null?formatInTimeZone(gestion.datos.fechafin, 'America/La_Paz', 'yyy-MM-dd'):""} />
          
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