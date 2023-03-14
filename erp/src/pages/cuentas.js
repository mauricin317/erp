import Head from 'next/head';
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import CuentasTreeView from '../components/CuentasTreeView';
import useStorage from './../utils/storageHook';


export default function Cuentas() {

  const { getItem } = useStorage();
  const jwt = getItem('token');

  return (
    <>
      <Head>
          <title>Cuentas | ERP</title>
      </Head>
          <h2>Plan de Cuentas</h2>
          <CuentasTreeView jwt={jwt}  />
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