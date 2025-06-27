import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import InicioSesion from './pages/InicioSesion';
import Inicio from './pages/Inicio';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import Empresas from './pages/AgregarEmpresa';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <Router>
            <div>
              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/inicio-sesion" element={<InicioSesion />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/empresas" element={<Empresas />} />
                </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
export default App;
