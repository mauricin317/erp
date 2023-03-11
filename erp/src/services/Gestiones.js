export async function obtenerGestiones(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/gestiones`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }

 export async function obtenerGestion(idgestion, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/gestiones/${idgestion}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }
 export async function crearGestion(data, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/gestiones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
 }

 export async function editarGestion(data, idgestion, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/gestiones/${idgestion}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
 }


 export async function eliminarGestion(idgestion, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/gestiones/${idgestion}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }