import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Title from './components/Title';
import URLEntry from './components/URLEntry';
import { extractIDFromWatchV } from './logic/youtube_endpoint';


export default function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Title />
      </Box>

      <Box sx={{ my: 4 }}>
        <URLEntry prefill={
          extractIDFromWatchV(window.location.href)
        } />
      </Box>
    </Container>
  );
}
