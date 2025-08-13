import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ===== PDF Styles =====
const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 20, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  sectionTitle: { fontSize: 16, marginBottom: 10, fontWeight: 'bold' },
  question: { fontSize: 12, marginBottom: 5 },
  answer: { fontSize: 10, marginLeft: 10, marginBottom: 10, color: '#555' },
});

// ===== PDF Doc =====
const MyDocument = ({ secciones }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Cuestionario - Todas las Secciones</Text>
      {secciones.map((seccion) => (
        <View key={seccion._id} break>
          <Text style={styles.sectionTitle}>
            Sección {seccion.numero}: {seccion.titulo || ''}
          </Text>
          {seccion.reactivos.map((r, idx) => (
            <View key={(r.reactivoId || r._id || `${idx}`) + '-pdf'}>
              <Text style={styles.question}>{idx + 1}. {r.texto}</Text>
              {Array.isArray(r?.escala?.valores) && r.escala.valores.length > 0
                ? r.escala.valores.map((v, i) => <Text key={i} style={styles.answer}>○ {v}</Text>)
                : <Text style={styles.answer}>[Respuesta abierta]</Text>}
            </View>
          ))}
        </View>
      ))}
    </Page>
  </Document>
);

// ===== utils =====
const cleanObjectId = (raw) => {
  const s = String(raw || '').trim();
  const m = s.match(/[0-9a-fA-F]{24}/);  // extrae 24 hex aunque venga con ObjectId("...")
  return m ? m[0] : '';
};

const romanToNum = (v) => {
  const map = { I: '1', II: '2', III: '3', IV: '4' };
  return map[v] || String(v || '');
};

// ===== Componente =====
const SeccionesDashboard = () => {
  const { cuestionarioId: rawId } = useParams();
  const cuestionarioId = useMemo(() => cleanObjectId(rawId), [rawId]);

  const [secciones, setSecciones] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipo, setTipo] = useState('MIXTO'); // CLIMA | NOM035 | MIXTO
  const navigate = useNavigate();

  // Intenta primero por el gateway y luego directo al micro.
  const API_BASES = [
    'http://localhost:3001/api', // gateway
    'http://localhost:3005'      // micro cuestionarios
  ];

  // Fetch robusto: soporta respuestas HTML (errores) y parsea texto seguro
  const getJsonSafe = async (res) => {
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    const text = await res.text();
    if (!ct.includes('application/json')) {
      // devolvió HTML u otro -> construimos error legible
      const msg = text?.slice(0, 200) || 'Respuesta no JSON';
      throw new Error(`HTTP ${res.status} ${res.statusText} - ${msg}`);
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`No se pudo parsear JSON (HTTP ${res.status}).`);
    }
  };

  const fetchSeccionesTryBase = async (base, id, tipo) => {
    const params = new URLSearchParams({
      cuestionarioId: id,
      populate: 'true',
      tipo: (tipo || 'MIXTO').toUpperCase(),
    });
    const url = `${base}/secciones?${params.toString()}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    const data = await getJsonSafe(res);
    if (!res.ok) {
      const msg = data?.error || data?.message || 'Error al cargar secciones';
      throw new Error(msg);
    }
    return data;
  };

  const normalizeSecciones = (arr = []) =>
    (arr || []).map((sec) => ({
      ...sec,
      numero: romanToNum(sec.numero),
      reactivos: Array.isArray(sec.reactivos) ? sec.reactivos : [],
    }));

  // Si el backend no filtra por "tipo", filtramos en cliente
  const applyTipoFilterClient = (secciones, tipo) => {
    const T = (tipo || 'MIXTO').toUpperCase();
    if (T === 'MIXTO') return secciones;
    return secciones.map(s => ({
      ...s,
      reactivos: (s.reactivos || []).filter(r => (r?.catalogo || 'CLIMA').toUpperCase() === T),
    }));
  };

  const load = async () => {
    if (!cuestionarioId) {
      setError('Error cuestionarioId inválido');
      setSecciones([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    // probamos bases en orden
    let lastErr = null;
    for (const base of API_BASES) {
      try {
        const data = await fetchSeccionesTryBase(base, cuestionarioId, tipo);
        const normalized = normalizeSecciones(data);
        const filtered = applyTipoFilterClient(normalized, tipo);
        setSecciones(filtered);
        setLoading(false);
        return;
      } catch (e) {
        lastErr = e;
        // intenta la siguiente base
      }
    }
    setError(lastErr?.message || 'No fue posible cargar las secciones.');
    setSecciones([]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuestionarioId, tipo]);

  const seccionActiva = secciones.find((s) => s.numero === seccionSeleccionada);

  const eliminarSeccion = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta sección?')) return;
    try {
      // intentamos borrar vía gateway y si falla, por el micro
      let ok = false, lastErr = null;
      for (const base of API_BASES) {
        try {
          const res = await fetch(`${base}/secciones/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ id }),
          });
          const data = await getJsonSafe(res);
          if (!res.ok) throw new Error(data?.error || data?.message || 'Error al eliminar sección');
          ok = true; break;
        } catch (e) { lastErr = e; }
      }
      if (!ok) throw lastErr || new Error('No fue posible eliminar la sección');
      alert('Sección eliminada');
      load();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const editarSeccion = (seccion) => {
    navigate('/editar-seccion', { state: { seccion } });
  };

  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-header" style={{ gap: 8, display: 'flex', alignItems: 'center' }}>
          <h2 style={{ marginRight: 'auto' }}>Cuestionario: Secciones</h2>

          {/* selector de tipo */}
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="form-select"
            style={{ width: 160 }}
            title="Filtrar por tipo de reactivo"
          >
            <option value="MIXTO">Mixto (todos)</option>
            <option value="CLIMA">CLIMA</option>
            <option value="NOM035">NOM035</option>
          </select>

          <button
            className="btn-primary"
            onClick={() => navigate('/registro-seccion', { state: { cuestionarioId } })}
          >
            Registrar Sección
          </button>

          {secciones.length > 0 && (
            <PDFDownloadLink
              document={<MyDocument secciones={secciones} />}
              fileName={`cuestionario_${cuestionarioId}.pdf`}
              className="btn-primary"
              style={{ marginLeft: 8, textDecoration: 'none' }}
            >
              {({ loading }) => (loading ? 'Preparando PDF...' : 'Exportar PDF')}
            </PDFDownloadLink>
          )}
        </div>

        {/* Tabs de 4 secciones */}
        <div className="seccion-tabs">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              className={`tab-button ${seccionSeleccionada === String(num) ? 'active' : ''}`}
              onClick={() => setSeccionSeleccionada(String(num))}
            >
              Sección {num}
            </button>
          ))}
        </div>

        {loading ? (
          <p>Cargando...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : !seccionActiva ? (
          <p>No hay reactivos en esta sección.</p>
        ) : (
          <div className="cuestionario-container">
            <h3>{seccionActiva.titulo || `Sección ${seccionActiva.numero}`}</h3>

            {seccionActiva.reactivos.map((r, index) => (
              <div key={(r.reactivoId || r._id || `${index}`) + '-card'} className="reactivo-card">
                <p>
                  <strong>{index + 1}.</strong> {r.texto}
                  {r.catalogo ? (
                    <span className="badge" style={{ marginLeft: 8 }}>
                      {(r.catalogo || '').toUpperCase()}
                    </span>
                  ) : null}
                </p>

                {Array.isArray(r?.escala?.valores) && r.escala.valores.length > 0 ? (
                  r.escala.valores.map((valor, i) => (
                    <div key={i} className="opcion-escala">
                      <input type="radio" disabled />
                      <label>{valor}</label>
                    </div>
                  ))
                ) : (
                  <textarea
                    rows={2}
                    disabled
                    placeholder="Respuesta abierta"
                    className="reactivo-textarea-disabled"
                  />
                )}
              </div>
            ))}

            <div className="seccion-acciones">
              <button className="btn btn-edit" onClick={() => editarSeccion(seccionActiva)}>
                Editar Sección
              </button>
              <button className="btn btn-delete" onClick={() => eliminarSeccion(seccionActiva._id)}>
                Eliminar Sección
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default SeccionesDashboard;
