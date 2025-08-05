import Header from '../../components/Header';
import Footer from '../../components/Footer';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/RegistroEmpresa.css';
import ApiConfig from '../../apiConfig';

const AgregarEmpleado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { empresa } = location.state || {};

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    email: '',
  });

  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!empresa?.codEmpresa) {
      setModalMessage('No se puede registrar empleado: código de empresa no disponible.');
      setShowModal(true);
      return;
    }

    if (Object.values(form).some(value => value.trim() === '')) {
      setModalMessage('Por favor, completa todos los campos.');
      setShowModal(true);
      return;
    }

    try {
      const payload = {
        ...form,
        codEmpresa: empresa.codEmpresa,
      };

      const response = await fetch(`${ApiConfig.baseURL}/empleados_clientes/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al registrar empleado');

      setModalMessage(`✅ Empleado registrado correctamente.\n\nUsuario: ${data.nombreUsuario}\nClave: ${data.claveAcceso}\nCódigo: ${data.checkUnico}`);
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate('/empresa-empleados', { state: { empresa } });
      }, 3000);
    } catch (err) {
      setModalMessage('❌ ' + (err.message || 'Error desconocido'));
      setShowModal(true);
    }
  };

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Registrar Empleado para {empresa?.nomEmpresa || 'Empresa'}</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nombres">Nombres:</label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  className="registro-input"
                  value={form.nombres}
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
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Registrar</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/empresa-empleados', { state: { empresa } })}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-message">
            <pre>{modalMessage}</pre>
            <button onClick={() => setShowModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default AgregarEmpleado;
