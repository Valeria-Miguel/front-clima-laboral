import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 

const Inicio = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate('/registro');
  };

  const handleLoginClick = () => {
    navigate('/inicio-sesion');
  };

  return (
    <div className="inicio-container clean-background">
      <div className="inicio-content">
        <h1 className="titulo">GDAY</h1>
        <h2 className="subtitulo">Donde mejora tu productividad</h2>
        <div className="botones">
          <button className="circular-button" onClick={handleRegisterClick}>Registro</button>
          <button className="circular-button" onClick={handleLoginClick}>Inicio de sesión</button>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
