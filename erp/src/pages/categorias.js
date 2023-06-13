import Head from 'next/head';
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import useStorage from '../utils/storageHook';
import CategoriasTreeView from '../components/CategoriasTreeView';

export default function Categoria() {
  
  const { getItem } = useStorage();
  const jwt = getItem('token');

  return (
    <>
        <Head>
            <title>Categorías</title>
        </Head>
        <div style={{padding:'0 100px'}}>   <h2>Categorías</h2>
        <CategoriasTreeView jwt={jwt} /></div>
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