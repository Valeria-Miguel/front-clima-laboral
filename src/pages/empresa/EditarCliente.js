// src/pages/EditarCliente.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

const EditarCliente = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await fetch(`http://localhost:3002/clientes/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'No se pudo cargar el cliente');
        setForm(data);
      } catch (err) {
        setModalMessage(err.message);
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3002/clientes/editar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...form }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setModalMessage('✅ Cliente actualizado correctamente');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        navigate('/clientes');
      }, 2000);
    } catch (err) {
      setModalMessage(err.message);
      setShowModal(true);
    }
  };

  if (loading || !form) return <p className="text-center">Cargando cliente...</p>;

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Editar Cliente</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {[
                { label: 'Correo de la Empresa', name: 'correoEmpresa', type: 'email' },
                { label: 'Nombre del Responsable', name: 'nomrespEmpresa' },
                { label: 'Apellidos del Responsable', name: 'aprespEmpresa' },
                { label: 'Teléfono del Responsable', name: 'telrespEmpresa' },
                { label: 'Correo del Responsable', name: 'emailrespEmpresa', type: 'email' },
                { label: 'Calle', name: 'calleEmpresa' },
                { label: 'Número Exterior', name: 'extEmpresa' },
                { label: 'Número Interior', name: 'intEmpresa' },
                { label: 'Colonia', name: 'colEmpresa' },
                { label: 'Código Postal', name: 'cpEmpresa' },
                { label: 'Municipio', name: 'mpioEmpresa' },
                { label: 'Estado', name: 'estadoEmpresa' },
                { label: 'Adscripción de estructura', name: 'adsestrucEmpresa' },
                { label: 'Cantidad de formularios', name: 'cuesEmpresa', type: 'number' },
                { label: 'Fecha de Inicio', name: 'inicioEmpresa', type: 'date' },
                { label: 'Fecha de Fin', name: 'finEmpresa', type: 'date' },
              ].map(({ label, name, type = 'text' }) => (
                <div className="form-group" key={name}>
                  <label htmlFor={name}>{label}</label>
                  <input
                    type={type}
                    name={name}
                    id={name}
                    className="registro-input"
                    value={form[name] || ''}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Guardar cambios</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/clientes')}>Cancelar</button>
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

export default EditarCliente;
