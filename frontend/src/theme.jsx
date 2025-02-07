import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    grey: {
      0: "#f9f9f9",
      10: "#f0f0f0",
      50: "#e0e0e0",
      100: "#cccccc",
      200: "#999999",
      300: "#666666",
      400: "#333333",
      500: "#000000",
      600: "#000000",
      700: "#000000",
      800: "#000000",
      900: "#000000",
      1000: "#ffffff",
    },
    primary: {
      100: "#cce0cc",
      200: "#99c199",
      300: "#66a266",
      400: "#338333",
      main: "#006400",
      600: "#005000",
      700: "#003c00",
      800: "#002800",
      900: "#001400",
    },
    secondary: {
      100: "#fff6e0",
      200: "#ffedc2",
      300: "#ffe3a3",
      400: "#ffda85",
      main: "#ffd166",
      600: "#cca752",
      700: "#997d3d",
      800: "#665429",
      900: "#332a14",
    },
    tertiary: {
      100: "#ccd8e1",
      200: "#99b2c4",
      300: "#668ba6",
      400: "#336589",
      500: "#003e6b",
      600: "#003256",
      700: "#002540",
      800: "#00192b",
      900: "#000c15",
    },
    background: {
      default: "#f9f9f9",
      paper: "#ffffff",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
      disabled: "#999999",
      hint: "#cccccc",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.125rem",
      fontWeight: 500,
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 500,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
    h4: {
      fontSize: "1.25rem",
      fontWeight: 500,
    },
    h5: {
      fontSize: "1rem",
      fontWeight: 500,
    },
    h6: {
      fontSize: "0.875rem",
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 400,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 400,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 400,
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 400,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
