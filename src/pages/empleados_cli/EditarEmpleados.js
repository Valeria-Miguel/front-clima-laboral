import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';
import ApiConfig from '../../apiConfig';

const EditarEmpleado = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { empleadoData, empresa } = location.state || {};

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchEmpleado = async () => {
      try {
        if (!empleadoData?._id) throw new Error('No se proporcionaron datos del empleado');

        const response = await fetch(`${ApiConfig.baseURL}/empleados_clientes/obtener/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: empleadoData._id }),
      });

       
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'No se pudo cargar el empleado');

        setForm(data);
      } catch (err) {
        setModalMessage(err.message);
        setShowModal(true);
        setTimeout(() => navigate('/empresa-empleados', { state: { empresa } }), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleado();
  }, [empleadoData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!empleadoData?._id) throw new Error('ID de empleado no disponible');

      const payload = {
        id: empleadoData._id,
        nombres: form.nombres,
        apellidos: form.apellidos,
        telefono: form.telefono,
        email: form.email,
      };

      const response = await fetch(`${ApiConfig.baseURL}/empleados_clientes/editar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al actualizar el empleado');

      setModalMessage('✅ Empleado actualizado correctamente');
      setShowModal(true);
      setTimeout(() => navigate('/empresa-empleados', { state: { empresa } }), 2000);
    } catch (err) {
      setModalMessage(`❌ Error: ${err.message}`);
      setShowModal(true);
    }
  };

  if (loading || !form) return <p className="text-center">Cargando empleado...</p>;

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Editar Empleado</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {[ 
                { label: 'Nombres', name: 'nombres' },
                { label: 'Apellidos', name: 'apellidos' },
                { label: 'Teléfono', name: 'telefono' },
                { label: 'Correo Electrónico', name: 'email', type: 'email' }
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
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/empresa-empleados', { state: { empresa } })}
              >
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
            <button onClick={() => {
              setShowModal(false);
              if (modalMessage.includes('✅')) {
                navigate('/empresa-empleados', { state: { empresa } });
              }
            }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default EditarEmpleado;
