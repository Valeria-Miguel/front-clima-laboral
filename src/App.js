import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import InicioSesion from './pages/InicioSesion';
import Inicio from './pages/Inicio';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import EmpresasRegistrar from './pages/AgregarEmpresa';
import ClientesDashboard  from './pages/empresa/ClientesDashboard.js';
import EditarCliente  from './pages/empresa/EditarCliente.js';
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
                <Route path="/empresas" element={<EmpresasRegistrar />} />
                <Route path="/clientes" element={<ClientesDashboard />} />
                <Route path="/EditarCliente" element={<EditarCliente />} />
                </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
export default App;
