export async function obtenerNotasVenta(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/notasventa/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
  }).then((result) => result.json());
}

export async function obtenerArticulosNotasVenta(jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/notasventa/articulos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
  }).then((result) => result.json());
}

export async function obtenerDetallesNotaVenta(idnota, jwt) {
  return fetch(
    process.env.NEXT_PUBLIC_BACKEND_API + `/notasventa/detalles/${idnota}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
    }
  ).then((result) => result.json());
}

export async function crearNotaVenta(datos, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/notasventa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
    body: JSON.stringify(datos),
  }).then((result) => result.json());
}

export async function anularNotaVenta(datos, jwt) {
  return fetch(process.env.NEXT_PUBLIC_BACKEND_API + `/notasventa/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: jwt,
    },
    body: JSON.stringify(datos),
  }).then((result) => result.json());
}
