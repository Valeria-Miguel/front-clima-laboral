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
  const [showModalError, setShowModalError] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState('');

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
      setModalErrorMessage(data.message || 'Error en el login');
      setShowModalError(true);
      return;
    }

    // Guardar token y rol en localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('rol', data.rol);

    // Redirigir según rol
    if (data.rol === 'cliente') {
      navigate('/inicio_cliente');
    } else if (data.rol === 'empleado' || data.rol === 'empleado_cliente') {
      navigate('/inicio_empleado');
    } else if (data.rol === 'administrador') {
      navigate('/dashboard');
    } else {
      navigate('/'); // ruta por defecto o "no autorizado"
    }


    } catch (err) {
    setModalErrorMessage('Error de conexión con el servidor');
    setShowModalError(true);
  }

};


  return (
    <>
      <div className="registro-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <ArrowBackIcon style={{ verticalAlign: 'middle', marginRight: '6px' }} />
          Volver
        </button>
        <button className="btn-back" onClick={() => navigate('/')}>
          Inicio
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
        return (
    <>
      <div className="registro-header">
        {/* ...tu código actual... */}
      </div>

      <div className="registro-container">
        <div className="registro-form-wrapper">
          {/* ...formulario... */}
        </div>
      </div>

      {/* Aquí agregas el modal */}
      {showModalError && (
        <div className="modal-overlay">
          <div className="modal-message">
            <p>{modalErrorMessage}</p>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setShowModalError(false);
                  setEmail('');
                  setPassword('');
                  setError('');
                }}
              >
                Aceptar
              </button>
              
            </div>
          </div>
        </div>
      )}
    </>
  );
    </>
    
  );
};



export default InicioSesion;
