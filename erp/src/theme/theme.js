import { createTheme } from "@mui/material/styles";
import components from "./ComponentOverRide";
import shadows from "./Shadows";
import typography from "./Typoraphy";
import { esES } from '@mui/material/locale';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#6a1b9a',
      light: '#f3e5f5',
      dark: '#4a148c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0277bd',
      light: '#e3f2fd',
      dark: '#0d47a1',
      contrastText: '#ffffff',
    },
    success: {
      main: '#388e3c',
      dark: '#1b5e20',
      contrastText: '#ffffff',
      light: '#81c784',
    },
    danger: {
      main: '#e53935',
      dark: '#b71c1c',
      light: '#ef9a9a',
    },
    info: {
      main: '#00bcd4',
      light: '#b2ebf2',
      dark: '#00838f',
    },
    error: {
      main: '#e53935',
      dark: '#b71c1c',
      light: '#ef9a9a',
    },
    warning: {
      main: '#ffc107',
      dark: '#ffa000',
      contrastText: '#ffffff',
      light: '#ffe082',
    },
    text: {
      secondary: '#777e89',
      danger: '#fc4b6c',
    },
    grey: {
      A100: '#ecf0f2',
      A200: '#99abb4',
      A400: '#767e89',
      A700: '#e6f4ff',
    },
    action: {
      disabledBackground: 'rgba(73,82,88,0.12)',
      hoverOpacity: 0.02,
      hover: 'rgba(0, 0, 0, 0.03)',
    },
    background: {
      default: '#fafbfb',
    },
  },
  mixins: {
    toolbar: {
      color: '#949db2',
      '@media(min-width:1280px)': {
        minHeight: '64px',
        padding: '0 30px',
      },
      '@media(max-width:1280px)': {
        minHeight: '64px',
      },
    },
  },
  components,
  shadows,
  typography,
  esES,
});

export default theme;
