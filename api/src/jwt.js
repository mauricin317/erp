const jwt = require('jsonwebtoken');
const SECRET_KEY= "6Xp4dQcEe4/kjzt7gH4R8Q=="
module.exports = {
    signToken: (user)=>{
        return jwt.sign({user}, SECRET_KEY,{expiresIn: '10d'})
    },
    ensureToken: (req, res, next) =>{
        const bearerHeader = req.headers['authorization'];
        if (typeof bearerHeader !== 'undefined'){
            jwt.verify(bearerHeader, SECRET_KEY, (err,data) =>{
                if(err){ 
                    console.log(err)
                    res.status(403).json("Token invalido")
                }else{
                    req.user = JSON.parse(data.user);
                    next();
                }
            });
        }else{
            res.status(401).json("No estás Autenticado");
        }
    },
}