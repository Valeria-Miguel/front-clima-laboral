import * as React from 'react';
import { Box, Typography, Button } from '@mui/material';
import imageBanner from '../assets/images/image.png';

export default function Banner() {
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '550px', overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#6d211d',
          zIndex: 1,
          clipPath: {
            xs: 'none',
            md: 'polygon(0 0, 58% 0, 42% 100%, 0 100%)',
          },
        }}
      >
        {/* Contenido de texto */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '6%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            color: '#fff',
            maxWidth: '500px',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
            Optimizando <br /> Tu Tiempo, Mejorando <br /> Tus Resultados
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400 }}>
            Para que cada minuto cuente en tu día a día.
          </Typography>

          <Button
            variant="contained"
            sx={{
              mt: 4,
              backgroundColor: '#fff',
              color: '#6d211d',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#e4e4e4',
              },
            }}
          >
            Acceso
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${imageBanner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
          clipPath: 'polygon(58% 0, 100% 0, 100% 100%, 42% 100%)',
        }}
      />
    </Box>
  );
}
