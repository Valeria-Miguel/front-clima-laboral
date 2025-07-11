import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';
import ApiConfig from '../../apiConfig';

const ClientesDashboard = () => {
  const [clientes, setClientes] = useState([]);
  const [todosClientes, setTodosClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState('nombre');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);

  const [modalMessage, setModalMessage] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${ApiConfig.baseURL}/clientes`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cargar clientes');
      setClientes(data);
      setTodosClientes(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarClientes = (valor = busqueda) => {
    const filtro = valor.toLowerCase();
    if (!filtro.trim()) {
      setClientes(todosClientes);
      return;
    }

    const resultados = todosClientes.filter(cliente => {
      if (tipoBusqueda === 'nombre') {
        return cliente.nomEmpresa.toLowerCase().includes(filtro);
      }
      if (tipoBusqueda === 'rfc') {
        return cliente.rfcEmpresa.toLowerCase().includes(filtro);
      }
      return false;
    });

    setClientes(resultados);
  };

  const eliminarCliente = async () => {
  try {
    const response = await fetch(`${ApiConfig.baseURL}/clientes/eliminar`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: clienteToDelete._id }),


    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al eliminar cliente');
    setModalMessage('✅ Cliente eliminado correctamente.');
    setShowResultModal(true);
    fetchClientes();
  } catch (err) {
    setModalMessage('❌ ' + err.message);
    setShowResultModal(true);
  } finally {
    setShowConfirmModal(false);
    setClienteToDelete(null);
  }
};


  const editarCliente = (cliente) => {
    navigate('/EditarCliente', { 
      state: { 
        clienteData: cliente // Enviamos todos los datos del cliente
      } 
    });
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Empresas Registradas</h2>
          <button className="btn-primary" onClick={() => navigate('/empresas')}>Registrar nueva</button>
        </div>

        <div className="dashboard-search">
          <select onChange={(e) => setTipoBusqueda(e.target.value)} value={tipoBusqueda}>
            <option value="nombre">Nombre</option>
            <option value="rfc">RFC</option>
          </select>
          <input
            type="text"
            placeholder={`Buscar por ${tipoBusqueda}`}
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              buscarClientes(e.target.value);
            }}
          />
          <button onClick={() => buscarClientes()}>Buscar</button>
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>RFC</th>
                <th>Responsable</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente._id}>
                  <td>{cliente.nomEmpresa}</td>
                  <td>{cliente.rfcEmpresa}</td>
                  <td>{cliente.nomrespEmpresa} {cliente.aprespEmpresa}</td>
                  <td>{cliente.telrespEmpresa}</td>
                  <td>{cliente.emailrespEmpresa}</td>
                  <td>
                    <button onClick={() => editarCliente(cliente)}>Editar</button>
                    <button onClick={() => {
                      setClienteToDelete(cliente);
                      setShowConfirmModal(true);
                    }}>
                      Eliminar
                    </button>


                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />

      {/* Modal de confirmación */}
{showConfirmModal && clienteToDelete && (
  <div className="modal-overlay">
    <div className="modal-message">
      <p>¿Estás seguro de eliminar a <strong>{clienteToDelete.nomEmpresa}</strong>?</p>

      <div className="modal-buttons">
        <button onClick={eliminarCliente}>Aceptar</button>
        <button
          onClick={() => {
            setShowConfirmModal(false);
            setClienteToDelete(null);
          }}
          style={{ backgroundColor: '#ccc', marginLeft: '10px' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}

{/* Modal de resultado */}
{showResultModal && (
  <div className="modal-overlay">
    <div className="modal-message">
      <p>{modalMessage}</p>
      <button onClick={() => setShowResultModal(false)}>Cerrar</button>
    </div>
  </div>
)}

    </>
  );
};

export default ClientesDashboard;