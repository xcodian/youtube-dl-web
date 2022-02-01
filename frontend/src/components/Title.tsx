import { Box, Link, Paper, useMediaQuery, useTheme, Switch, IconButton } from '@mui/material';
import { red } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import React from 'react';

import { ModeContext } from '..';

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function Title() {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  return <>
    <Box 
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{
            userSelect: "none",
        }}
        mb={1}
    >
        <Typography variant={isSmall ? "h4": "h3"}>
            youtube-dl
        </Typography>
        <Paper sx={{
            backgroundColor: red.A200,
            ml: 2,
            p: 1,
        }}>
            <Typography variant={isSmall ? "h4": "h3"} color="white">
                web
            </Typography>
        </Paper>
    </Box>

    <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        gap={1}
    >
        <Typography variant="body2" color="text.secondary" align="center">
            {'by '}
            <Link color="inherit" href="https://github.com/xxcodianxx">
                xxcodianxx
            </Link>
            {' powered by '}
            <Link color="inherit" href="https://github.com/yt-dlp/yt-dlp">
                yt-dlp
            </Link>
        </Typography>
        <ModeContext.Consumer>
            { 
                ({ mode, setMode }: any) => (
                    <IconButton 
                        onClick={
                            () => setMode(
                                mode == 'dark' 
                                  ? 'light' 
                                  : 'dark'
                            )
                        }
                    >
                        { 
                            mode == 'dark' 
                              ? <Brightness7Icon />
                              : <Brightness4Icon />
                        }
                    </IconButton>
                )
            }
        </ModeContext.Consumer>
    </Box>
  </>;
}
