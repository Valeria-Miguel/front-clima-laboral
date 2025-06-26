import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

    const nombre = nombreRef.current.value;
    const app = appRef.current.value;
    const apm = apmRef.current.value;
    const telefono = telefonoRef.current.value;
    const correo = correoRef.current.value;
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

    // Simulación de registro exitoso
    alert('Registro exitoso. Redirigiendo al inicio de sesión...');
    navigate('/inicio-sesion');
  };

  return (
    <div style={{ padding: '40px', backgroundColor: '#f2f2f2', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Registro</h2>
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}
      >
        <form onSubmit={handleSubmit}>
          <label>Nombre:</label>
          <input type="text" ref={nombreRef} required />

          <label>Apellido paterno:</label>
          <input type="text" ref={appRef} required />

          <label>Apellido materno:</label>
          <input type="text" ref={apmRef} required />

          <label>Teléfono:</label>
          <input type="text" ref={telefonoRef} required />

          <label>Correo:</label>
          <input type="email" ref={correoRef} required />

          <label>Contraseña:</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              ref={passwordRef}
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
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button type="submit" style={{ marginRight: '10px' }}>Registrar</button>
            <button type="button" onClick={() => navigate('/inicio-sesion')}>Iniciar sesión</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registro;
