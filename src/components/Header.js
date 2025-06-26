import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import EventIcon from '@mui/icons-material/Event';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import ClassIcon from '@mui/icons-material/Class';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NightlightRoundIcon from '@mui/icons-material/NightlightRound';
import EqualizerIcon from '@mui/icons-material/Equalizer';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleProtectedNavigation = (path) => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      navigate(path);
    } else {
      navigate('/inicio-sesion');
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'white' }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <img
              src="/images/g_day-h-16x9.png"
              alt="DevU Logo"
              style={{ maxHeight: '60px', marginRight: '15px' }}
            />
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '10px' }}>
            <Button sx={{ color: '#809BCE' }} onClick={() => handleProtectedNavigation('/calendario')} startIcon={<EventIcon />}>
              CALENDARIO
            </Button>
            <Button sx={{ color: '#809BCE' }} component={Link} to="/actividades" startIcon={<ListAltIcon />}>
              ACTIVIDADES
            </Button>
            <Button sx={{ color: '#809BCE' }} component={Link} to="/reportes" startIcon={<EqualizerIcon />}>
              REPORTES
            </Button>
            <Button sx={{ color: '#809BCE' }} component={Link} to="/notificaciones" startIcon={<NotificationsNoneIcon />}>
              NOTIFICACIONES
            </Button>
            <Button sx={{ color: '#809BCE' }} component={Link} to="/sueno" startIcon={<NightlightRoundIcon />}>
              HORARIO DE SUEÑO
            </Button>
            <Button sx={{ color: '#809BCE' }} component={Link} to="/clases" startIcon={<ClassIcon />}>
              CLASES
            </Button>
            {user ? (
              <>
                <Button sx={{ color: '#809BCE' }} onClick={() => handleProtectedNavigation('/perfil')} startIcon={<AccountCircleIcon />}>
                  PERFIL
                </Button>
                <Button sx={{ color: '#809BCE' }} onClick={logout} startIcon={<ExitToAppIcon />}>
                  SALIR
                </Button>
              </>
            ) : (
              <>
                <Button sx={{ color: '#809BCE' }} component={Link} to="/acceso" startIcon={<LoginIcon />}>
                  ACCESO
                </Button>
                <Button sx={{ color: '#809BCE' }} component={Link} to="/registro" startIcon={<AppRegistrationIcon />}>
                  REGISTRO
                </Button>
              </>
            )}
          </Box>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="menu"
            sx={{
              display: { xs: 'inline', md: 'none' },
              color: '#809BCE',
              alignSelf: 'center',
              height: '100%',
            }}
            onClick={toggleMenu}
          >
            <MenuIcon fontSize="large" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {menuOpen && (
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            flexDirection: 'column',
            alignItems: 'flex-start',
            bgcolor: 'white',
            padding: '10px',
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            zIndex: 1300,
          }}
        >

          <Button sx={{ color: '#809BCE' }} component={Link} to="/reportes" startIcon={<EqualizerIcon />}>
            REPORTES
          </Button>
          <Button sx={{ color: '#809BCE' }} component={Link} to="/notificaciones" startIcon={<NotificationsNoneIcon />}>
            NOTIFICACIONES
          </Button>

          {user ? (
            <>
              <Button sx={{ color: '#809BCE' }} onClick={() => handleProtectedNavigation('/perfil')} startIcon={<AccountCircleIcon />}>
                PERFIL
              </Button>
              <Button sx={{ color: '#809BCE' }} onClick={logout} startIcon={<ExitToAppIcon />}>
                SALIR
              </Button>
            </>
          ) : (
            <>
              <Button sx={{ color: '#809BCE' }} component={Link} to="/acceso" startIcon={<LoginIcon />}>
                ACCESO
              </Button>
              <Button sx={{ color: '#809BCE' }} component={Link} to="/registro" startIcon={<AppRegistrationIcon />}>
                REGISTRO
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
