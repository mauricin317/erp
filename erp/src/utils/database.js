import { Pool } from "pg";

let conn;

if(!conn) {
    conn = new Pool({
        user: "postgres",
        password: "root",
        host: "localhost",
        port: 5432,
        database: "erp"
    })
};

export {conn};