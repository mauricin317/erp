/* eslint-disable import/no-anonymous-default-export */
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { conn } from "../../utils/database";

export default async (req, res) => {
  const response = await conn.query('Select NOW()');
  res.status(200).json({"ping":"ok","time":response.rows[0]})
}
