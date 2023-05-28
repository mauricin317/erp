import Head from 'next/head';
import React from "react";
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import ComprobantesDataGrid from "../components/ComprobantesDataGrid";
import useStorage from './../utils/storageHook';


export default function Comprobantes() {

  const { getItem } = useStorage();
  const jwt = getItem('token');

  return (
    <>
      <Head>
          <title>Gestion de Comprobantes</title>
      </Head>
          <ComprobantesDataGrid jwt={jwt} />
    </>
  );
}

Comprobantes.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullLayout>
          {page}
      </FullLayout>
    </ThemeProvider>
  )
}