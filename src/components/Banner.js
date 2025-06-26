import * as React from 'react';
import { Box, Typography, Button } from '@mui/material';

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
            md: 'polygon(0 0, 60% 0, 40% 100%, 0 100%)'
          }
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '5%',
            transform: 'translateY(-50%)',
            textAlign: 'left', 
            zIndex: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '20px',
            }}
          >
            Optimizando <br /> Tu Tiempo Mejorando <br /> Tus Resultados
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            para que cada minuto cuente en tu día a día
          </Typography>
          <div className="button-container" >
          <Button variant="contained" color="primary" sx={{ marginTop: '30px' }}>Acceso</Button>
          </div>
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
          backgroundImage: 'url(/images/alumnos-uteq.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
          clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)'
        }}
      />
    </Box>
  );
}
