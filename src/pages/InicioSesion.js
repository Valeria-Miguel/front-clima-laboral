import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/Inicio-Sesion.css'; 
const InicioSesion = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    alert(`Inicio de sesión simulado con:\nCorreo: ${email}`);
    sessionStorage.setItem('isLoggedIn', 'true');
    navigate('/');
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

            {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

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
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.95rem', padding: '10px 24px' }}
                onClick={() => navigate('/recuperarc')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default InicioSesion;
