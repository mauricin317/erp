export async function obtenerComprobantes(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/comprobantes/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    }
  })
    .then(result => result.json())
 }

 export async function obtenerDetalles(idcomprobante, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/comprobantes/detalles/${idcomprobante}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    }
  })
    .then(result => result.json())
}


export async function crearComrpobante(datos, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + '/comprobantes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(datos)
  })
    .then(result => result.json())
 }

 export async function anularComprobante(datos, jwt) {
  return fetch(`http://localhost:3000/api/comprobantes/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(datos)
  })
    .then(result => result.json())
}