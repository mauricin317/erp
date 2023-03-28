import React, { useState, useEffect } from "react";
import {
  experimentalStyled,
  useMediaQuery,
  Container,
  Box,
} from "@mui/material";
import Header from "./header/Header";
import Sidebar from "./sidebar/Sidebar";
import Footer from "./footer/Footer";
import useStorage from "../utils/storageHook";

import { obtenerSesion } from "../services/Usuarios";

const MainWrapper = experimentalStyled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  overflow: "hidden",
  width: "100%",
}));

const PageWrapper = experimentalStyled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  overflow: "hidden",

  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.up("xl")]: {
    paddingTop: "64px",
  },
  [theme.breakpoints.down("xl")]: {
    paddingTop: "64px",
  },
}));

const FullLayout = ({ children, isIndex }) => {
  const { getItem } = useStorage();
  const jwt = getItem('token');
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const xlUp = useMediaQuery((theme) => theme.breakpoints.up("xl"));

  const [sesionData, setSesionData] = useState(null);

  const cargarUsuario = async() =>{
    let sesionData = await obtenerSesion( jwt);
    if(sesionData.ok){
      setSesionData(sesionData.data);
    }
  }

  useEffect(()=>{
    cargarUsuario();
  },[children])



  return (
    <MainWrapper>
      <Header
        sx={{
          paddingLeft: isMobileSidebarOpen ? "265px" : "",
          backgroundColor: "#686c6e",
        }}
        toggleMobileSidebar={() => setMobileSidebarOpen(true)}
        isIndex={isIndex}
        sesionData={sesionData} jwt={jwt}
      />
      {!isIndex && <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
        sesionData={sesionData} jwt={jwt}
      />}
      <PageWrapper>
        <Container
          maxWidth={false}
          sx={{
            paddingTop: "10px",
            paddingLeft: (isMobileSidebarOpen) && !isIndex ? "280px!important" : "",
          }}
        >
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
          <Footer />
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
};

export default FullLayout;
