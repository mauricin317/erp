import Head from 'next/head';
import FullLayout from "../../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../../theme/theme";
import GestionesDataGrid from "../../components/GestionesDataGrid";

export default function Gestiones(props) {

  return (
    <>
          <Head>
              <title>Gestiones | ERP</title>
          </Head>
          <h2>Configuracion de Gestiones</h2>
          <GestionesDataGrid/>
          </>
  );
}

Gestiones.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullLayout>
          {page}
      </FullLayout>
    </ThemeProvider>
  )
}
