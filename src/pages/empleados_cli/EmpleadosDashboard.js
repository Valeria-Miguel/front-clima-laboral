import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ApiConfig from '../../apiConfig';
import '../../styles/ClientesDashboard.css';

const EmpleadosDashboard = () => {
  const [clientes, setClientes] = useState([]);
  const [todosClientes, setTodosClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${ApiConfig.baseURL}/clientes`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error al cargar clientes');
      setClientes(data);
      setTodosClientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buscarEmpresas = (valor = busqueda) => {
    const filtro = valor.toLowerCase().trim();
    if (!filtro) return setClientes(todosClientes);

    const resultados = todosClientes.filter((cliente) =>
      cliente.nomEmpresa.toLowerCase().includes(filtro) ||
      cliente.nomrespEmpresa.toLowerCase().includes(filtro) ||
      cliente.aprespEmpresa.toLowerCase().includes(filtro)
    );

    setClientes(resultados);
  };

  const verEmpleados = (empresa) => {
    navigate('/empresa-empleados', { state: { empresa } });
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <h2>Empresas Registradas</h2>

        <div className="dashboard-search">
          <input
            type="text"
            placeholder="Buscar por nombre o responsable"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              buscarEmpresas(e.target.value);
            }}
          />
          <button onClick={() => buscarEmpresas()}>Buscar</button>
        </div>

        {loading ? (
          <p>Cargando empresas...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <div className="empresa-buttons">
            {clientes.map((cliente) => (
              <button
                key={cliente._id}
                className="btn-primary"
                style={{ margin: '10px' }}
                onClick={() => verEmpleados(cliente)}
              >
                {cliente.nomEmpresa} - {cliente.nomrespEmpresa} {cliente.aprespEmpresa}
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default EmpleadosDashboard;
