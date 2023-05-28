export async function obtenerCategorias(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/categorias`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    }
  })
    .then(result => result.json())
 }

export async function eliminarCategoria(idcategoria,jwt) {
return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/categorias/${idcategoria}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': jwt
  }
})
.then(result => result.json())
}

export async function crearCategoria(datos, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/categorias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(datos)
  })
    .then(result => result.json())
 }

 export async function editarCategoria(datos, idcategoria, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/categorias/${idcategoria}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': jwt
    },
    body: JSON.stringify(datos)
  })
    .then(result => result.json())
 }
