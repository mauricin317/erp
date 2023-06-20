import Head from "next/head";
import { useState, useEffect } from "react";
import FullLayout from "../../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../../theme/theme";
import FormArticulosBajoStock from "../../components/ReportesForm/FormArticulosBajoStock";
import { ToastContainer, toast } from "react-toastify";
import useStorage from "./../../utils/storageHook";
import "react-toastify/dist/ReactToastify.min.css";
import { obtenerArticulos } from "../../services/Dashboard";

export default function Reportes() {
  const { getItem } = useStorage();
  const jwt = getItem("token");

  const [state, setState] = useState({
    categorias: [],
  });

  const cargarDatos = async () => {
    let datos = await obtenerArticulos(jwt);
    if (datos.ok) {
      setState({
        categorias: datos.categorias,
      });
    } else {
      toast.warn(datos.mensaje, { theme: "colored" });
      setState({
        categorias: [],
      });
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <>
      <Head>
        <title>Reporte Articulos con Bajo Stock</title>
      </Head>
      <h2>Reporte Articulos con Bajo Stock</h2>
      <FormArticulosBajoStock categorias={state.categorias} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
      />
    </>
  );
}

Reportes.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FullLayout>{page}</FullLayout>
    </ThemeProvider>
  );
};
