import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/Inicio-Sesion.css';
import ApiConfig from '../apiConfig';

const InicioSesion = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
  event.preventDefault();

  if (!email || !password) {
    setError('Por favor, completa todos los campos.');
    return;
  }

  try {
    const response = await fetch(`${ApiConfig.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo: email, contrasena: password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Error en el login');
      return;
    }

    // Guardar token y rol en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('rol', data.rol);

    // Redirigir según rol
    if (data.rol === 'cliente') {
      navigate('/cliente');
    } else if (data.rol === 'empleado' || data.rol === 'empleado_cliente') {
      navigate('/empleado');
    } else if (data.rol === 'administrador') {
      navigate('/dashboard');
    } else {
      navigate('/'); // ruta por defecto o "no autorizado"
    }


  } catch (err) {
    setError('Error de conexión con el servidor');
  }
};


  return (
    <>
      <div className="registro-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowBackIcon style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Volver
        </button>
        <h1>Inicio de sesión</h1>
      </div>

      <div className="registro-container">
        <div className="registro-form-wrapper">
          <form className="registro-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Correo:</label>
            <input
              type="email"
              id="email"
              className="registro-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Contraseña:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="registro-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {error && (
              <p style={{ color: '#1E40AF', fontWeight: 'bold' }}>{error}</p>
            )}

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Aceptar</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/registro')}
              >
                Registro
              </button>
            </div>

            <div style={{ marginTop: '18px', textAlign: 'center' }}>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default InicioSesion;
