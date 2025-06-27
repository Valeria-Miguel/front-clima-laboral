import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Registro.css';

const Registro = () => {
  const navigate = useNavigate();

  const nombreRef = useRef();
  const appRef = useRef();
  const apmRef = useRef();
  const telefonoRef = useRef();
  const correoRef = useRef();
  const passwordRef = useRef();

  const [showPassword, setShowPassword] = useState(false);

  const hasConsecutiveNumbers = (password) => {
    for (let i = 0; i < password.length - 1; i++) {
      const currentChar = parseInt(password[i]);
      const nextChar = parseInt(password[i + 1]);
      if (!isNaN(currentChar) && !isNaN(nextChar) && nextChar === currentChar + 1) {
        return true;
      }
    }
    return false;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const password = passwordRef.current.value;

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(password)) {
      alert('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }

    if (hasConsecutiveNumbers(password)) {
      alert('La contraseña no debe contener números consecutivos.');
      return;
    }

    alert('Registro exitoso. Redirigiendo al inicio de sesión...');
    navigate('/inicio-sesion');
  };

  return (
    <>
      <header className="registro-header">
        <button
          onClick={() => navigate(-1)}
          className="btn-back"
          aria-label=""
        >
          ← 
        </button>
        <h1>Registro</h1>
      </header>

      <div className="registro-container">
        <div className="registro-form-wrapper">
          <form onSubmit={handleSubmit} className="registro-form">
            <label>Nombre:</label>
            <input type="text" ref={nombreRef} required className="registro-input" />

            <label>Apellido paterno:</label>
            <input type="text" ref={appRef} required className="registro-input" />

            <label>Apellido materno:</label>
            <input type="text" ref={apmRef} required className="registro-input" />

            <label>Teléfono:</label>
            <input type="text" ref={telefonoRef} required className="registro-input" />

            <label>Correo:</label>
            <input type="email" ref={correoRef} required className="registro-input" />

            <label>Contraseña:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                ref={passwordRef}
                required
                className="registro-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Registrar</button>
              <button
                type="button"
                onClick={() => navigate('/inicio-sesion')}
                className="btn-secondary"
              >
                Iniciar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Registro;
