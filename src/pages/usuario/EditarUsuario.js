import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/RegistroEmpresa.css';

const EditarUsuario = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuarioData } = location.state || {};
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        if (!usuarioData?._id) {
          throw new Error('No se proporcionaron datos del usuario');
        }

        const response = await fetch(`http://localhost:3003/usuarios/${usuarioData._id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'No se pudo cargar el usuario');
        
        setForm(data);
      } catch (err) {
        setModalMessage(err.message);
        setShowModal(true);
        setTimeout(() => navigate('/usuarios'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [usuarioData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!usuarioData?._id) {
        throw new Error('ID de usuario no disponible');
      }

      const updatedForm = { ...form };

      // Si el campo password está vacío, no se incluye
      if (!updatedForm.password || updatedForm.password.trim() === '') {
        delete updatedForm.password;
      }

      const response = await fetch(`http://localhost:3003/usuarios/${usuarioData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar usuario');
      }

      setModalMessage('✅ Usuario actualizado correctamente');
      setShowModal(true);
      setTimeout(() => navigate('/usuarios'), 2000);
    } catch (err) {
      setModalMessage(`❌ Error: ${err.message}`);
      setShowModal(true);
    }
  };

  if (loading || !form) return <p className="text-center">Cargando usuario...</p>;

  return (
    <>
      <Header />
      <div className="registro-container">
        <div className="registro-form-wrapper">
          <h2 className="text-center mb-4">Editar Usuario</h2>
          <form className="registro-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {[ 
                { label: 'Nombre', name: 'nombre' },
                { label: 'Apellidos', name: 'apellidos' },
                { label: 'Teléfono', name: 'telefono' },
                { label: 'Correo Electrónico', name: 'email', type: 'email' },
                { label: 'Rol', name: 'rol' },
                { label: 'Contraseña', name: 'password', type: 'password', placeholder: 'Dejar vacío para no cambiar' },
              ].map(({ label, name, type = 'text', placeholder }) => (
                <div className="form-group" key={name}>
                  <label htmlFor={name}>{label}</label>
                  <input
                    type={type}
                    name={name}
                    id={name}
                    className="registro-input"
                    value={form[name] || ''}
                    onChange={handleChange}
                    placeholder={placeholder || ''}
                    {...(name !== 'password' ? { required: true } : {})}
                  />
                </div>
              ))}
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">Guardar cambios</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/usuarios')}
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
                navigate('/usuarios');
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

export default EditarUsuario;
