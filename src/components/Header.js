import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EqualizerIcon from '@mui/icons-material/Equalizer';

export function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000); // tiempo actual en segundos
    return payload.exp < now;
  } catch (error) {
    return true; // Si no se puede leer el token, lo tratamos como expirado
  }
}


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const mainColor = '#1E40AF';

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleProtectedNavigation = (path) => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate(path);
    } else {
      navigate('/inicio-sesion');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    setUser(null);
    navigate('/inicio-sesion');
  };



 useEffect(() => {
  const checkToken = () => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (token && rol) {
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('rol');
        setUser(null);
        navigate('/inicio-sesion');
      } else {
        setUser({ rol });
      }
    } else {
      setUser(null);
    }
  };

  checkToken(); // Verifica inmediatamente al montar

  const interval = setInterval(() => {
    checkToken(); // Verifica cada 10 segundos
  }, 10000);

  return () => clearInterval(interval); // Limpia el intervalo al desmontar
}, [navigate]);
 
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
            {user && user.rol === 'administrador' && (
              <>
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
                  to="/dashboard"
                  startIcon={<DashboardIcon sx={{ color: mainColor }} />}
                >
                  DASHBOARD
                </Button>
              </>
            )}

            {user ? (
              <>
                {user.rol === 'administrador' && (
                  <Button
                    sx={{ color: mainColor }}
                    onClick={() => handleProtectedNavigation('/perfil')}
                    startIcon={<AccountCircleIcon sx={{ color: mainColor }} />}
                  >
                    PERFIL
                  </Button>
                )}
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

      {/* Menú desplegable móvil */}
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
          {user && user.rol === 'administrador' && (
            <>
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
                to="/dashboard"
                startIcon={<DashboardIcon sx={{ color: mainColor }} />}
              >
                DASHBOARD
              </Button>
            </>
          )}

          {user ? (
            <>
              {user.rol === 'administrador' && (
                <Button
                  sx={{ color: mainColor }}
                  onClick={() => handleProtectedNavigation('/perfil')}
                  startIcon={<AccountCircleIcon sx={{ color: mainColor }} />}
                >
                  PERFIL
                </Button>
              )}
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
      )}
    </Box>
  );
}
