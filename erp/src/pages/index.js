import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import { ThemeProvider } from "@mui/material/styles";
import FullLayout from "../layouts/FullLayout";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../theme/theme";
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import AssessmentSharpIcon from '@mui/icons-material/AssessmentSharp';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import LockIcon from '@mui/icons-material/Lock';
import MenuItem from '@mui/material/MenuItem';
import ModalForm from '../components/FormEmpresa/ModalForm';
import AlertDialog from '../components/AlertDialog';
import { useRouter } from "next/router";
import useStorage from '../utils/storageHook';
import { ToastContainer, toast } from 'react-toastify';
import AddIcon from '@mui/icons-material/Add';
import BorderColorSharpIcon from '@mui/icons-material/BorderColorSharp';

import { obtenerSesion, actualizarEmpresaSesion } from '../services/Usuarios';
import { obtenerEmpresas, eliminarEmpresa } from '../services/Empresas';

import 'react-toastify/dist/ReactToastify.min.css';

function Home() {

  const { getItem, setItem, removeItem } = useStorage();
  const jwt = getItem('token');
  const router = useRouter();
  const [usuario, setUsuario] = useState(null)
  const [empresas, setEmpresas] = useState({
      data: [],
      monedas: []
  })
  const [idEmpresa, setIdEmpresa] = useState('');
  const [modalform, setModalform] = useState({
    open:false,
    tipo:'nuevo',
    datos:null
  });
  const [openDialog, setOpenDialog] = useState(false);

  const cargarDatos = async () =>{
      let emp = await obtenerEmpresas(jwt);
      if(emp.ok){
        if(emp.data.length > 0) setIdEmpresa(emp.data[emp.data.length-1].idempresa)
        setEmpresas({
          data: emp.data,
          monedas: emp.monedas
        });
      }
  }

  const cargarUsuario = async () =>{
    let sesion = await obtenerSesion(jwt);
    if(sesion.ok){
      setUsuario(sesion.data);
    }
}

  useEffect(() => {
      if(jwt == undefined){
        router.push('/login')
        return (<div>Loading...</div>)
      }else{
        cargarUsuario()
        cargarDatos();
      }
  }, []);

  const handleChange = (event) => {
    setIdEmpresa(event.target.value);
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
      datos:empresas.data.find(x => x.idempresa === idEmpresa)
    });
  }
  const handleSubmit = () =>{
    cargarDatos();
  }

  const handleEliminar= async () =>{
    let eliminar = await eliminarEmpresa(idEmpresa, jwt);
    if(eliminar.ok){
      handleSubmit();
      setOpenDialog(false);
      toast.info(eliminar.mensaje,{theme: "colored"});
    }else{
      toast.error(eliminar.mensaje,{theme: "colored"});
    }
  }


  const handleReport= () =>{
    //window.open(`http://localhost:8080/jasperserver/flow.html?_flowId=viewReportFlow&_flowId=viewReportFlow&ParentFolderUri=%2Freports&reportUnit=%2Freports%2FEmpresas&standAlone=true&id_usuario=${usuario.idusuario}&j_username=joeuser&j_password=123&sessionDecorator=no`, '_blank');
  }

  const logout = async () => {
    removeItem('token')
    router.push('/login')
  }

  const saveSession = async () => {
    let data = {
      idempresa: idEmpresa
    }
    let session = await actualizarEmpresaSesion(data, jwt);
      if(session.ok){
        setItem('token',session.token)
        router.push('/inicio')
      }
  }

  return (
    <div className={styles.container}  >
      <Head>
        <title>Bienvenido</title>

        <link rel="icon" href="/favicon.ico" />
      </Head>
 
      <Box component="main" sx={{ alignItems: 'center', pt: '100px', display: 'flex', flexGrow: 1,backgroundColor:'white' }}>
      {usuario && <Container maxWidth="sm" sx={{backgroundColor:'white'}}>
            <Box sx={{pb: 1,pt: 3}}>
              <Typography align="center" color="black" variant="h1" sx={{ fontFamily:'Impact'}}>
               Gestion de Empresas
              </Typography>
            </Box>
            <Box sx={{ py: 2 , textAlign:'center', display: 'flex'}}>
            
              <TextField id="outlined-select-empresa" select label="" value={idEmpresa} onChange={handleChange}  sx={{ width:'100%'}} >
                  {empresas.data.map((option,i) => (
                    <MenuItem key={option.idempresa} value={option.idempresa}>
                      {option.nombre}
                    </MenuItem>
                  ))}
                </TextField>
                <Button sx={{ mx: 2, height: '56px' }} color="info" size="large" variant="contained" disabled={idEmpresa==="" ? true : false} onClick={saveSession} >Entrar<ArrowCircleRightIcon/></Button>
            </Box>
            <Box sx={{ py: 2 , textAlign:'center',display: 'flex'}}>
                <Button sx={{ mx: 2 }} color="success" size="large" variant="contained" onClick={handleNuevo} >Crear<AddIcon/></Button>
                <Button sx={{ mx: 2 }} color="secondary" size="large" variant="contained" disabled={idEmpresa==="" ? true : false} onClick={handleEditar}>Editar<BorderColorSharpIcon/></Button>
                <Button sx={{ mx: 2}} color="error" size="large" variant="contained" onClick={()=>{setOpenDialog(true)}} disabled={idEmpresa===""}>Borrar<DeleteSharpIcon/></Button>
                <Button sx={{ mx: 2}} color="primary" size="large" variant="contained" onClick={handleReport}>Reporte<AssessmentSharpIcon/></Button>   
              
            </Box>
          
        </Container>
        /*: <Container maxWidth="sm">Loading...</Container>*/}
      </Box>
      <ModalForm open={modalform.open} tipo={modalform.tipo} datos={modalform.datos} monedas={empresas.monedas} close={handleCloseModal} submit={handleSubmit} jwt={jwt} ></ModalForm>
      <AlertDialog open={openDialog} title={"¿Seguro que desea eliminar esta empresa?"} body={"La empresa no se podrá volver a recuperar"} btnText={"Eliminar"} close={() => setOpenDialog(false)} confirm={handleEliminar} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
    </div>
  )
}


export default Home


Home.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <FullLayout isIndex>
          {page}
        </FullLayout>
    </ThemeProvider>
  )
}