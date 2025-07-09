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
import AgregarUsuarios from './pages/AgregarUsuarios.js';
import AgregarReactivo from './pages/AgregarReactivo.js';
import AgregarCuestionario from './pages/AgregarCuestionario.js';
import Empleados from './pages/Empleados';
import Dashboard from './pages/dashboard';
import ClientesDashboard  from './pages/empresa/ClientesDashboard.js';
import UsuariosDashboard from './pages/usuario/UsuariosDashboard.js';
import ReactivosDashboard from './pages/reactivos/ReactivosDashboard.js';
import CuestionariosDashboard from './pages/cuestionarios/CuestionariosDashboard.js';
import EditarCliente  from './pages/empresa/EditarCliente.js';
import EditarUsuario from './pages/usuario/EditarUsuario.js';
import EditarReactivo from './pages/reactivos/EditarReactivo.js';
import EditarCuestionario from './pages/cuestionarios/EditarCuestionario.js';
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
                <Route path="/empleados" element={<Empleados />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/clientes" element={<ClientesDashboard />} />
                <Route path="/EditarCliente" element={<EditarCliente />} />
                <Route path="/EditarUsuario" element={<EditarUsuario />} />
                <Route path="/EditarReactivo" element={<EditarReactivo />} />
                <Route path="/EditarCuestionario" element={<EditarCuestionario />} />
                <Route path="/usuarios" element={<UsuariosDashboard />} />
                <Route path="/preguntas" element={<ReactivosDashboard />} />
                <Route path="/cuestionarios" element={<CuestionariosDashboard />} />
                <Route path="/agregarusuarios" element={<AgregarUsuarios />} />
                <Route path="/agregarreactivo" element={<AgregarReactivo />} />
                <Route path="/agregarcuestionario" element={<AgregarCuestionario />} />
                
                </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
export default App;
