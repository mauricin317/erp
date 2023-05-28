import Head from "next/head";
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import useStorage from "../utils/storageHook";
import ArticulosDataGrid from "../components/ArticulosDataGrid";

export default function Articulo() {
  const { getItem } = useStorage();
  const jwt = getItem("token");

  return (
    <>
      <Head>
        <title>Artículos | ERP</title>
      </Head>
      <h2>Artículos</h2>
      <ArticulosDataGrid jwt={jwt} />
    </>
  );
}

Articulo.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FullLayout>{page}</FullLayout>
    </ThemeProvider>
  );
};
