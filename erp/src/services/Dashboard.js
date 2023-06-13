export async function obtenerArticulosBajoStock(idcategoria, cantidad, jwt) {
  return fetch(
    process.env.NEXT_PUBLIC_BACKEND_API +
      `/dashboard/articulos-bajo-stock/?idcategoria=${idcategoria}&cantidad=${cantidad}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
    }
  ).then((result) => result.json());
}

export async function obtenerArticulos(jwt) {
  return fetch(
    process.env.NEXT_PUBLIC_BACKEND_API + `/dashboard/articulos?limit=10`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
    }
  ).then((result) => result.json());
}
