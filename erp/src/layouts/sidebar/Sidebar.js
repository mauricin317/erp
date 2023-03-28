import React from "react";
import NextLink from "next/link";
import PropTypes from "prop-types";
import {
  Box,
  Drawer,
  useMediaQuery,
  List,
  Link,
  Button,
  Typography,
  ListItem,
  ListItemButton,
  Collapse,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FeatherIcon from "feather-icons-react";
import LogoIcon from "../logo/LogoIcon";
import {Menuitems, Contabilidaditems, Inventarioitems, Configuracionitems, Reportesitems} from "./MenuItems";
import { useRouter } from "next/router";

const Sidebar = ({ isMobileSidebarOpen, onSidebarClose, isSidebarOpen, sesionData, jwt }) => {
  const [open, setOpen] = React.useState(true);
  const [collapse, setCollapse] = React.useState("");

  const xlUp = useMediaQuery((theme) => theme.breakpoints.up("xl"));

  const handleClick = (index) => {
    if(sesionData?.idempresa === null){
      return
    }else{
      if (open === index) {
        setOpen((prevopen) => !prevopen);
      } else {
        setOpen(index);
      }
    }
  };

  const handleCollapse = (name) =>{
    if(collapse === name){
      setCollapse("");
    }else{
      setCollapse(name);
    }

    
  }
  let curl = useRouter();
  const location = curl.asPath;



  const SidebarContent = (
    <Box p={2} height="100%">
      <LogoIcon />
      <Box mt={2}>
        <List>
          {Menuitems.map((item, index) => (
            <List component="li" disablePadding key={item.title}>
                <ListItem
                  selected={location === item.href}
                  sx={{
                    mb: 1,
                    ...(location === item.href && {
                      color: "white",
                      backgroundColor: (theme) =>
                        `${theme.palette.primary.main}!important`,
                    }),
                  }}
                >
                  <ListItemButton 
                    onClick={() => handleClick(index)}
                    disabled={sesionData?.idempresa === null}
                  >
                     <NextLink disa href={item.href}>
                  {/* <ListItemIcon>
                    <FeatherIcon
                      style={{
                        color: `${location === item.href ? "white" : ""} `,
                      }}
                      icon={item.icon}
                      width="20"
                      height="20"
                    />
                  </ListItemIcon> */}

                      <ListItemText onClick={onSidebarClose}>
                        {item.title}
                      </ListItemText>
                    </NextLink>
                  </ListItemButton>
                </ListItem>
            </List>
          ))}
        </List>
          {/* <ListItem onClick={() => handleCollapse("contabilidad")} button selected={collapse==="contabilidad"} sx={{mb: 1}} >
            <ListItemText primary="Contabilidad" />
            {collapse==="contabilidad" ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={collapse==="contabilidad"} timeout="auto" unmountOnExit>
          {Contabilidaditems.map((item, index) => (
                <List component="li" disablePadding key={item.title}>
                  <NextLink href={item.href}>
                    <ListItem
                      onClick={() => handleClick(index)}
                      button
                      selected={location === item.href}
                      sx={{
                        mb: 1,
                        ...(location === item.href && {
                          color: "white",
                          backgroundColor: (theme) =>
                            `${theme.palette.primary.main}!important`,
                        }),
                      }}
                    >
                      <ListItemIcon>
                        <FeatherIcon
                          style={{
                            color: `${location === item.href ? "white" : ""} `,
                          }}
                          icon={item.icon}
                          width="20"
                          height="20"
                        />
                      </ListItemIcon>

                      <ListItemText onClick={onSidebarClose}>
                        {item.title}
                      </ListItemText>
                    </ListItem>
                  </NextLink>
                </List>
              ))}
          </Collapse> */}
          {/* <ListItem onClick={() => handleCollapse("inventario")} button selected={collapse==="inventario"} sx={{mb: 1}} >
            <ListItemText primary="Inventario" />
            {collapse==="inventario" ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={collapse==="inventario"} timeout="auto" unmountOnExit>
          {Inventarioitems.map((item, index) => (
                <List component="li" disablePadding key={item.title}>
                  <NextLink href={item.href}>
                    <ListItem
                      onClick={() => handleClick(index)}
                      button
                      selected={location === item.href}
                      sx={{
                        mb: 1,
                        ...(location === item.href && {
                          color: "white",
                          backgroundColor: (theme) =>
                            `${theme.palette.primary.main}!important`,
                        }),
                      }}
                    >
                      <ListItemIcon>
                        <FeatherIcon
                          style={{
                            color: `${location === item.href ? "white" : ""} `,
                          }}
                          icon={item.icon}
                          width="20"
                          height="20"
                        />
                      </ListItemIcon>

                      <ListItemText onClick={onSidebarClose}>
                        {item.title}
                      </ListItemText>
                    </ListItem>
                  </NextLink>
                </List>
              ))}
          </Collapse> */}
          {/* <ListItem onClick={() => handleCollapse("reportes")} button selected={collapse==="reportes"} sx={{mb: 1}} >
            <ListItemText primary="Reportes" />
            {collapse==="reportes" ? <ExpandLess /> : <ExpandMore />}
          </ListItem> */}
          {/* <Collapse in={collapse==="reportes"} timeout="auto" unmountOnExit>
          {Reportesitems.map((item, index) => (
                <List component="li" disablePadding key={item.title}>
                  <NextLink href={item.href}>
                    <ListItem
                      onClick={() => handleClick(index)}
                      button
                      selected={location === item.href}
                      sx={{
                        mb: 1,
                        ...(location === item.href && {
                          color: "white",
                          backgroundColor: (theme) =>
                            `${theme.palette.primary.main}!important`,
                        }),
                      }}
                    >
                      <ListItemIcon>
                        <FeatherIcon
                          style={{
                            color: `${location === item.href ? "white" : ""} `,
                          }}
                          icon={item.icon}
                          width="20"
                          height="20"
                        />
                      </ListItemIcon>

                      <ListItemText onClick={onSidebarClose}>
                        {item.title}
                      </ListItemText>
                    </ListItem>
                  </NextLink>
                </List>
              ))}
          </Collapse> */}
          {/* <ListItem onClick={() => handleCollapse("configuracion")} button selected={collapse==="configuracion"} sx={{mb: 1}} >
            <ListItemText primary="Configuración" />
            {collapse==="configuracion" ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={collapse==="configuracion"} timeout="auto" unmountOnExit>
          {Configuracionitems.map((item, index) => (
                <List component="li" disablePadding key={item.title}>
                  <NextLink href={item.href}>
                    <ListItem
                      onClick={() => handleClick(index)}
                      button
                      selected={location === item.href}
                      sx={{
                        mb: 1,
                        ...(location === item.href && {
                          color: "white",
                          backgroundColor: (theme) =>
                            `${theme.palette.primary.main}!important`,
                        }),
                      }}
                    >
                      <ListItemIcon>
                        <FeatherIcon
                          style={{
                            color: `${location === item.href ? "white" : ""} `,
                          }}
                          icon={item.icon}
                          width="20"
                          height="20"
                        />
                      </ListItemIcon>

                      <ListItemText onClick={onSidebarClose}>
                        {item.title}
                      </ListItemText>
                    </ListItem>
                  </NextLink>
                </List>
              ))}
          </Collapse> */}
         
      </Box>

    </Box>
  );
  // if (xlUp) {
  //   return (
  //     <Drawer
  //       anchor="left"
  //       open={isSidebarOpen}
  //       variant="persistent"
  //       PaperProps={{
  //         sx: {
  //           width: "265px",
  //           border: "0 !important",
  //           boxShadow: "0px 7px 30px 0px rgb(113 122 131 / 11%)",
  //         },
  //       }}
  //     >
  //       {SidebarContent}
  //     </Drawer>
  //   );
  // }
  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      PaperProps={{
        sx: {
          width: "265px",
          border: "0 !important",
        },
      }}
      variant="temporary"
    >
      {SidebarContent}
    </Drawer>
  );
};

Sidebar.propTypes = {
  isMobileSidebarOpen: PropTypes.bool,
  onSidebarClose: PropTypes.func,
  isSidebarOpen: PropTypes.bool,
};

export default Sidebar;
