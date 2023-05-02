export async function obtenerDatosReporte(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/reportes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }