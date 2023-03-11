import React, { useState, useEffect} from "react";
import FeatherIcon from "feather-icons-react";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import PropTypes from "prop-types";
import useStorage from "../../utils/storageHook";

import { obtenerSesion } from "../../services/Usuarios";
// Dropdown Component
import SearchDD from "./SearchDD";
import ProfileDD from "./ProfileDD";

const Header = ({ sx, customClass, toggleMobileSidebar, position }) => {

  const { getItem } = useStorage();
  const jwt = getItem('token');
  const [sesionData, setSesionData] = useState(null);

  const cargarUsuario = async() =>{
    let sesionData = await obtenerSesion( jwt);
    if(sesionData.ok){
      setSesionData(sesionData.data);
    }
  }

  useEffect(()=>{
    cargarUsuario();
  },[])

  return (
    <AppBar sx={sx} position={position} elevation={0} className={customClass}>
      <Toolbar>
        <IconButton
          size="large"
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              xl: "none",
              xs: "flex",
            },
          }}
        >
          <FeatherIcon icon="menu" width="20" height="20" />
        </IconButton>
        {/* ------------------------------------------- */}
        {/* Search Dropdown */}
        {/* ------------------------------------------- */}
        <SearchDD sesion={sesionData} jwt={jwt} />
        {/* ------------ End Menu icon ------------- */}

        <Box flexGrow={1} />

        <ProfileDD sesion={sesionData} jwt={jwt} />
        {/* ------------------------------------------- */}
        {/* Profile Dropdown */}
        {/* ------------------------------------------- */}
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
  customClass: PropTypes.string,
  position: PropTypes.string,
  toggleSidebar: PropTypes.func,
  toggleMobileSidebar: PropTypes.func,
};

export default Header;
