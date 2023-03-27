

 export async function obtenerEmpresamonedas(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/empresamonedas/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    }
  })
    .then(result => result.json())
 }

 export async function crearEmpresamoneda(datos, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API +`/empresamonedas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(datos)
  })
    .then(result => result.json())
 }