import Head from 'next/head';
import {useState} from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from "next/router";
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import { ToastContainer,toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

async function loginUser(credentials) {
 return fetch('http://localhost:3000/api/login', {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json'
   },
   body: JSON.stringify(credentials)
 })
   .then(data => data.json())
}

export default function Login() {
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      usuario: '',
      contraseña: ''
    },
    validationSchema: Yup.object({
      usuario: Yup
        .string()
        .max(20, 'Maximo 20 caracteres')
        .required(
          'Campo Nombre de Usuario es requerido'),
      contraseña: Yup
        .string()
        .max(20,'Maximo 20 caracteres')
        .required(
          'Campo Contraseña es requerido')
    }),
    onSubmit:async values => {
      let login = await loginUser(values);
      if(login.ok){
        router.push('/')
      }else{
        toast.error("Usuario o  Contraseña Incorrectos",{theme: "colored"});
      }
    }
  });


  return(
    <>
    <Head>
        <title>Login | ERP</title>
    </Head>
    <Box
        component="main"
        sx={{
          alignItems: 'center',
          display: 'flex',
          flexGrow: 1,
          minHeight: '100vh'
        }}
      >
        <Container maxWidth="sm">
          <form onSubmit={formik.handleSubmit}>
            <Box
              sx={{
                pb: 1,
                pt: 3
              }}
            >
              <Typography
                align="center"
                color="textSecondary"
                variant="h3"
                
              >
                Iniciar Sesión
              </Typography>
            </Box>
            <TextField
              error={Boolean(formik.touched.usuario && formik.errors.usuario)}
              fullWidth autoComplete='off'
              helperText={formik.touched.usuario && formik.errors.usuario}
              label="Nombre de Usuario"
              margin="normal"
              name="usuario"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="text"
              value={formik.values.usuario}
              variant="outlined"
            />
            <TextField
              error={Boolean(formik.touched.contraseña && formik.errors.contraseña)}
              fullWidth autoComplete='off'
              helperText={formik.touched.contraseña && formik.errors.contraseña}
              label="Contraseña"
              margin="normal"
              name="contraseña"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="password"
              value={formik.values.contraseña}
              variant="outlined"
            />
            <Box sx={{ py: 2 }}>
              <Button
                color="primary"
                disabled={formik.isSubmitting}
                fullWidth 
                size="large"
                type="submit"
                variant="contained"
              >
                Log In
              </Button>
            </Box>
          </form>
        </Container>
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover />
      </Box>
    </>
  )
}