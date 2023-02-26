import Head from 'next/head';
import React from "react";
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import ComprobantesDataGrid from "../components/ComprobantesDataGrid";


export default function Comprobantes() {


  return (
    <>
      <Head>
          <title>Comprobantes | ERP</title>
      </Head>
          <ComprobantesDataGrid />
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