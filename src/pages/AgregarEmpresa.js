import Header from '../components/Header';
import Footer from '../components/Footer';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegistroEmpresa.css';

const RegistroEmpresa = () => {
  const [form, setForm] = useState({
    nomEmpresa: '', rfcEmpresa: '', calleEmpresa: '', extEmpresa: '', intEmpresa: '', colEmpresa: '', cpEmpresa: '',
    mpioEmpresa: '', estadoEmpresa: '', correoEmpresa: '', nomrespEmpresa: '', aprespEmpresa: '', telrespEmpresa: '',
    emailrespEmpresa: '', giroEmpresa: '', numEmplEmpresa: '', estrucEmpresa: '', adsestrucEmpresa: '', cuesEmpresa: '',
    inicioEmpresa: '', finEmpresa: '',
  });

  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
  const { name, value, type } = e.target;
  setForm(prevForm => ({
    ...prevForm,
    [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
  }));
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(form).some(value => value === '')) {
      setModalMessage('Por favor, completa todos los campos.');
      setShowModal(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/clientes/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Error al registrar la empresa');

      setModalMessage('✅ Registro exitoso. Revisa el correo del responsable.');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate('/clientes');
      }, 2500);
    } catch (err) {
      setModalMessage(err.message || 'Error desconocido');
      setShowModal(true);
    }
  };

  const campos = [
    { label: 'Nombre de la Empresa', name: 'nomEmpresa', maxLength: 100 },
    { label: 'RFC de la Empresa', name: 'rfcEmpresa', maxLength: 13, pattern: '[A-Za-z0-9]{12,13}' },
    { label: 'Calle', name: 'calleEmpresa', maxLength: 100 },
    { label: 'Número Exterior', name: 'extEmpresa', maxLength: 10 },
    { label: 'Número Interior', name: 'intEmpresa', maxLength: 10 },
    { label: 'Colonia', name: 'colEmpresa', maxLength: 100 },
    { label: 'Código Postal', name: 'cpEmpresa', type: 'text', maxLength: 5, pattern: '[0-9]{5}' },
    { label: 'Municipio', name: 'mpioEmpresa', maxLength: 100 },
    { label: 'Estado', name: 'estadoEmpresa', maxLength: 100 },
    { label: 'Correo de la Empresa', name: 'correoEmpresa', type: 'email' },
    { label: 'Nombre del Responsable', name: 'nomrespEmpresa', maxLength: 100 },
    { label: 'Apellidos del Responsable', name: 'aprespEmpresa', maxLength: 100 },
    { label: 'Teléfono del Responsable', name: 'telrespEmpresa', type: 'tel', maxLength: 10, pattern: '[0-9]{10}' },
    { label: 'Correo del Responsable', name: 'emailrespEmpresa', type: 'email' },
    { label: 'Giro de la Empresa', name: 'giroEmpresa', maxLength: 100 },
    { label: 'Número de Empleados', name: 'numEmplEmpresa', type: 'number', min: 1, max: 10000 },
    { label: 'Estructura Organizacional', name: 'estrucEmpresa', maxLength: 100 },
    { label: 'Adscripción de estructura', name: 'adsestrucEmpresa', maxLength: 100 },
    { label: 'Cantidad de formularios', name: 'cuesEmpresa', type: 'number', min: 1, max: 1000 },
    { label: 'Fecha de Inicio', name: 'inicioEmpresa', type: 'date' },
    { label: 'Fecha de Fin', name: 'finEmpresa', type: 'date' },
  ];

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Registro de Empresa</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {campos.map(({ label, name, type = 'text', maxLength, pattern, min, max }) => (
                <div key={name} className="form-group">
                  <label htmlFor={name}>{label}:</label>
                  <input
                    type={type}
                    id={name}
                    name={name}
                    className="registro-input"
                    value={form[name]}
                    onChange={handleChange}
                    required
                    maxLength={maxLength}
                    pattern={pattern}
                    min={min}
                    max={max}
                  />
                </div>
              ))}
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Registrar</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancelar</button>
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

export default RegistroEmpresa;
