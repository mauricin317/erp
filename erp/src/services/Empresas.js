export async function obtenerEmpresas(jwt) {
  return fetch('http://localhost:4000/api/empresas', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }

 export async function obtenerEmpresa(idempresa, jwt) {
  return fetch(`http://localhost:4000/api/empresas/${idempresa}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }
 export async function crearEmpresa(data, jwt) {
  return fetch('http://localhost:4000/api/empresas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
 }

 export async function editarEmpresa(data, idempresa, jwt) {
  return fetch(`http://localhost:4000/api/empresas/${idempresa}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
 }


 export async function eliminarEmpresa(idempresa, jwt) {
  return fetch(`http://localhost:4000/api/empresas/${idempresa}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }