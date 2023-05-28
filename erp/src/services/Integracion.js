export async function obtenerIntegracion(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + '/integracion', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    }
  })
    .then(result => result.json())
 }

 export async function actualizarIntegracion(datos, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + '/integracion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(datos)
  })
    .then(result => result.json())
 }