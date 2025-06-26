import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

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

    // Simulación de login exitoso
    alert(`Inicio de sesión simulado con:\nCorreo: ${email}`);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleRegisterClick = () => {
    navigate('/registro');
  };

  const handleForgotPasswordClick = () => {
    navigate('/recuperarc');
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4 text-center">Inicio de sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Correo:</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Contraseña:</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {showPassword ? '👁️' : '🙈'}
            </button>
          </div>
        </div>

        {error && <p className="text-danger">{error}</p>}

        <div className="d-grid gap-2">
          <button type="submit" className="btn btn-primary">
            Aceptar
          </button>
          <button type="button" onClick={handleRegisterClick} className="btn btn-secondary">
            Registro
          </button>
          <button type="button" onClick={handleForgotPasswordClick} className="btn btn-link">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>
    </div>
  );
};

export default InicioSesion;
