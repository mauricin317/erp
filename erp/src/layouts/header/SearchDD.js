import React, { useEffect, useState } from "react";

import { obtenerEmpresa } from "../../services/Empresas";

const SearchDD = (props) => {

  const [nombre, setNombre] = useState("");


  const cargarEmpresa = async() =>{
    let empresa = await obtenerEmpresa(props.sesion.idempresa, props.jwt);
    if(empresa.ok){
      setNombre(empresa.data.nombre);
    }
  }

  useEffect(()=>{
    if(props.sesion){
      cargarEmpresa();
    }
  },[props.sesion])
  
  return (
    <>
      <h2>Empresa: {nombre}</h2>
    </>
  );
};

export default SearchDD;
