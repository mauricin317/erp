import Head from "next/head";
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import useStorage from "../utils/storageHook";
import NotaCompraDataGrid from "../components/NotaCompraDataGrid";

export default function NotaCompra() {
  const { getItem } = useStorage();
  const jwt = getItem("token");

  return (
    <>
      <Head>
        <title>Notas de Compra | ERP</title>
      </Head>
      <NotaCompraDataGrid jwt={jwt} />
    </>
  );
}

NotaCompra.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FullLayout>{page}</FullLayout>
    </ThemeProvider>
  );
};
