import Head from "next/head";
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import useStorage from "../utils/storageHook";
import NotaVentaDataGrid from "../components/NotaVentaDataGrid";

export default function NotaVenta() {
  const { getItem } = useStorage();
  const jwt = getItem("token");

  return (
    <>
      <Head>
        <title>Notas de Venta | ERP</title>
      </Head>
      <NotaVentaDataGrid jwt={jwt} />
    </>
  );
}

NotaVenta.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FullLayout>{page}</FullLayout>
    </ThemeProvider>
  );
};
