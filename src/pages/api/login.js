import { withIronSessionApiRoute } from "iron-session/next";
import { conn } from "../../utils/database";

export default withIronSessionApiRoute(
  async function loginRoute(req, res) {
    // get user from database then:
    const {method,body} = req;
    if(method == "POST"){
        const {usuario,contraseña} = body
        const query = 'Select * from usuario where usuario=$1 AND pass=$2 Limit 1';
        const values = [usuario, contraseña];
        const response = await conn.query(query,values);
        if(response.rowCount == 1){
            req.session.user = {
                idusuario: response.rows[0].idusuario,
                nombre: response.rows[0].nombre,
                admin: true,
                idempresa: null
            };
            await req.session.save();
            res.send({ ok: true });
        }else{
            res.send({ ok: false });
        }
    }else{
        res.status("400").send("Bad Request")
    }
    
    
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