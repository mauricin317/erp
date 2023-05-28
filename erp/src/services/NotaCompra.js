export async function obtenerNotasCompra(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/notascompra/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
  }).then((result) => result.json());
}

export async function obtenerArticulosNotasCompra(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/notascompra/articulos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
  }).then((result) => result.json());
}

export async function obtenerDetallesNotaCompra(idnota, jwt) {
  return fetch(
    process.env.NEXT_PUBLIC_BACKEND_API + `/notascompra/detalles/${idnota}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
    }
  ).then((result) => result.json());
}

export async function crearNotaCompra(datos, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/notascompra`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
    body: JSON.stringify(datos),
  }).then((result) => result.json());
}



export async function anularNotaCompra(datos, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/notascompra/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
    body: JSON.stringify(datos),
  }).then((result) => result.json());
}
