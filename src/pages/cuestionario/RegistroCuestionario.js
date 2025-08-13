import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ApiConfig from '../../apiConfig';
import '../../styles/RegistroEmpresa.css';

const CALC_SAMPLE = (N) => {
  const num = Number(N || 0);
  if (!num || num < 1) return 0;
  // Fórmula NOM-035 (95% / 5%)
  const n = (0.9604 * num) / (0.0025 * (num - 1) + 0.9604);
  return Math.max(1, Math.floor(n));
};

export default function RegistroCuestionario() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [okMsg, setOkMsg]     = useState('');

  const [form, setForm] = useState({
    clienteId: '',
    tipoBackend: '',    // 'CLIMA' | 'NOM035' | 'MIXTO'
    nombre: '',
    cantidad: ''        // límite de cuestionarios a contestar
  });

  const [pickerAbierto, setPickerAbierto] = useState(false);
  const [nEmpleados, setNEmpleados] = useState(0);
  const [cuestionarioId, setCuestionarioId] = useState(null);
  const [codigoUnico, setCodigoUnico] = useState('');

  // Cargar empresas
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await fetch(`${ApiConfig.baseURL}/clientes`);
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.message || 'Error al obtener clientes');
        setEmpresas(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'No se pudieron cargar las empresas');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const empresaSel = useMemo(
    () => empresas.find(e => String(e._id) === String(form.clienteId)),
    [empresas, form.clienteId]
  );

  useEffect(() => {
    setNEmpleados(Number(empresaSel?.numEmplEmpresa || 0));
  }, [empresaSel]);

  const muestraRecomendada = useMemo(() => CALC_SAMPLE(nEmpleados), [nEmpleados]);

  // sugerencia de cantidad cuando el tipo requiere muestra (NOM035 o MIXTO)
  useEffect(() => {
    if (form.tipoBackend === 'NOM035' || form.tipoBackend === 'MIXTO') {
      setForm(prev => ({
        ...prev,
        cantidad: prev.cantidad ? prev.cantidad : (muestraRecomendada ? String(muestraRecomendada) : '')
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tipoBackend, muestraRecomendada]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setOkMsg('');
    setCodigoUnico('');
  };

  const seleccionarTipo = (tipo) => {
    setForm(prev => ({ ...prev, tipoBackend: tipo }));
    setPickerAbierto(false);
    setError('');
    setOkMsg('');
    setCodigoUnico('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setOkMsg('');
    setCodigoUnico('');

    const { clienteId, tipoBackend, nombre } = form;
    const cantidadNum = Number(form.cantidad);

    if (!clienteId) return setError('Selecciona una empresa.');
    if (!tipoBackend) return setError('Selecciona el tipo de cuestionario.');
    if (!nombre) return setError('Ingresa el nombre del cuestionario.');

    // Validación de muestra
    if (tipoBackend === 'NOM035' || tipoBackend === 'MIXTO') {
      if (!cantidadNum || cantidadNum < muestraRecomendada) {
        return setError(`La cantidad no puede ser menor a la muestra recomendada (${muestraRecomendada}).`);
      }
    } else {
      if (!cantidadNum || cantidadNum <= 0) {
        return setError('Ingresa una cantidad válida (> 0).');
      }
    }

    try {
      setLoading(true);

      // 1) Crear cuestionario (guardamos un límite en el cuestionario)
      const resp1 = await fetch(`${ApiConfig.baseURL}/api/cuestionarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId,
          tipo: tipoBackend,                     // 'CLIMA' | 'NOM035' | 'MIXTO' (si tu backend mantiene 2, mapea MIXTO como 'NOM035' o agrega soporte)
          nombre,
          limiteCuestionarios: cantidadNum,
          requiereMuestra: (tipoBackend === 'NOM035' || tipoBackend === 'MIXTO')
        })
      });
      const data1 = await resp1.json();
      if (!resp1.ok) throw new Error(data1?.error || data1?.message || 'No se pudo crear el cuestionario');
      const id = data1?.id || data1?._id;
      setCuestionarioId(id);

      // 2) Generar 1 SOLO código
      const resp2 = await fetch(`${ApiConfig.baseURL}/participantes/generar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuestionarioId: id, cantidad: 1 })
      });
      const data2 = await resp2.json();
      if (!resp2.ok) throw new Error(data2?.message || 'No se pudo generar el código');

      const lista = data2?.codigos || data2?.codigosGenerados || [];
      const code = Array.isArray(lista) ? (lista[0] || '') : '';
      setCodigoUnico(code);
      setOkMsg(`Cuestionario creado. Código generado: ${code}`);

    } catch (err) {
      setError(err.message || 'Error al crear/generar');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!codigoUnico) return;
    const rows = [
      ['codigo', 'cuestionarioId', 'clienteId', 'tipo', 'nombreCuestionario', 'limiteCuestionarios'],
      [codigoUnico, cuestionarioId || '', form.clienteId, form.tipoBackend, form.nombre, form.cantidad]
    ];
    const csv = rows.map(r => r.map(x => `"${String(x ?? '').replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `codigo_${form.tipoBackend}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="page-title">
          <h2>Registro de Cuestionario</h2>
        </div>

        <form className="form-card" onSubmit={handleSubmit}>
          {/* Tipo */}
          <div className="form-row">
            <label>Tipo de cuestionario</label>
            <div style={{ display:'flex', gap: '8px', alignItems:'center', flexWrap:'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPickerAbierto(v => !v)}
              >
                {form.tipoBackend ? form.tipoBackend : 'Seleccionar'}
              </button>

              {pickerAbierto && (
                <div className="card" style={{ padding: '8px 12px' }}>
                  <label style={{ display:'block', marginBottom:6 }}>
                    <input
                      type="radio"
                      name="tipoBackend"
                      checked={form.tipoBackend === 'CLIMA'}
                      onChange={() => seleccionarTipo('CLIMA')}
                    />
                    <span style={{ marginLeft:8 }}>CLIMA</span>
                  </label>
                  <label style={{ display:'block', marginBottom:6 }}>
                    <input
                      type="radio"
                      name="tipoBackend"
                      checked={form.tipoBackend === 'NOM035'}
                      onChange={() => seleccionarTipo('NOM035')}
                    />
                    <span style={{ marginLeft:8 }}>NOM035</span>
                  </label>
                  <label style={{ display:'block' }}>
                    <input
                      type="radio"
                      name="tipoBackend"
                      checked={form.tipoBackend === 'MIXTO'}
                      onChange={() => seleccionarTipo('MIXTO')}
                    />
                    <span style={{ marginLeft:8 }}>CLIMA + NOM035 (Mixto)</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Empresa */}
          <div className="form-row">
            <label>Empresa</label>
            <select
              name="clienteId"
              value={form.clienteId}
              onChange={handleChange}
            >
              <option value="">-- Seleccionar --</option>
              {empresas.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.nomEmpresa}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre */}
          <div className="form-row">
            <label>Nombre del cuestionario</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Evaluación Q3"
            />
          </div>

          {/* N y muestra */}
          <div className="grid-two">
            <div>
              <label>Núm. de empleados (N)</label>
              <input value={nEmpleados || ''} readOnly />
            </div>
            <div>
              <label>Recomendación (muestra)</label>
              <input
                value={muestraRecomendada || ''}
                readOnly
              />
            </div>
          </div>

          {/* Cantidad (límite) */}
          <div className="form-row">
            <label>No. de cuestionarios a generar (límite)</label>
            <input
              name="cantidad"
              type="number"
              min="1"
              value={form.cantidad}
              onChange={handleChange}
              placeholder="Ej. 80"
            />
            <small>
              {(form.tipoBackend === 'NOM035' || form.tipoBackend === 'MIXTO')
                ? `Debe ser ≥ muestra recomendada (${muestraRecomendada}).`
                : 'Define el límite de respuestas para este cuestionario.'}
            </small>
          </div>

          {error && <div className="alert-error">{error}</div>}
          {okMsg && <div className="alert-ok">{okMsg}</div>}

          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Procesando…' : 'Crear y generar código'}
            </button>
          </div>
        </form>

        {codigoUnico && (
          <div className="card">
            <h3>Código generado</h3>
            <code className="code-pill" style={{ fontSize:'1.1rem' }}>{codigoUnico}</code>
            <div style={{ marginTop:12 }}>
              <button onClick={handleDownloadCSV}>Descargar CSV</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
