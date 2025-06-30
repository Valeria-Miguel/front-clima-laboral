import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';

const ClientesDashboard = () => {
  const [clientes, setClientes] = useState([]);
  const [todosClientes, setTodosClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [tipoBusqueda, setTipoBusqueda] = useState('nombre');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchClientes = async () => {
    try {
      const response = await fetch('http://localhost:3002/clientes');
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

  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      const response = await fetch('http://localhost:3002/clientes/eliminar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert('Cliente eliminado');
      fetchClientes();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
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
                    <button onClick={() => eliminarCliente(cliente._id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ClientesDashboard;