import * as React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Theme, ThemeProvider } from '@mui/material/styles';
import App from './App';
import makeTheme from './theme';
import { useMediaQuery } from '@mui/material';

export const ModeContext = React.createContext({});

function Main() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={makeTheme(mode)}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ModeContext.Provider>
  )
}

ReactDOM.render(
  <Main />,
  document.querySelector('#root'),
);
