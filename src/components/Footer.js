// ./components/Footer.js
import React from 'react';
import { Box, Container, Typography, Link, Fab, Grid } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import GitHubIcon from '@mui/icons-material/GitHub';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import '../App.css';

function Footer() {

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#809BCE' }}>
              <br />
              <GitHubIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
              Developer La Puerta del Mañana
            </Typography>
            <Typography variant="body1">
              <Link href="https://github.com/Gabs-Contreras" color="inherit">
                GitHub
              </Link>
            </Typography>
          </Grid>
          <Grid item xs={9} md={3} sx={{ textAlign: 'center' }}>
            <Carousel showThumbs={false} autoPlay infiniteLoop>
              <div>
                <img src="/images/uteq-h-16x9.png" alt="LOGO UTEQ" />
              </div>
            </Carousel>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#809BCE' }}>
              <br />
              Contacto
            </Typography>
            <Typography variant="body1" sx={{ color: '#809BCE' }}>
              <EmailIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
              Email: gday@lapuertadelmañana.com <br />
              <PhoneIcon sx={{ verticalAlign: 'middle', marginRight: 1 }} />
              Teléfono: 442-456-7890
            </Typography>
          </Grid>
        </Grid>
      </Container>
      <Box
        sx={{
          backgroundColor: '#809BCE',
          py: 2,
          width: '100%',
          position: 'relative',
        }}
      >
        <Typography variant="body2" color="white" align="center">
          {'Copyright © '}
          <Link color="inherit" href="https://github.com/Gabs-Contreras">
            Developer La Puerta del Mañana
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Box>
      <Fab
        color="primary"
        aria-label="scroll back to top"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleScrollTop}
        className="jump"
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Box>
  );
}

export default Footer;

