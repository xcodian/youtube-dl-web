import { Box, Link, Paper, useMediaQuery, useTheme } from '@mui/material';
import { red } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import React from 'react';

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
  </>;
}
