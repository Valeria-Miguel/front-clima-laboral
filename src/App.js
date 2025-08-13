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
import AgregarReactivo from './pages/reactivos/AgregarReactivo.js';
import Empleados from './pages/Empleados';
import Dashboard from './pages/dashboard';
import ClientesDashboard from './pages/empresa/ClientesDashboard.js';
import UsuariosDashboard from './pages/usuario/UsuariosDashboard.js';
import ReactivosDashboard from './pages/reactivos/ReactivosDashboard.js';
import EditarCliente from './pages/empresa/EditarCliente.js';
import EditarUsuario from './pages/usuario/EditarUsuario.js';
import EditarReactivo from './pages/reactivos/EditarReactivo.js';
import EmpledosDashboard from './pages/empleados_cli/EmpleadosDashboard.js';
import EditarEmpleado from './pages/empleados_cli/EditarEmpleados.js';
import AgregarEmpleado from './pages/empleados_cli/AgregarEmpleados.js';

import PrivateRoute from './pages/PrivateRoute.js';
import EmpleadosEmpresa from './pages/empleados_cli/EmpleadosEmpresa.js';
import RegistroDimension from './pages/reactivos/RegistroDimension';
import RegistroEscala from './pages/reactivos/RegistroEscala';
import DimensionesDashboard from './pages/reactivos/DimensionesDashboard.js';
import EscalasDashboard from './pages/reactivos/EscalasDashboard.js';
import EditarDimension from './pages/reactivos/EditarDimension.js';
import EditarEscala from './pages/reactivos/EditarEscala.js';

import CuestionariosDashboard from './pages/cuestionario/CuestionariosDashboard.js';
import RegistroCuestionario from './pages/cuestionario/RegistroCuestionario.js';
import EditarCuestionario from './pages/cuestionario/EditarCuestionario.js';

import SeccionesDashboard from './pages/cuestionario/SeccionesDashboard.js';
import RegistroSeccion from './pages/cuestionario/RegistroSeccion.js';
import EditarSeccion from './pages/cuestionario/EditarSeccion.js';
import InicioClientes from './pages/inicio_clientes.js';
import InicioEmpleado from './pages/inicio_empleado.js';
import FormularioCliente from './pages/formulario/formulario.js';

// import GenerarParticipantes from './pages/captura/GenerarParticipantes';
import CapturaRespuestas   from './pages/captura/CapturaRespuestas';

import './App.css';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary:{ main: '#dc004e' },
  },
  typography: { fontFamily: 'Roboto, sans-serif' },
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

                <Route path="/perfil" element={<PrivateRoute allowedRoles={['administrador']}> <Perfil /> </PrivateRoute>} />
                <Route path="/empresas" element={<PrivateRoute allowedRoles={['administrador']}> <Empresas /> </PrivateRoute>} />
                <Route path="/empleados" element={<PrivateRoute allowedRoles={['administrador']}> <Empleados /> </PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute allowedRoles={['administrador']}> <Dashboard /> </PrivateRoute>} />
                <Route path="/clientes" element={<PrivateRoute allowedRoles={['administrador']}> <ClientesDashboard /> </PrivateRoute>} />

                <Route path="/EditarEmpleado" element={<PrivateRoute allowedRoles={['administrador']}> <EditarEmpleado /> </PrivateRoute>} />
                <Route path="/Empleados-dashboard" element={<PrivateRoute allowedRoles={['administrador']}> <EmpledosDashboard /> </PrivateRoute>} />
                <Route path="/AgregarEmpleado" element={<PrivateRoute allowedRoles={['administrador']}> <AgregarEmpleado /> </PrivateRoute>} />

                <Route path="/empresa-empleados" element={<EmpleadosEmpresa />} />

                <Route path="/inicio_cliente" element={<InicioClientes />} />
                <Route path="/inicio_empleado" element={<InicioEmpleado />} />
                <Route path="/formulario" element={<FormularioCliente />} />

                {/* Escalas */}
                <Route path="/escalas" element={<EscalasDashboard />} />
                <Route path="/registro-escala" element={<RegistroEscala />} />
                <Route path="/editar-escala" element={<EditarEscala />} />

                {/* Dimensiones */}
                <Route path="/dimensiones" element={<DimensionesDashboard />} />
                <Route path="/registro-dimension" element={<RegistroDimension />} />
                <Route path="/editar-dimension" element={<EditarDimension />} />

                {/* Cuestionarios */}
                <Route path="/cuestionarios" element={<CuestionariosDashboard />} />
                <Route path="/registro-cuestionario" element={<RegistroCuestionario />} />
                <Route path="/editar-cuestionario" element={<EditarCuestionario />} />

                {/* Secciones */}
                <Route path="/secciones/:cuestionarioId" element={<SeccionesDashboard />} />
                <Route path="/registro-seccion" element={<RegistroSeccion />} />
                <Route path="/editar-seccion" element={<EditarSeccion />} />

                {/* Captura */}
                {/* <Route path="/captura/generar" element={<GenerarParticipantes />} /> */}
                <Route path="/captura/respuestas" element={<CapturaRespuestas />} />
              </Routes>
            </div>
          </Router>
        </SnackbarProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
export default App;
