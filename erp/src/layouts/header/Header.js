import React, { useState, useEffect} from "react";
import FeatherIcon from "feather-icons-react";
import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import PropTypes from "prop-types";

// Dropdown Component
import SearchDD from "./SearchDD";
import ProfileDD from "./ProfileDD";

const Header = ({ sx, customClass, toggleMobileSidebar, position, sesionData, jwt}) => {

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
              color:"black"
            },
          }}
        >
          <FeatherIcon icon="menu" width="40" height="40" />
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
