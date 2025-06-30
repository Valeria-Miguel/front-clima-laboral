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

  const mainColor = '#1E40AF'; 

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ bgcolor: 'white' }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <img
              src="/images/g_day-h-16x9.png"
              alt="GayGreen Logo"
              style={{ maxHeight: '60px', marginRight: '15px' }}
            />
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '10px' }}>
            <Button
              sx={{ color: mainColor }}
              component={Link}
              to="/reportes"
              startIcon={<EqualizerIcon sx={{ color: mainColor }} />}
            >
              REPORTES
            </Button>
            <Button
              sx={{ color: mainColor }}
              component={Link}
              to="/notificaciones"
              startIcon={<NotificationsNoneIcon sx={{ color: mainColor }} />}
            >
              NOTIFICACIONES
            </Button>
                        <Button
              sx={{ color: mainColor }}
              component={Link}
              to="/empresas"
              startIcon={<NotificationsNoneIcon sx={{ color: mainColor }} />}
            >
              EMPRESAS
            </Button>
            {user ? (
              <>
                <Button
                  sx={{ color: mainColor }}
                  onClick={() => handleProtectedNavigation('/perfil')}
                  startIcon={<AccountCircleIcon sx={{ color: mainColor }} />}
                >
                  PERFIL
                </Button>
                <Button
                  sx={{ color: mainColor }}
                  onClick={logout}
                  startIcon={<ExitToAppIcon sx={{ color: mainColor }} />}
                >
                  SALIR
                </Button>
              </>
            ) : (
              <>
                <Button
                  sx={{ color: mainColor }}
                  component={Link}
                  to="/inicio-sesion"
                  startIcon={<LoginIcon sx={{ color: mainColor }} />}
                >
                  ACCESO
                </Button>
                <Button
                  sx={{ color: mainColor }}
                  component={Link}
                  to="/registro"
                  startIcon={<AppRegistrationIcon sx={{ color: mainColor }} />}
                >
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
              color: mainColor,
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
          <Button
            sx={{ color: mainColor }}
            component={Link}
            to="/reportes"
            startIcon={<EqualizerIcon sx={{ color: mainColor }} />}
          >
            REPORTES
          </Button>
          <Button
            sx={{ color: mainColor }}
            component={Link}
            to="/notificaciones"
            startIcon={<NotificationsNoneIcon sx={{ color: mainColor }} />}
          >
            NOTIFICACIONES
          </Button>

          {user ? (
            <>
              <Button
                sx={{ color: mainColor }}
                onClick={() => handleProtectedNavigation('/perfil')}
                startIcon={<AccountCircleIcon sx={{ color: mainColor }} />}
              >
                PERFIL
              </Button>
              <Button
                sx={{ color: mainColor }}
                onClick={logout}
                startIcon={<ExitToAppIcon sx={{ color: mainColor }} />}
              >
                SALIR
              </Button>
            </>
          ) : (
            <>
              <Button
                sx={{ color: mainColor }}
                component={Link}
                to="/acceso"
                startIcon={<LoginIcon sx={{ color: mainColor }} />}
              >
                ACCESO
              </Button>
              <Button
                sx={{ color: mainColor }}
                component={Link}
                to="/registro"
                startIcon={<AppRegistrationIcon sx={{ color: mainColor }} />}
              >
                REGISTRO
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
