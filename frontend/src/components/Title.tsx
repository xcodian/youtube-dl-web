import { Box, Link, Paper } from '@mui/material';
import { red } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function Title() {
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
        <Typography variant="h3">
            youtube-dl
        </Typography>
        <Paper sx={{
            backgroundColor: red.A200,
            ml: 2,
            p: 1,
        }}>
            <Typography variant="h3" color="white">
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
