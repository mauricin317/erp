import Head from 'next/head';
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import CategoriasTreeView from '../components/CategoriasTreeView';

export default function Categoria() {
  return (
    <>
        <Head>
            <title>Categorías | ERP</title>
        </Head>
        <h2>Categorías</h2>
        <CategoriasTreeView />
    </>
  );
}

Categoria.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullLayout>
          {page}
      </FullLayout>
    </ThemeProvider>
  )
}