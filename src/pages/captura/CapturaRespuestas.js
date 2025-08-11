// src/pages/captura/CapturaRespuestas.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiConfig from '../../apiConfig';
import '../../styles/CapturaRespuestas.css';

export default function CapturaRespuestas() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const prevState = location.state || {};

  const [step, setStep] = useState(1);
  const [cuestionarios, setCuestionarios] = useState([]);
  const [reactivos, setReactivos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lookupInfo, setLookupInfo] = useState(null); // nombre/tipo del cuestionario resuelto por código

  const [form, setForm] = useState({
    participanteCodigo: (prevState.codigo || '').toUpperCase(),
    cuestionarioId:     prevState.cuestionarioId || '',
    metadata: {
      sexo: '',
      edad: '',
      estadoCivil: '',
      nivelEstudios: '',
      adscripcion: '',
      area: '',
      puestoNivel: '',
      tipoPuesto: '',
      tipoContrato: '',
      tipoPersonal: '',
      jornada: '',
      rotacion: '',
      experiencia: '',
      tiempoPuesto: '',
      instruccionAbierta: ''
    },
    respuestas: []
  });

  // Load cuestionarios (por si el código no se encuentra o quieres permitir override)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${ApiConfig.baseURL}/cuestionarios`);
        if (!res.ok) throw new Error('Error al cargar cuestionarios');
        const data = await res.json();
        setCuestionarios(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  // Autocomplete: si ya venías con código en state, intenta resolver al cargar
  useEffect(() => {
    if (form.participanteCodigo) lookupByCode(form.participanteCodigo, /*silent*/ true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar reactivos de NOM035 al elegir cuestionario
  useEffect(() => {
    if (!form.cuestionarioId) return;
    (async () => {
      try {
        setError('');
        // Si luego soportas CLIMA, aquí detectas el tipo del cuestionario y cambias el endpoint
        const res = await fetch(`${ApiConfig.baseURL}/cuestionarios/nom035/reactivos?shuffle=true`);
        if (!res.ok) throw new Error('No se pudieron cargar los reactivos');
        const data = await res.json();
        setReactivos(Array.isArray(data) ? data : []);
        setForm(f => ({ ...f, respuestas: [] })); // reset respuestas al cambiar cuestionario
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [form.cuestionarioId]);

  // --- Helpers ---
  const handleMeta = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, metadata: { ...f.metadata, [name]: value } }));
  };

  const handleResp = (reactivoId, valor) => {
    setForm(f => {
      const others = f.respuestas.filter(r => r.reactivoId !== reactivoId);
      return { ...f, respuestas: [...others, { reactivoId, valor }] };
    });
  };

  // Busca el cuestionario por código y autocompleta
  const lookupByCode = async (codeParam, silent = false) => {
    const code = String(codeParam ?? form.participanteCodigo).trim().toUpperCase();
    if (!code) { if (!silent) setError('Captura tu código.'); return; }
    try {
      const res = await fetch(`${ApiConfig.baseURL}/participantes/lookup/${code}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Código no encontrado');

      setForm(f => ({ ...f, participanteCodigo: code, cuestionarioId: data.cuestionarioId }));
      setLookupInfo({ nombre: data.cuestionario?.nombre, tipo: data.cuestionario?.tipo });
      if (!silent) setSuccess('Código válido. Cuestionario seleccionado automáticamente.');
      setError('');
      return true;
    } catch (err) {
      setLookupInfo(null);
      if (!silent) setError(err.message);
      return false;
    }
  };

  // Pre-check de cupo por límite
  const precheck = async () => {
    setError(''); setSuccess('');
    if (!form.cuestionarioId) { setError('Selecciona un cuestionario'); return false; }
    try {
      const res = await fetch(`${ApiConfig.baseURL}/participantes/precheck`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ cuestionarioId: form.cuestionarioId })
      });
      if (res.status === 409) {
        const data = await res.json();
        setError(data.message || 'Se alcanzó el límite de respuestas.');
        return false;
      }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'No fue posible validar el cupo.');
      }
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // ===== STEP 1 =====
  const Step1 = () => (
    <>
      <div className="form-group">
        <label>Código de Participante:</label>
        <div className="inline">
          <input
            value={form.participanteCodigo}
            onChange={e => setForm(f => ({ ...f, participanteCodigo: e.target.value.toUpperCase() }))}
            onBlur={() => lookupByCode()}
            className="registro-input"
            placeholder="Ej. 417453FE"
          />
          <button type="button" className="btn-secondary" onClick={() => lookupByCode()}>
            Buscar
          </button>
        </div>
        {lookupInfo && (
          <small className="hint">
            Código vinculado a: <b>{lookupInfo.nombre}</b> ({lookupInfo.tipo})
          </small>
        )}
      </div>

      <div className="form-group">
        <label>Cuestionario:</label>
        <select
          value={form.cuestionarioId}
          onChange={e => setForm(f => ({ ...f, cuestionarioId: e.target.value }))}
          className="registro-input"
          disabled={!!lookupInfo}  // si viene por código, lo bloqueamos
        >
          <option value="">-- Selecciona uno --</option>
          {cuestionarios.map(c => (
            <option key={c._id} value={c._id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="wizard-buttons">
        <button
          className="btn-primary"
          onClick={async () => {
            if (!form.participanteCodigo) {
              setError('Captura tu código de participante.'); return;
            }
            // Si no se resolvió aún, intenta resolver antes de continuar
            if (!form.cuestionarioId) {
              const okResolve = await lookupByCode();
              if (!okResolve) return;
            }
            const ok = await precheck();
            if (ok) setStep(2);
          }}
        >
          Siguiente
        </button>
      </div>
    </>
  );

  // ===== STEP 2 =====
  const Step2 = () => (
    <>
      <h3>Metadatos (Guía V)</h3>
      {/* ...[igual que antes, sin cambios]... */}
      {/* Sexo */}
      <div className="form-group">
        <label>Sexo:</label>
        <select name="sexo" value={form.metadata.sexo} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona --</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
        </select>
      </div>
      {/* Edad */}
      <div className="form-group">
        <label>Edad en años:</label>
        <select name="edad" value={form.metadata.edad} onChange={handleMeta} className="registro-input">
          <option value="">-- Selecciona rango --</option>
          {['15-19','20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70 o más']
            .map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      {/* ... resto de selects idénticos ... */}
      <div className="wizard-buttons">
        <button onClick={() => setStep(1)} className="btn-secondary">Atrás</button>
        <button onClick={() => setStep(3)} className="btn-primary">Siguiente</button>
      </div>
    </>
  );

  // ===== STEP 3 =====
  const Step3 = () => {
    const guiaI = [], guiaII = [], guiaIII = [];
    form.respuestas.forEach(r => {
      const meta = reactivos.find(x => x._id === r.reactivoId);
      if (!meta) return;
      const sec = Number(meta.seccionId);
      const obj = { idPregunta: r.reactivoId, valor: r.valor };
      if (sec === 1)      guiaI.push(obj);
      else if (sec === 2) guiaII.push(obj);
      else if (sec === 3) guiaIII.push(obj);
    });

    const registrar = async () => {
      setError(''); setSuccess('');
      const { participanteCodigo, cuestionarioId, metadata } = form;

      if (!participanteCodigo || !cuestionarioId) {
        setError('Código y cuestionario obligatorios'); setStep(1); return;
      }
      if (reactivos.length !== form.respuestas.length) {
        setError('Debes responder todas las preguntas'); return;
      }

      try {
        const payload = { participanteCodigo, cuestionarioId, guiaI, guiaII, guiaIII, guiaV: metadata };
        const res = await fetch(`${ApiConfig.baseURL}/respuestas/capturar`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al guardar respuestas');

        await fetch(`${ApiConfig.baseURL}/participantes/completado`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ participanteCodigo, cuestionarioId })
        });

        setSuccess('Respuestas guardadas correctamente');
        setTimeout(() => navigate('/captura/generar'), 1500);
      } catch (err) {
        setError(err.message);
      }
    };

    return (
      <>
        <h3>Respuestas</h3>
        <div className="reactivos-list">
          {reactivos.map(r => {
            const current = form.respuestas.find(x => x.reactivoId === r._id);
            return (
              <div key={r._id} className="reactivo-item">
                <span>{`[Sección ${r.seccionId}] ${r.texto}`}</span>
                <select
                  value={current?.valor ?? ''}
                  onChange={e => handleResp(r._id, Number(e.target.value))}
                  className="registro-input"
                >
                  <option value="">--</option>
                  {[0,1,2,3,4].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            );
          })}
        </div>
        <div className="wizard-buttons">
          <button onClick={() => setStep(2)} className="btn-secondary">Atrás</button>
          <button onClick={registrar} className="btn-primary">Guardar</button>
        </div>
      </>
    );
  };

  return (
    <div className="captura-page">
      <h2>Captura de Respuestas</h2>
      {error   && <p className="error-text">{error}</p>}
      {success && <p className="success-text">{success}</p>}
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
    </div>
  );
}
