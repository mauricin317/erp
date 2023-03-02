export async function obtenerEmpresas(jwt) {
  return fetch('http://localhost:4000/api/empresas', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(data => data.json())
 }

 export async function eliminarEmpresa(idempresa, jwt) {
  return fetch(`http://localhost:4000/api/empresas/${idempresa}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(data => data.json())
 }