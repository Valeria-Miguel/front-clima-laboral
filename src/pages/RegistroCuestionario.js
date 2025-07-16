import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/RegistroEmpresa.css';

const RegistroCuestionario = () => {
  const [form, setForm] = useState({
    clienteId: '',
    tipo: 'CLIMA LABORAL',
    nombre: ''
  });

  const [empresas, setEmpresas] = useState([]);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerEmpresas = async () => {
      try {
        const response = await fetch('http://localhost:3001/clientes'); // ajusta si tienes proxy
        const data = await response.json();
        setEmpresas(data);
      } catch (err) {
        console.error('Error al obtener empresas', err);
        setModalMessage('Error al cargar empresas');
        setShowModal(true);
      }
    };

    obtenerEmpresas();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.nombre || !form.clienteId || !form.tipo) {
      setModalMessage('Todos los campos son obligatorios');
      setShowModal(true);
      return;
    }

    try {
      const res = await fetch('http://localhost:3005/api/cuestionarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Error al crear cuestionario');

      setModalMessage('✅ Cuestionario creado correctamente');
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        navigate('/cuestionarios');
      }, 2000);
    } catch (err) {
      setModalMessage(err.message);
      setShowModal(true);
    }
  };

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Registro de Cuestionario</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tipo">Tipo de Cuestionario:</label>
              <select
                name="tipo"
                id="tipo"
                className="registro-input"
                value={form.tipo}
                onChange={handleChange}
              >
                <option value="CLIMA LABORAL">CLIMA LABORAL</option>
                <option value="NOM035">NOM035</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="clienteId">Empresa:</label>
              <select
                name="clienteId"
                id="clienteId"
                className="registro-input"
                value={form.clienteId}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una empresa</option>
                {empresas.map(emp => (
                  <option key={emp._id} value={emp._id}>
                    {emp.nomEmpresa}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre del Cuestionario:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                className="registro-input"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Crear</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/cuestionarios')}>
                Cancelar
              </button>
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

export default RegistroCuestionario;
