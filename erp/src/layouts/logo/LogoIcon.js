import React from "react";
import { Link } from "@mui/material";
import Image from "next/image";
import LogoDark from "../../../assets/images/logos/logo-erp.jpg";

const LogoIcon = () => {
  return (
    <Link href="/dashboard">
      <Image layout="fixed" width={100} height={100} src={LogoDark} alt={LogoDark} />
    </Link>
  );
};

export default LogoIcon;
