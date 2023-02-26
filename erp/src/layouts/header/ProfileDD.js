import React from "react";
import FeatherIcon from "feather-icons-react";
import Image from "next/image";
import userimg from "../../../assets/images/users/7.jpg";
import useSWR from 'swr';
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


async function logoutUser(credentials) {
  return fetch('http://localhost:3000/api/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
    .then(data => data.json())
 }


const fetcher = (...args) => fetch(...args).then(res => res.json());

const ProfileDD = () => {
  const router = useRouter();
  const [anchorEl4, setAnchorEl4] = React.useState(null);
  const { data, error } = useSWR('/api/usuarios/session', fetcher);

  const logout = async () => {
    let logout = await logoutUser();
      if(logout.ok){
        router.push('/')
      }
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
              {data?data.user.nombre:"-"}
            </Typography>
            <FeatherIcon icon="chevron-down" width="20" height="20" />
          </Box>
        </Box>
      </Button>
      <Menu
        id="profile-menu"
        anchorEl={anchorEl4}
        keepMounted
        open={Boolean(anchorEl4)}
        onClose={handleClose4}
        sx={{
          "& .MuiMenu-paper": {
            width: "385px",
          },
        }}
      >
        <Box>
          <Box p={2} pt={0}>
            <List
              component="nav"
              aria-label="secondary mailbox folder"
              onClick={handleClose4}
            >
              <ListItemButton>
                <Link href="/" style={{textDecoration: 'none'}}>
                <ListItemText primary="Cambiar Empresa" />
                </Link>
              </ListItemButton>
            </List>
          </Box>
          <Divider />
          <Box p={2}>
              <Button fullWidth variant="contained" color="danger" style={{color:"white"}} onClick={logout}>
                Cerrar Sesion
              </Button>
          </Box>
        </Box>
      </Menu>
    </>
  );
};

export default ProfileDD;
