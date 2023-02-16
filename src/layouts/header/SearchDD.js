import React, { useState } from "react";
import FeatherIcon from "feather-icons-react";
import { IconButton, Input, Box, Drawer } from "@mui/material";
import useSWR from 'swr';

async function obtenerEmpresa(idempresa) {
  return fetch(`http://localhost:3000/api/empresas/${idempresa}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'some browser'
    },
  })
    .then(data => data.json())
 }
const fetcher = (...args) => fetch(...args).then(res => res.json());

const SearchDD = () => {

  const [nombre, setNombre] = useState("");
  let { data, error } = useSWR('/api/usuarios/session', fetcher);
  const cargarEmpresa = async(idempresa) =>{
    let empresa = await obtenerEmpresa(idempresa);
    if(empresa.ok){
      setNombre(empresa.data[0].nombre);
    }
  }
  if(data){
    cargarEmpresa(data.user.idempresa);
  }
  
  return (
    <>
      <h3>Empresa: {nombre}</h3>
    </>
  );
};

export default SearchDD;
