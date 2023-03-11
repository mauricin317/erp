import React from "react";
import FeatherIcon from "feather-icons-react";
import Image from "next/image";
import userimg from "../../../assets/images/users/7.jpg";
import useStorage from "../../utils/storageHook";
import {
  Box,
  Menu,
  Typography,
  Link,
  ListItemButton,
  List,
  ListItemText,
  Button,
  Divider,
} from "@mui/material";
import { useRouter } from "next/router";



const ProfileDD = (props) => {

  const { removeItem } = useStorage();
  const router = useRouter();
  const [anchorEl4, setAnchorEl4] = React.useState(null);

  const logout = async () => {
    removeItem('token')
    router.push('/')
  };

  const handleClick4 = (event) => {
    setAnchorEl4(event.currentTarget);
  };

  const handleClose4 = () => {
    setAnchorEl4(null);
  };
  return (
    <>
      <Button
        aria-label="menu"
        color="inherit"
        aria-controls="profile-menu"
        aria-haspopup="true"
        onClick={handleClick4}
      >
        <Box display="flex" alignItems="center">
          <Image
            src={userimg}
            alt={userimg}
            width="30"
            height="30"
            className="roundedCircle"
          />
          <Box
            sx={{
              display: {
                xs: "none",
                sm: "flex",
              },
              alignItems: "center",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                ml: 1,
              }}
            >
              {props.sesion? props.sesion.nombre:""}
            </Typography>
            <FeatherIcon icon="chevron-down" width="20" height="20" />
          </Box>
        </Box>
      </Button>
      <Button
        aria-label="menu"
        aria-controls="profile-menu"
        aria-haspopup="true"
        variant="contained" color="danger" style={{color:"white"}} onClick={logout}
      >
        <Box display="flex" alignItems="center">
       <FeatherIcon icon="power" width="15" height="15" />
          <Box
            sx={{
              display: {
                xs: "none",
                sm: "flex",
              },
              alignItems: "center",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                ml: 1,
              }}
            >
              Cerrar Sesion
            </Typography>
          </Box>
        </Box>
      </Button>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl4}
        keepMounted
        open={Boolean(anchorEl4)}
        onClose={handleClose4}
        // sx={{
        //   "& .MuiMenu-paper": {
        //     width: "385px",
        //   },
        // }}
      >
        <Box p={0}>
          <Box p={0}>
            <List
              component="nav"
              aria-label="secondary mailbox folder"
              onClick={handleClose4}
              sx={{p:0}}
            >
              <ListItemButton>
                <Link href="/" style={{textDecoration: 'none', display:'flex', alignItems:'center', flexWrap: 'wrap'}} >
                <FeatherIcon icon="refresh-ccw" width="20" height="20" />
                <ListItemText sx={{ml:1}} primary={'Cambiar empresa'} 
                />
                </Link>
              </ListItemButton>
            </List>
          </Box>
          {/* <Box p={2}>
              <Button fullWidth variant="contained" color="danger" style={{color:"white"}} onClick={logout}>
                Cerrar Sesion
              </Button>
            </Box> */}
        </Box>
      </Menu>
    </>
  );
};

export default ProfileDD;
