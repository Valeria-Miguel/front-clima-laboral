import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(rol)) {
    // Opcional: redirigir a "No autorizado" o home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
