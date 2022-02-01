import { createTheme, Theme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

export default function makeTheme(mode: 'light' | 'dark'): Theme {
    return createTheme({
        palette: {
            mode: mode,
            primary: {
                main: red.A200,
            },
            secondary: {
                main: '#19857b',
            },
            error: {
                main: red.A400,
            },
        },
    });
}
