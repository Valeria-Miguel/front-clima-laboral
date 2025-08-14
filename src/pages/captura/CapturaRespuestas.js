// src/pages/captura/CapturaRespuestas.js
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../styles/ClientesDashboard.css';
import ApiConfig from '../../apiConfig';

// ================== Helpers ==================
const API_BASE = ApiConfig.baseURL;
// si tu back prefiere 'abiertas', cámbialo aquí y listo
const OPEN_KEY = 'preguntasAbiertas';


// Endpoints en cascada (con y sin /api y también micro directo 3005)
const SECC_ENDPOINTS = (base, id, tipo = 'MIXTO') => ([
  `${base}/api/secciones?cuestionarioId=${id}&populate=true&tipo=${tipo}`,
  `${base}/secciones?cuestionarioId=${id}&populate=true&tipo=${tipo}`,
  // POST compat
  { url: `${base}/api/secciones/por-cuestionario`, method: 'POST', body: { cuestionarioId: id, tipo } },
  { url: `${base}/secciones/por-cuestionario`,       method: 'POST', body: { cuestionarioId: id, tipo } },
]);

const SAVE_ENDPOINTS = (base) => ([
  `${base}/respuestas/capturar`,
  `${base}/api/respuestas/capturar`,
]);

const cleanOid = (s) => (String(s || '').match(/[0-9a-fA-F]{24}/)?.[0] || '');
const romanToNum = (v) => ({ I: '1', II: '2', III: '3', IV: '4' }[v] || String(v || ''));

const getJsonSafe = async (res) => {
  const text = await res.text();
  try { return JSON.parse(text || '{}'); } catch { return { message: text?.slice(0, 200) || '' }; }
};

// ====== Catálogos Guía V ======
const CAT_SEXO = ['Masculino', 'Femenino'];
const CAT_EDAD = ['15-19','20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69','70 o más'];
const CAT_ESTADO_CIVIL = ['Casado','Divorciado','Soltero','Viudo','Unión libre'];
const CAT_ESCOLARIDAD = ['Sin formación','Primaria','Secundaria','Preparatoria','Técnico Superior','Licenciatura','Maestría','Doctorado'];
const CAT_DEPARTAMENTO = ['Administración','Producción','Logística','Compras','Ventas','Mercadotecnia','Finanzas','Recursos Humanos','Mantenimiento','Calidad','Otro'];
const CAT_AREA = ['Operativa','Técnica','Administrativa','Comercial','Soporte','Otra'];
const CAT_TIPO_CONTRATO = ['Tiempo indeterminado','Por tiempo determinado','Por obra o proyecto','Honorarios'];
const CAT_TIPO_PUESTO   = ['Operativo','Profesional técnico','Supervisor','Gerente'];
const CAT_JORNADA       = ['Fijo nocturno','Fijo diurno','Fijo mixto'];
const CAT_ANTIGUEDAD    = ['Menos de 6 meses','6 meses a 1 año','1 a 4 años','5 a 9 años','10 a 14 años','15 a 19 años','20 a 24 años','25 años o más'];

// ====== NOM035 mapping -> num ======
const mapNom035Valor = (seccionNumero, valorTexto) => {
  const v = String(valorTexto || '').trim().toLowerCase();
  if (String(seccionNumero) === '1') {
    if (v === 'sí' || v === 'si') return 1;
    if (v === 'no') return 0;
    return null;
  }
  if (String(seccionNumero) === '2') {
    const map = { 'nunca':0, 'casi nunca':1, 'algunas veces':2, 'casi siempre':3, 'siempre':4 };
    return (v in map) ? map[v] : null;
  }
  if (String(seccionNumero) === '3') {
    const map = {
      'totalmente en desacuerdo':0,
      'en desacuerdo':1,
      'de acuerdo':2,
      'totalmente de acuerdo':3
    };
    return (v in map) ? map[v] : null;
  }
  return null;
};

// Opciones por reactivo (para UI)
const opcionesReactivo = (r) => {
  if (r.catalogo === 'CLIMA') {
    if (Array.isArray(r?.escala?.valores) && r.escala.valores.length) return r.escala.valores;
    return []; // si no hay escala definida, no mostramos opciones
  }
  // NOM035
  const s = Number(r.seccionNumero || r.seccion || 1);
  if (s === 1) return ['Sí','No'];
  if (s === 2) return ['Nunca','Casi Nunca','Algunas Veces','Casi Siempre','Siempre'];
  return ['Totalmente en desacuerdo','En desacuerdo','De acuerdo','Totalmente de acuerdo'];
};

// ===========================================================
export default function CapturaRespuestas() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const prevState = location.state || {};

  const [step, setStep] = useState(1);
  const [cuestionarios, setCuestionarios] = useState([]);
  const [secciones, setSecciones]         = useState([]);
  const [seccionTab, setSeccionTab]       = useState('1');
  const [respuestas, setRespuestas]       = useState({});

  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [lookupInfo, setLookupInfo]       = useState(null); // { nombre, tipo }

  const [form, setForm] = useState({
    participanteCodigo: (prevState.codigo || '').toUpperCase(),
    cuestionarioId:     prevState.cuestionarioId || '',
    metadata: {
      sexo:'', edad:'', estadoCivil:'', nivelEstudios:'',
      adscripcion:'', area:'', tipoContrato:'', tipoPuesto:'',
      experiencia:'', jornada:''
    }
  });

  // ====== Cargar cuestionarios (solo para poder seleccionar cuando no hay código) ======
  useEffect(() => {
    (async () => {
      try {
        // el listado suele estar en /api/cuestionarios o /cuestionarios; probamos ambos
        let data = null;
        for (const url of [`${API_BASE}/api/cuestionarios`, `${API_BASE}/cuestionarios`]) {
          try {
            const res = await fetch(url, { headers: { Accept:'application/json' }});
            const j = await getJsonSafe(res);
            if (res.ok && Array.isArray(j)) { data = j; break; }
          } catch {}
        }
        if (Array.isArray(data)) setCuestionarios(data);
      } catch {}
    })();
  }, []);

  // Si venías con código, resolverlo
  useEffect(() => {
    if (form.participanteCodigo) lookupByCode(form.participanteCodigo, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====== Cargar secciones robusto ======
  useEffect(() => {
    const fetchSecciones = async () => {
      if (!form.cuestionarioId) { setSecciones([]); return; }
      setError('');
      const id = cleanOid(form.cuestionarioId);
      const tipo = (lookupInfo?.tipo || 'MIXTO').toUpperCase();

      const bases = [API_BASE, 'http://localhost:3005'];
      let secs = null, lastErr = null;

      for (const b of bases) {
        const candidates = SECC_ENDPOINTS(b, id, tipo);
        for (const c of candidates) {
          try {
            let res, data;
            if (typeof c === 'string') {
              res = await fetch(c, { headers:{Accept:'application/json'} });
              data = await getJsonSafe(res);
            } else {
              res = await fetch(c.url, {
                method: c.method,
                headers:{'Content-Type':'application/json', Accept:'application/json'},
                body: JSON.stringify(c.body)
              });
              data = await getJsonSafe(res);
            }
            if (res.ok && Array.isArray(data)) { secs = data; break; }
            lastErr = new Error(data?.message || data?.error || `HTTP ${res.status}`);
          } catch (e) { lastErr = e; }
        }
        if (secs) break;
      }
      if (!secs) { setError('No fue posible cargar secciones'); setSecciones([]); return; }

      // Normalizar para la UI y para construir answers
      const normalized = secs.map(s => ({
        ...s,
        numero: romanToNum(s.numero),
        reactivos: (s.reactivos || []).map((r, i) => {
        const rid = cleanOid(r.reactivoId || r._id || r.id || `${s.numero}-${i}`);
        const catalogo = (r.catalogo || r.tipo || 'CLIMA').toUpperCase();
        const dimension =
          (r?.dimension && typeof r.dimension === 'object' && (r.dimension.nombre || r.dimension.titulo)) ||
          (typeof r?.dimension === 'string' ? r.dimension : '') ||
          (r?.dimensionNombre || '');

        const esAbierta = !!(
          r.esAbierta ||
          r.tipo === 'ABIERTA' ||
          r.tipoRespuesta === 'ABIERTA' ||
          r?.escala?.tipo === 'ABIERTA' ||
          (catalogo === 'CLIMA' && (!r?.escala?.valores || r.escala.valores.length === 0))
        );

        return {
          ...r,
          _rid: rid,
          catalogo,
          seccionNumero: String(s.numero),
          _dimensionNombre: String(dimension || '').trim(),
          esAbierta
        };
      })

      }));

      setSecciones(normalized);
      setSeccionTab('1');
      setRespuestas({});
    };

    fetchSecciones();
  }, [form.cuestionarioId, lookupInfo?.tipo]);

  // ====== Handlers ======
  const setMeta = (f, v) => setForm(prev => ({ ...prev, metadata: { ...prev.metadata, [f]: v } }));
  const setResp = (rid, valor) => setRespuestas(prev => ({ ...prev, [String(rid)]: { valor } }));

  const lookupByCode = async (codeParam, silent = false) => {
    const code = String(codeParam ?? form.participanteCodigo).trim().toUpperCase();
    if (!code) { if (!silent) setError('Captura tu código.'); return false; }
    try {
      // probamos /api/participantes/lookup y /participantes/lookup
      let okData = null, last = null;
      for (const u of [`${API_BASE}/api/participantes/lookup/${code}`, `${API_BASE}/participantes/lookup/${code}`]) {
        try {
          const res  = await fetch(u, { headers:{Accept:'application/json'} });
          const data = await getJsonSafe(res);
          if (res.ok && (data?.cuestionarioId || data?.cuestionario?._id)) { okData = data; break; }
          last = data;
        } catch {}
      }
      if (!okData) throw new Error(last?.message || 'Código no encontrado');

      const cqId = okData.cuestionarioId || okData.cuestionario?._id || '';
      setForm(f => ({ ...f, participanteCodigo: code, cuestionarioId: cqId }));
      setLookupInfo({ nombre: okData.cuestionario?.nombre, tipo: okData.cuestionario?.tipo });
      if (!silent) { setSuccess('Código válido. Cuestionario seleccionado automáticamente.'); setError(''); }
      return true;
    } catch (err) { setLookupInfo(null); if (!silent) setError(err.message); return false; }
  };

  const precheck = async () => {
    setError(''); setSuccess('');
    if (!form.cuestionarioId) { setError('Selecciona un cuestionario'); return false; }
    try {
      for (const u of [`${API_BASE}/api/participantes/precheck`, `${API_BASE}/participantes/precheck`]) {
        try {
          const res  = await fetch(u, {
            method:'POST', headers:{'Content-Type':'application/json',Accept:'application/json'},
            body: JSON.stringify({ cuestionarioId: form.cuestionarioId })
          });
          const d = await getJsonSafe(res);
          if (res.status === 409) { setError(d?.message || 'Se alcanzó el límite de respuestas.'); return false; }
          if (res.ok) return true;
        } catch {}
      }
      setError('No fue posible validar el cupo.');
      return false;
    } catch { setError('No fue posible validar el cupo.'); return false; }
  };

  // ====== Guía V -> arreglo formato answers ======
  const guiaVArray = useMemo(() => {
    const m = form.metadata || {};
    const entries = [
      ['V1', m.sexo],
      ['V2', m.edad],
      ['V3', m.estadoCivil],
      ['V4', m.nivelEstudios],
      ['V5', m.adscripcion],
      ['V6', m.area],
      ['V7', m.tipoContrato],
      ['V8', m.tipoPuesto],
      ['V9', m.experiencia],
      ['V10', m.jornada],
    ];
    return entries
      .filter(([,v]) => v && String(v).trim() !== '')
      .map(([idPregunta, valor]) => ({ idPregunta, valor, dimension: 'Demográficos' }));
  }, [form.metadata]);

  // ====== Construir payload EXACTO de "answers" ======
  // === NUEVO: construir payload EXACTO para /api/respuestas/capturar ===
const buildPayloadForCapturar = () => {
  const cuestionarioId = cleanOid(form.cuestionarioId);
  const participanteCodigo = String(form.participanteCodigo || '').toUpperCase();

  // índice por reactivo (rid) con meta necesaria para armar cada ítem
  const metaByRid = new Map(
    secciones.flatMap(sec => (sec.reactivos || []).map((r, i) => {
      const rid = String(r._rid);
      // intenta tomar un código legible si existe (idPregunta/clave/codigo); si no, usa el _rid
      const codigo =
        r.idPregunta || r.clave || r.codigo || r.etiqueta || r.folio || rid;

      const catalogo = (r.catalogo || r.tipo || 'CLIMA').toUpperCase();
      const dimension =
        (r?.dimension && typeof r.dimension === 'object' && (r.dimension.nombre || r.dimension.titulo)) ||
        (typeof r?.dimension === 'string' ? r.dimension : '') ||
        (r?.dimensionNombre || '');

      return [rid, {
        codigo,
        texto: r.texto || r.pregunta || '',
        catalogo,
        seccionNumero: String(sec.numero || r.seccionNumero || 1),
        escalaValores: Array.isArray(r?.escala?.valores) ? r.escala.valores : null,
        dimension: String(dimension || '').trim(),
        esAbierta: !!r.esAbierta
      }];
    }))
  );

  // cuántos CLIMA hay por sección (para "Orden 1-N")
  const climaCountBySec = secciones.reduce((acc, sec) => {
    const n = (sec.reactivos || []).filter(rr => (rr.catalogo || rr.tipo || 'CLIMA').toUpperCase() === 'CLIMA').length;
    acc[String(sec.numero)] = n;
    return acc;
  }, {});

  // helpers escala
  const escalaNom035 = (sNum /* 1|2|3 */) => {
    if (String(sNum) === '1') return 'Sí/No';
    if (String(sNum) === '2') return 'Siempre=4,Casi Siempre=3,Algunas Veces=2,Casi Nunca=1,Nunca=0';
    // por defecto sección III
    return 'Totalmente de acuerdo=3,De acuerdo=2,En desacuerdo=1,Totalmente desacuerdo=0';
  };
  const escalaClima = (sNum) => `Orden 1-${climaCountBySec[String(sNum)] || ''}`;

  // colecciones de salida
  const guiaI = [], guiaII = [], guiaIII = [];
  const seccionI = [], seccionII = [], seccionIII = [], seccionIV = [];
  const abiertas = [];

  // recorrer respuestas marcadas en UI
  Object.entries(respuestas).forEach(([rid, obj]) => {
    const meta = metaByRid.get(String(rid));
    if (!meta) return;
    if (obj?.valor === undefined || obj?.valor === '') return;

    // valor a enviar:
    // - NOM035: texto tal cual (No/Nunca/…)
    // - CLIMA : ordinal 1..N (si la respuesta viene como texto de la escala)
    let valor = obj.valor;

    // Si es abierta: NO la metas a climaLaboral; guárdala en 'abiertas'
    if (meta.esAbierta) {
      const texto = String(valor ?? '').trim();
      if (texto !== '') {
        abiertas.push({
          seccion: Number(meta.seccionNumero || 0),
          idPregunta: meta.codigo,
          pregunta: meta.texto,
          valor: texto,
          dimension: meta.dimension || '',
          catalogo: meta.catalogo
        });
      }
      return; // ← saltamos para no mezclarla con CLIMA numérico
    }

 // CLIMA (cerradas): si viene como texto, conviértelo a ordinal 1..N
    if (meta.catalogo === 'CLIMA' && typeof valor === 'string' && Array.isArray(meta.escalaValores)) {
      const idx = meta.escalaValores.findIndex(v => String(v) === String(valor));
      if (idx >= 0) valor = idx + 1;
    }

    const itemBase = {
      idPregunta: meta.codigo,
      pregunta: meta.texto,
      valor,
      escala: (meta.catalogo === 'CLIMA') ? escalaClima(meta.seccionNumero) : escalaNom035(meta.seccionNumero),
      dimension: meta.dimension || ''
    };

    const s = Number(meta.seccionNumero || 0);
    if (meta.catalogo === 'CLIMA') {
      if (s === 1) seccionI.push(itemBase);
      else if (s === 2) seccionII.push(itemBase);
      else if (s === 3) seccionIII.push(itemBase);
      else seccionIV.push(itemBase);
    } else {
      if (s === 1)      guiaI.push(itemBase);
      else if (s === 2) guiaII.push(itemBase);
      else              guiaIII.push(itemBase);
    }
  });

  // —— Guía V (demográficos) con pregunta + escala ——
  const GV = [];
  const m = form.metadata || {};
  const GV_DEF = {
    V1: { campo: 'sexo',         pregunta: 'Sexo',          escala: CAT_SEXO.join(',') },
    V2: { campo: 'edad',         pregunta: 'Edad',          escala: CAT_EDAD.join(',') },
    V3: { campo: 'estadoCivil',  pregunta: 'Estado Civil',  escala: CAT_ESTADO_CIVIL.join(',') },
    V4: { campo: 'nivelEstudios',pregunta: 'Escolaridad',   escala: CAT_ESCOLARIDAD.join(',') },
    V5: { campo: 'adscripcion',  pregunta: 'Adscripción',   escala: CAT_DEPARTAMENTO.join(',') },
    V6: { campo: 'area',         pregunta: 'Área',          escala: CAT_AREA.join(',') },
    V7: { campo: 'tipoContrato', pregunta: 'Tipo de contrato', escala: CAT_TIPO_CONTRATO.join(',') },
    V8: { campo: 'tipoPuesto',   pregunta: 'Tipo de puesto',   escala: CAT_TIPO_PUESTO.join(',') },
    V9: { campo: 'experiencia',  pregunta: 'Antigüedad',    escala: CAT_ANTIGUEDAD.join(',') },
    V10:{ campo: 'jornada',      pregunta: 'Jornada',       escala: CAT_JORNADA.join(',') },
  };
  Object.entries(GV_DEF).forEach(([idPregunta, def]) => {
    const valor = m[def.campo];
    if (valor && String(valor).trim() !== '') {
      GV.push({ idPregunta, pregunta: def.pregunta, valor, escala: def.escala, dimension: 'Demográficos' });
    }
  });

  const respuestasObj = {};
  if (guiaI.length)  respuestasObj.guiaI = guiaI;
  if (guiaII.length) respuestasObj.guiaII = guiaII;
  if (guiaIII.length)respuestasObj.guiaIII = guiaIII;

  const climaLab = {};
  if (seccionI.length) climaLab.seccionI = seccionI;
  if (seccionII.length)climaLab.seccionII = seccionII;
  if (seccionIII.length)climaLab.seccionIII = seccionIII;
  if (seccionIV.length)climaLab.seccionIV = seccionIV;
  if (Object.keys(climaLab).length) respuestasObj.climaLaboral = climaLab;

  if (GV.length) respuestasObj.guiaV = GV;
  if (abiertas.length) respuestasObj[OPEN_KEY] = abiertas;

  return {
    cuestionarioId,
    participanteCodigo,
    respuestas: [ respuestasObj ]
  };
};


  // ================== UI: Paso 1 ==================
  const Step1 = () => (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ gap: 8 }}>
        <h2 style={{ marginRight:'auto' }}>Captura de Respuestas</h2>
      </div>

      <div className="cuestionario-container">
        <div className="registro-group">
          <label>Código del cuestionario</label>
          <input
            className="registro-input"
            value={form.participanteCodigo}
            onChange={e => setForm(f => ({ ...f, participanteCodigo: e.target.value.toUpperCase() }))}
            placeholder="Ej. E2559769"
          />
          <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => lookupByCode()}>
            Validar código
          </button>
        </div>

        <div className="registro-group">
          <label>Cuestionario</label>
          <select
            className="registro-input"
            value={form.cuestionarioId}
            onChange={e => setForm(f => ({ ...f, cuestionarioId: e.target.value }))}
          >
            <option value="">-- Selecciona --</option>
            {cuestionarios.map(q => <option key={q._id} value={q._id}>{q.nombre}</option>)}
          </select>
          {lookupInfo?.nombre && (
            <small className="hint">Detectado por código: {lookupInfo.nombre} ({(lookupInfo?.tipo||'').toUpperCase()})</small>
          )}
        </div>

        <div style={{ display:'flex', gap:10, marginTop: 12 }}>
          <button className="btn" onClick={() => navigate(-1)}>Cancelar</button>
          <button className="btn-primary" onClick={async () => { if (await precheck()) setStep(2); }}>Siguiente</button>
        </div>

        {error && <p className="text-danger" style={{ marginTop:10 }}>{error}</p>}
        {success && <p className="text-success" style={{ marginTop:10 }}>{success}</p>}
      </div>
    </div>
  );

  // ================== UI: Paso 2 (Guía V) ==================
  const Step2 = () => (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Datos del Trabajador (Guía V)</h2>
      </div>

      <div className="cuestionario-container">
        <div className="registro-grid">
          <div className="registro-group">
            <label>Sexo</label>
            <select className="registro-input" value={form.metadata.sexo} onChange={e => setMeta('sexo', e.target.value)}>
              <option value="">--</option>
              {CAT_SEXO.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="registro-group">
            <label>Edad</label>
            <select className="registro-input" value={form.metadata.edad} onChange={e => setMeta('edad', e.target.value)}>
              <option value="">--</option>
              {CAT_EDAD.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="registro-group">
            <label>Estado civil</label>
            <select className="registro-input" value={form.metadata.estadoCivil} onChange={e => setMeta('estadoCivil', e.target.value)}>
              <option value="">--</option>
              {CAT_ESTADO_CIVIL.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="registro-grid">
          <div className="registro-group">
            <label>Escolaridad</label>
            <select className="registro-input" value={form.metadata.nivelEstudios} onChange={e => setMeta('nivelEstudios', e.target.value)}>
              <option value="">--</option>
              {CAT_ESCOLARIDAD.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="registro-group">
            <label>Departamento / Sección / Área</label>
            <select className="registro-input" value={form.metadata.adscripcion} onChange={e => setMeta('adscripcion', e.target.value)}>
              <option value="">--</option>
              {CAT_DEPARTAMENTO.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="registro-group">
            <label>Área</label>
            <select className="registro-input" value={form.metadata.area} onChange={e => setMeta('area', e.target.value)}>
              <option value="">--</option>
              {CAT_AREA.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="registro-grid">
          <div className="registro-group">
            <label>Tipo de contratación</label>
            <select className="registro-input" value={form.metadata.tipoContrato} onChange={e => setMeta('tipoContrato', e.target.value)}>
              <option value="">--</option>
              {CAT_TIPO_CONTRATO.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="registro-group">
            <label>Tipo de puesto</label>
            <select className="registro-input" value={form.metadata.tipoPuesto} onChange={e => setMeta('tipoPuesto', e.target.value)}>
              <option value="">--</option>
              {CAT_TIPO_PUESTO.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="registro-group">
            <label>Antigüedad</label>
            <select className="registro-input" value={form.metadata.experiencia} onChange={e => setMeta('experiencia', e.target.value)}>
              <option value="">--</option>
              {CAT_ANTIGUEDAD.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="registro-grid">
          <div className="registro-group">
            <label>Jornada de trabajo</label>
            <select className="registro-input" value={form.metadata.jornada} onChange={e => setMeta('jornada', e.target.value)}>
              <option value="">--</option>
              {CAT_JORNADA.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, marginTop:12 }}>
          <button className="btn" onClick={() => setStep(1)}>Atrás</button>
          <button className="btn-primary" onClick={() => setStep(3)}>Siguiente</button>
        </div>

        {error && <p className="text-danger" style={{ marginTop:10 }}>{error}</p>}
      </div>
    </div>
  );

  // ================== UI: Paso 3 (Respuestas) ==================
  const Step3 = () => {
    const registrar = async () => {
      try {
        setError(''); setSuccess('');
        if (!form.participanteCodigo) { setError('Falta el código del participante'); setStep(1); return; }

        // validar cerradas respondidas
        const cerradas = secciones.flatMap(s =>
          (s.reactivos || []).filter(r => !r.esAbierta).map(r => String(r._rid))
        );
        const respondidas = cerradas.filter(rid => respuestas[rid]?.valor !== undefined && respuestas[rid]?.valor !== '');
        if (cerradas.length !== respondidas.length) { setError('Responde todas las preguntas cerradas.'); return; }

        const payload = buildPayloadForCapturar();

        // Intentos de guardado
        const bases = [API_BASE, 'http://localhost:3001'];
        let ok = false, lastErr = null, lastRes = null;

        for (const b of bases) {
          for (const url of SAVE_ENDPOINTS(b)) {
            try {
              const res = await fetch(url, {
                method:'POST',
                headers:{'Content-Type':'application/json', Accept:'application/json'},
                body: JSON.stringify(payload)
              });
              const body = await getJsonSafe(res);
              lastRes = body;
              if (!res.ok) throw new Error(body?.message || body?.error || `HTTP ${res.status}`);
              ok = true;
              break;
            } catch (e) { lastErr = e; }
          }
          if (ok) break;
        }
        if (!ok) throw lastErr || new Error('No fue posible guardar (formato no aceptado).');

        // marcar completado (best-effort)
        for (const u of [`${API_BASE}/api/participantes/completado`, `${API_BASE}/participantes/completado`]) {
          try {
            await fetch(u, {
              method:'POST',
              headers:{'Content-Type':'application/json',Accept:'application/json'},
              body: JSON.stringify({ participanteCodigo: form.participanteCodigo, cuestionarioId: form.cuestionarioId })
            });
            break;
          } catch {}
        }

        setSuccess('Respuestas guardadas correctamente');
        // redirige al Home (ajusta si tu home es otro path: '/dashboard', '/inicio', etc.)
        setTimeout(() => navigate('/'), 1200);
      } catch (e) { setError(e.message); }
    };

    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Respuestas</h2>
        </div>

        {/* Tabs de sección */}
        <div className="seccion-tabs">
          {[1,2,3,4].map(num => (
            <button
              key={num}
              className={`tab-button ${seccionTab === String(num) ? 'active' : ''}`}
              onClick={() => setSeccionTab(String(num))}
            >
              Sección {num}
            </button>
          ))}
        </div>

        <div className="cuestionario-container">
          {secciones
            .filter(s => String(s.numero) === seccionTab)
            .map(seccion => (
              <div key={`sec_${seccion.numero}`}>
                <h3>{`Sección ${seccion.numero}: ${seccion.titulo || ''}`}</h3>

                {(seccion.reactivos || []).map((r, index) => {
                  const rid = String(r._rid);
                  const name = `resp-${rid}`; // <- único por reactivo
                  const current = respuestas[rid]?.valor ?? '';
                  const opciones = r.esAbierta ? [] : opcionesReactivo(r);

                  return (
                    <div key={rid} className="reactivo-card">
                      <p>
                        <strong>{index + 1}.</strong> {r.texto}
                        {r.catalogo ? <span className="badge" style={{ marginLeft: 8 }}>{r.catalogo}</span> : null}
                      </p>

                      {r.esAbierta ? (
                        <textarea
                          rows={3}
                          className="reactivo-textarea"
                          placeholder="Respuesta abierta"
                          value={current}
                          onChange={(e) => setResp(rid, e.target.value)}
                        />
                      ) : (
                        <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:6 }}>
                          {opciones.map((op, i) => (
                            <label key={`${name}-${i}`} className="opcion-escala">
                              <input
                                type="radio"
                                name={name}
                                value={op}
                                checked={String(current) === String(op)}
                                onChange={(e) => setResp(rid, e.target.value)}
                              />
                              <span>{op}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          }

          <div className="seccion-acciones">
            <button className="btn" onClick={() => setStep(2)}>Atrás</button>
            <button className="btn-primary" onClick={registrar}>Guardar</button>
          </div>

          {error && <p className="text-danger" style={{ marginTop:10 }}>{error}</p>}
          {success && <p className="text-success" style={{ marginTop:10 }}>{success}</p>}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      {step === 1 ? <Step1 /> : step === 2 ? <Step2 /> : <Step3 />}
      <Footer />
    </>
  );
}