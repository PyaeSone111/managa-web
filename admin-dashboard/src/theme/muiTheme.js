import { createTheme } from '@mui/material/styles';
import { colors } from './colors';

const muiTheme = createTheme({
  palette: {
    primary: {
      main: colors.navy,
      dark: colors.navyDark,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.redOrange,
      dark: colors.redOrangeHover,
      contrastText: colors.white,
    },
    warning: {
      main: colors.mango,
    },
    background: {
      default: colors.almond,
      paper: colors.white,
    },
    text: {
      primary: colors.navy,
      secondary: colors.muted,
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: colors.redOrange,
          '&:hover': { backgroundColor: colors.redOrangeHover },
        },
        containedSecondary: {
          backgroundColor: colors.navy,
          '&:hover': { backgroundColor: colors.navyDark },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: `${colors.redOrange}20`,
          color: colors.redOrange,
          borderColor: `${colors.redOrange}40`,
        },
      },
    },
  },
});

export default muiTheme;
