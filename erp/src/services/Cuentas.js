export async function obtenerCuentas(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/cuentas`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }

 export async function obtenerCuenta(idgestion, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/cuentas/${idgestion}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }

 export async function obtenerDetalleCuentas(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/cuentas/detalle`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }

 export async function crearCuenta(data, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/cuentas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
 }

 export async function editarCuenta(data, idgestion, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/cuentas/${idgestion}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
 }


 export async function eliminarCuenta(idgestion, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/cuentas/${idgestion}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }