import React from 'react';
import { Container, CssBaseline, Typography } from '@mui/material';
import Chat from './Chat';

const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ padding: '24px' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
          AI Chat Assistant
        </Typography>
        <Chat />
      </Container>
    </>
  );
};

export default App;