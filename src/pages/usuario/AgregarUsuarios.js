import Header from '../../components/Header';
import Footer from '../../components/Footer';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/RegistroEmpresa.css';
import ApiConfig from '../../apiConfig';

const RegistroUsuario = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    email: '',
    password: '',

  });

  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(form).some(value => value === '')) {
      setModalMessage('Por favor, completa todos los campos.');
      setShowModal(true);
      return;
    }

    try {
      const formConRol = { ...form, rol: 'Administrador' };
      
      const response = await fetch(`${ApiConfig.baseURL}/usuarios/registrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formConRol),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al registrar el usuario');

      setModalMessage('✅ Usuario registrado correctamente.');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate('/usuarios');    
      }, 2500);
    } catch (err) {
      setModalMessage(err.message || 'Error desconocido');
      setShowModal(true);
    }
  };

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Registrar Administrador</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombre">Nombre:</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className="registro-input"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellidos">Apellidos:</label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  className="registro-input"
                  value={form.apellidos}
                  onChange={handleChange}
                  required
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono:</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  className="registro-input"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  placeholder="10 dígitos"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo Electrónico:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="registro-input"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="registro-input"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Registrar</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/usuarios')}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-message">
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default RegistroUsuario;
