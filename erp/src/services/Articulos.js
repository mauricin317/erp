export async function obtenerArticulos(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/articulos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
  }).then((result) => result.json());
}

export async function eliminarArticulo(idarticulo, jwt) {
  return fetch(
    process.env.NEXT_PUBLIC_BACKEND_API + `/articulos/${idarticulo}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
    }
  ).then((result) => result.json());
}

export async function crearArticulo(datos, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/articulos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
    body: JSON.stringify(datos),
  }).then((result) => result.json());
}

export async function editarArticulo(datos, idarticulo, jwt) {
  return fetch(
    process.env.NEXT_PUBLIC_BACKEND_API + `/articulos/${idarticulo}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
      body: JSON.stringify(datos),
    }
  ).then((result) => result.json());
}
