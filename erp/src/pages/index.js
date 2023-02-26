import Head from 'next/head';
import { useState } from 'react';
import styles from '../styles/Home.module.css';
import { Box, Button, Container, TextField, Typography, ButtonGroup } from '@mui/material';
import AddBusinessRoundedIcon from '@mui/icons-material/AddBusinessRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PowerSettingsNewRoundedIcon from '@mui/icons-material/PowerSettingsNewRounded';
import MenuItem from '@mui/material/MenuItem';
import ModalForm from '../components/FormEmpresa/ModalForm';
import AlertDialog from '../components/AlertDialog';
import Link from 'next/link';
import { useRouter } from "next/router";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

async function logoutUser() {
  return fetch('http://localhost:3000/api/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(data => data.json())
 }

 async function updateSession(data) {
  return fetch('http://localhost:3000/api/usuarios/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(data => data.json())
 }

 async function obtenerEmpresas() {
  return fetch('http://localhost:3000/api/empresas', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'some browser'
    },
  })
    .then(data => data.json())
 }

 async function eliminarEmpresa(idempresa) {
  return fetch(`http://localhost:3000/api/empresas/${idempresa}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'some browser'
    },
  })
    .then(data => data.json())
 }

import { withIronSessionSsr } from "iron-session/next";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;

    if(!user) return {
      redirect: {
        destination: "/login",
        permanent: false,
      }
    
    }

    return {
      props: {
        user: user,
      },
    };
  },
  {
    cookieName: "myapp_cookiename",
    password: "complex_password_at_least_32_characters_long",
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  },
);

function Home({user}) {

  const router = useRouter();
  const [empresas, setEmpresas] = useState({
      isfetched: false,
      data: [],
      monedas: []
  })
  const [empresa, setEmpresa] = useState('');
  const [modalform, setModalform] = useState({
    open:false,
    tipo:'nuevo',
    datos:null
  });
  const [openDialog, setOpenDialog] = useState(false);

  const cargarDatos = async () =>{
    if(user != null){
      let emp = await obtenerEmpresas();
      if(emp.ok){
        setEmpresas({
          isfetched:true,
          data: emp.data,
          monedas: emp.monedas
        });
        if(emp.data.length > 0) setEmpresa(emp.data[emp.data.length-1].idempresa)
      }else{
        console.log(emp.mensaje)
      }
    }
    
  }

  if(!empresas.isfetched){
    cargarDatos();
  }
  const handleChange = (event) => {
    setEmpresa(event.target.value);
  };
  const handleNuevo = () => {
    setModalform({
      open:true,
      tipo:'nuevo',
      datos:null
    });
  };
  const handleCloseModal = () => {
    setModalform({
      open:false,
      tipo:'nuevo',
      datos:null
    });
  };
  const handleEditar = () =>{
    setModalform({
      open:true,
      tipo:'editar',
      datos:empresas.data.find(x => x.idempresa === empresa)
    });
  }
  const handleSubmit = () =>{
    setEmpresas({
      isfetched:false,
      data: empresas.data,
      monedas: empresas.monedas
    })
    setEmpresa('')
  }

  const handleEliminar= async () =>{
    let eliminar = await eliminarEmpresa(empresa);
    if(eliminar.ok){
      handleSubmit();
      setOpenDialog(false);
    }else{
      toast.error(eliminar.mensaje,{theme: "colored"});
    }
  }

  const handleClicEliminar = () =>{
    console.log("AAAAAAAaaaa");
    setOpenDialog(true);
  }

  const handleReport= () =>{
    window.open(`http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2Freports&reportUnit=%2Freports%2FEmpresas&standAlone=true&id_usuario=${user.idusuario}&j_username=joeuser&j_password=123&sessionDecorator=no`, '_blank');
  }

  const logout = async () => {
    let logout = await logoutUser();
      if(logout.ok){
        router.push('/')
      }
  }

  const saveSession = async () => {
    let data = {
      idempresa: empresa
    }
    let session = await updateSession(data);
      if(session.ok){
        router.push('/dashboard')
      }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Empresas | ERP</title>
        <meta name="description" content="ERP Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main" sx={{ alignItems: 'center', display: 'flex', flexGrow: 1, minHeight: '100vh' }}>
        <Container maxWidth="sm">
            <Box sx={{pb: 1,pt: 3}}>
              <Typography align="center" color="textSecondary" variant="h5">
                Bienvenido {user.nombre}
              </Typography>
            </Box>
            <Box sx={{ py: 2 , textAlign:'center'}}>
              <TextField id="outlined-select-empresa" select label="Seleccione una Empresa" value={empresa} onChange={handleChange} helperText="Por favor selecciona una empresa" sx={{ textAlign:'center', width:'300px'}} >
                  {empresas.data.map((option,i) => (
                    <MenuItem key={option.idempresa} value={option.idempresa}>
                      {option.nombre}
                    </MenuItem>
                  ))}
                </TextField>
                <Button sx={{ mx: 2, height: '56px' }} color="success" size="large" variant="contained" disabled={empresa==="" ? true : false} onClick={saveSession} ><LoginRoundedIcon/></Button>
            </Box>
            <Box sx={{ py: 2 , textAlign:'center'}}>
                <Button sx={{ mx: 2 }} color="primary" size="large" variant="contained" onClick={handleNuevo} ><AddBusinessRoundedIcon/></Button>
                <Button sx={{ mx: 2 }} color="warning" size="large" variant="contained" disabled={empresa==="" ? true : false} onClick={handleEditar}><EditRoundedIcon/></Button>
                <Button sx={{ mx: 2}} color="error" size="large" variant="contained" onClick={handleEliminar} disabled={empresa===""}><DeleteForeverRoundedIcon/></Button>
                <Button sx={{ mx: 2}} color="secondary" size="large" variant="contained" onClick={handleReport}><AssignmentRoundedIcon/></Button>          
            </Box>
            <Box sx={{ py: 2 , textAlign:'center'}}>
              <Button color="error" onClick={logout}><PowerSettingsNewRoundedIcon/>{' '}Cerrar Sesion</Button>
            </Box>
        </Container>
      </Box>
      <ModalForm open={modalform.open} tipo={modalform.tipo} datos={modalform.datos} monedas={empresas.monedas} close={handleCloseModal} submit={handleSubmit}></ModalForm>
      <AlertDialog open={openDialog} title={"¿Seguro que desea eliminar esta empresa?"} body={"La empresa no se podrá volver a recuperar"} btnText={"Eliminar"} close={() => setOpenDialog(false)} confirm={handleEliminar} />
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
    </div>
  )
}


export default Home