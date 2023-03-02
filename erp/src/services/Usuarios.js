

export async function loginUser(credentials) {
  return fetch('http://localhost:4000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
    .then(res => res.json())
 }

 export async function actualizarEmpresaSesion(data, jwt) {
  return fetch('http://localhost:4000/api/usuarios/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
 }

 export async function obtenerSesion(jwt) {
  return fetch('http://localhost:4000/api/usuarios/session', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
  })
    .then(res => res.json())
 }