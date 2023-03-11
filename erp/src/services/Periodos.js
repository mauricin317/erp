export async function obtenerPeriodos(idgestion, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/gestiones/periodos/${idgestion}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }

 export async function obtenerPeriodo(idperiodo, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/periodos/${idperiodo}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }
 export async function crearPeriodo(data, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/periodos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
 }

 export async function editarPeriodo(data, idperiodo, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/periodos/${idperiodo}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
 }


 export async function eliminarPeriodo(idperiodo, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/periodos/${idperiodo}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }