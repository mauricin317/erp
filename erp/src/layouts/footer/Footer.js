import React from "react";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
const Footer = () => {
  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography>
        © 2022 Todos los derechos reservados por {" "}
        <Link href="https://www.google.com">
          <a>Mauricio Justiniano</a>
        </Link>{" "}
      </Typography>
    </Box>
  );
};

export default Footer;
