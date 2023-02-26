import Head from 'next/head';
import FullLayout from "../layouts/FullLayout";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import DashboarGrid from '../components/DashboardGrid';
import theme from "../theme/theme";
import { withIronSessionSsr } from "iron-session/next";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;

    if(!user) return {
      redirect: {
        destination: "/login",
        permanent: false,
      }
    
    }
    return {
      props: {
        user: user,
      },
    };
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

export default function Dashboard({user}) {
  return (
    <>
        <Head>
            <title>Dashboard | ERP</title>
        </Head>
          <h2>Dashboard - Bienvenido {user.nombre}</h2>
          <DashboarGrid />
    </>
  );
}

Dashboard.getLayout = function getLayout(page) {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <FullLayout>
          {page}
      </FullLayout>
    </ThemeProvider>
  )
}
