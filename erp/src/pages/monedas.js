import Head from 'next/head';
import React, { useState } from "react";
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import MonedasDataGrid from '../components/MonedasDataGrid';
import useStorage from '../utils/storageHook';


export default function Monedas() {

  const { getItem } = useStorage();
  const jwt = getItem('token');

  return (
    <>
      <Head>
          <title>Monedas | ERP</title>
      </Head>
          <h2>Configuracion de Monedas</h2>
          <MonedasDataGrid jwt={jwt}/>
    </>
  );
}

Monedas.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullLayout>
          {page}
      </FullLayout>
    </ThemeProvider>
  )
}