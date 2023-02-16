import Head from 'next/head';
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import CuentasTreeView from '../components/CuentasTreeView';


export default function Cuentas() {


  return (
    <>
      <Head>
          <title>Gestiones | ERP</title>
      </Head>
          <h2>Plan de Cuentas</h2>
          <CuentasTreeView  />
    </>
  );
}

Cuentas.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullLayout>
          {page}
      </FullLayout>
    </ThemeProvider>
  )
}