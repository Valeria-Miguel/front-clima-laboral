import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ApiConfig from '../../apiConfig';
import '../../styles/ClientesDashboard.css';

const EmpleadosEmpresa = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { empresa } = location.state || {};

  const [empleados, setEmpleados] = useState([]);
  const [todosEmpleados, setTodosEmpleados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState('nombre');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [empleadoIdToDelete, setEmpleadoIdToDelete] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);

  const fetchEmpleados = async () => {
    try {
      const response = await fetch(`${ApiConfig.baseURL}/empleados_clientes/by-codEmpresa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codEmpresa: empresa.codEmpresa }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cargar empleados');

      setEmpleados(data);
      setTodosEmpleados(data);
    } catch (err) {
      setError(err.message);
      setEmpleados([]);
    } finally {
      setLoading(false);
    }
  };

  const buscarEmpleados = (valor = busqueda) => {
    const filtro = valor.toLowerCase();
    if (!filtro.trim()) {
      setEmpleados(todosEmpleados);
      return;
    }

    const resultados = todosEmpleados.filter(emp => {
      if (tipoBusqueda === 'nombre') {
        return emp.nombres.toLowerCase().includes(filtro) || emp.apellidos.toLowerCase().includes(filtro);
      }
      if (tipoBusqueda === 'email') {
        return emp.email.toLowerCase().includes(filtro);
      }
      return false;
    });

    setEmpleados(resultados);
  };

  const eliminarEmpleado = async () => {
    try {
      const response = await fetch(`${ApiConfig.baseURL}/empleados_clientes/eliminar`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: empleadoIdToDelete }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al eliminar empleado');

      setModalMessage('✅ Empleado eliminado correctamente.');
      setShowResultModal(true);
      fetchEmpleados();
    } catch (err) {
      setModalMessage('❌ ' + err.message);
      setShowResultModal(true);
    } finally {
      setShowConfirmModal(false);
      setEmpleadoIdToDelete(null);
    }
  };


  const editarEmpleado = (empleado) => {
  navigate('/EditarEmpleado', { state: { empleadoData: empleado, empresa } });
};


  useEffect(() => {
    if (empresa) fetchEmpleados();
  }, [empresa]);

  if (!empresa) {
    return (
      <>
        <Header />
        <div className="dashboard-container">
          <p>Empresa no especificada.</p>
          <button className="btn-secondary" onClick={() => navigate(-1)}>← Volver</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Empleados de {empresa.nomEmpresa}</h2>
          <button className="btn-secondary" onClick={() => navigate('/Empleados-dashboard')}>← Volver a empresas</button>
          <button className="btn-primary" onClick={() => navigate('/AgregarEmpleado', { state: { empresa } })}>
            Registrar nuevo empleado
          </button>
        </div>

        <div className="dashboard-search">
          <select onChange={(e) => setTipoBusqueda(e.target.value)} value={tipoBusqueda}>
            <option value="nombre">Nombre</option>
            <option value="email">Correo Electrónico</option>
          </select>
          <input
            type="text"
            placeholder={`Buscar por ${tipoBusqueda}`}
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              buscarEmpleados(e.target.value);
            }}
          />
          <button onClick={() => buscarEmpleados()}>Buscar</button>
        </div>

        {loading ? (
          <p>Cargando empleados...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <table className="clientes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map(emp => (
                <tr key={emp._id}>
                  <td>{emp.nombres} {emp.apellidos}</td>
                  <td>{emp.telefono}</td>
                  <td>{emp.email}</td>
                  <td>
                    <button onClick={() => editarEmpleado(emp)}>Editar</button>
                    <button onClick={() => {
                      setEmpleadoIdToDelete(emp._id);
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
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-message">
            <p>¿Estás seguro de eliminar este empleado?</p>
            <div className="modal-buttons">
              <button onClick={eliminarEmpleado}>Aceptar</button>
              <button onClick={() => {
                setShowConfirmModal(false);
                setEmpleadoIdToDelete(null);
              }} style={{ backgroundColor: '#ccc', marginLeft: '10px' }}>
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

export default EmpleadosEmpresa;
