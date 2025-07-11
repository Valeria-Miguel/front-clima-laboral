import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import InicioSesion from './pages/InicioSesion';
import Inicio from './pages/Inicio';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import Empresas from './pages/empresa/AgregarEmpresa';
import AgregarUsuarios from './pages/usuario/AgregarUsuarios.js';
import AgregarReactivo from './pages/AgregarReactivo.js';
import Empleados from './pages/Empleados';
import Dashboard from './pages/dashboard';
import ClientesDashboard  from './pages/empresa/ClientesDashboard.js';
import UsuariosDashboard from './pages/usuario/UsuariosDashboard.js';
import ReactivosDashboard from './pages/reactivos/ReactivosDashboard.js';
import EditarCliente  from './pages/empresa/EditarCliente.js';
import EditarUsuario from './pages/usuario/EditarUsuario.js';
import EditarReactivo from './pages/reactivos/EditarReactivo.js';
import EmpledosDashboard from './pages/empleados_cli/EmpleadosDashboard.js';
import EditarEmpleado from './pages/empleados_cli/EditarEmpleados.js';
import AgregarEmpleado from './pages/empleados_cli/AgregarEmpleados.js';
import './App.css';
import PrivateRoute from './pages/PrivateRoute.js';
import EmpleadosEmpresa from './pages/empleados_cli/EmpleadosEmpresa.js';

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
               
                <Route path="/perfil" element={<PrivateRoute allowedRoles={['administrador']}> <Perfil /> </PrivateRoute> }   />
                <Route path="/empresas" element={<PrivateRoute allowedRoles={['administrador']}> <Empresas /> </PrivateRoute> }   />
                <Route path="/empleados" element={<PrivateRoute allowedRoles={['administrador']}> <Empleados /> </PrivateRoute> }   />
                <Route path="/dashboard" element={<PrivateRoute allowedRoles={['administrador']}> <Dashboard /> </PrivateRoute> }   />
                 <Route path="/clientes" element={<PrivateRoute allowedRoles={['administrador']}> <ClientesDashboard /> </PrivateRoute> }   />

                <Route path="/EditarEmpleado" element={<PrivateRoute allowedRoles={['administrador']}> <EditarEmpleado /> </PrivateRoute> }   />
                <Route path="/Empleados-dashboard" element={<PrivateRoute allowedRoles={['administrador']}> <EmpledosDashboard /> </PrivateRoute> }   />
                 <Route path="/AgregarEmpleado" element={<PrivateRoute allowedRoles={['administrador']}> <AgregarEmpleado /> </PrivateRoute> }   />

                <Route path="/empresa-empleados" element={<EmpleadosEmpresa />} />

                <Route path="/EditarCliente" element={<EditarCliente />} />
                <Route path="/EditarUsuario" element={<EditarUsuario />} />
                <Route path="/EditarReactivo" element={<EditarReactivo />} />
                <Route path="/usuarios" element={<UsuariosDashboard />} />
                <Route path="/preguntas" element={<ReactivosDashboard />} />
                <Route path="/agregarusuarios" element={<AgregarUsuarios />} />
                <Route path="/agregarreactivo" element={<AgregarReactivo />} />
                </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
export default App;
