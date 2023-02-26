import Head from 'next/head';
import React, { useState } from "react";
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import MonedasDataGrid from '../components/MonedasDataGrid';


export default function Monedas() {


  return (
    <>
      <Head>
          <title>Monedas | ERP</title>
      </Head>
          <h2>Configuracion de Monedas</h2>
          <MonedasDataGrid/>
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