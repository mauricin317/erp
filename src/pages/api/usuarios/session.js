/* eslint-disable import/no-anonymous-default-export */
import { withIronSessionApiRoute } from "iron-session/next";

export default withIronSessionApiRoute(
  async function userRoute(req, res) {
    const {method,body} = req;
    if(method == "GET") return res.send({ user: req.session.user });
    if(method == "POST"){
      const {idempresa} = body;
      const {user} = req.session;
      if(idempresa && user){
        req.session.user = {
          idusuario: user.idusuario,
          nombre: user.nombre,
          admin: user.admin,
          idempresa: idempresa
        };
        await req.session.save();
       return res.json({ ok: true });
      }else{
       return res.json({ ok: false });
      }
      
    } 
    else return res.status(400).send("Bad Request")
  },
  {
    cookieName: "myapp_cookiename",
    password: "complex_password_at_least_32_characters_long",
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  },
);