import { createMuiTheme, responsiveFontSizes } from '@material-ui/core'

export const theme = responsiveFontSizes(createMuiTheme({
  palette: {
    primary: {
      main: '#FD8204',
      contrastText: '#fff',
    },
    success: {
      contrastText: '#fff',
      main: '#4caf50',
    },
    text: {
      primary: '#444444',
    },
  },
  shape: {
    borderRadius: 4,
  },
}));
