/* eslint-disable import/no-anonymous-default-export */
import { conn } from "../../../utils/database";

export default async (req, res) => {
  const {method,body} = req;
  const response = await conn.query('Select NOW()');
  res.status(200).json({"ping":"ok","time":response.rows[0]})
}

