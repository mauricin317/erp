export async function obtenerLotes(idarticulo, jwt) {
  return fetch(
    process.env.NEXT_PUBLIC_BACKEND_API + `/lotes/${idarticulo}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: jwt,
      },
    }
  ).then((result) => result.json());
}