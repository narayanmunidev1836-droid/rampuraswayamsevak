'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { departments, sevaTypes, shirtSizes } from '../../../../lib/constants';
import { resizePhoto } from '../../../../lib/photo';
import DateRangePicker from '../../../DateRangePicker';

const FORM_KEYS = [
  'surname', 'name', 'fatherName', 'village', 'address', 'mobile', 'age',
  'shirtSize', 'fromDate', 'toDate', 'departments', 'otherDepartment',
  'sevaType', 'santName', 'santMobile', 'photoData',
];

const empty = FORM_KEYS.reduce((a, k) => ({ ...a, [k]: k === 'departments' || k === 'sevaType' ? [] : '' }), {});

function pickForm(doc) {
  const out = { ...empty };
  for (const k of FORM_KEYS) {
    const v = doc?.[k];
    if (k === 'departments' || k === 'sevaType') out[k] = Array.isArray(v) ? v : [];
    else out[k] = typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v);
  }
  return out;
}

export default function EditSubmission({ params }) {
  const router = useRouter();
  const [f, setF] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const toggle = (k, v) => setF(x => ({ ...x, [k]: x[k].includes(v) ? x[k].filter(a => a !== v) : [...x[k], v] }));

  useEffect(() => {
    let active = true;

    fetch(`/api/submissions/${params.id}`)
      .then(async r => {
        if (r.status === 401) { router.replace('/admin'); return null; }
        if (r.status === 404) { if (active) { setMissing(true); setLoading(false); } return null; }
        if (!r.ok) throw new Error('રેકોર્ડ લોડ કરવામાં સમસ્યા આવી.');
        return r.json();
      })
      .then(d => { if (active && d) { setF(pickForm(d)); setLoading(false); } })
      .catch(e => { if (active) { setError(e.message); setLoading(false); } });

    return () => { active = false; };
  }, [params.id, router]);

  async function onPickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await resizePhoto(file);
      set('photoData', data);
      setError('');
    } catch (err) {
      setError(err.message === 'PHOTO_TOO_LARGE' ? 'ફોટો 5 MB કરતા ઓછો હોવો જોઈએ.' : 'ફોટો અપલોડ કરવામાં સમસ્યા આવી.');
    }
  }

  async function save(ev) {
    ev.preventDefault();
    setError('');
    setSaving(true);
    try {
      const r = await fetch(`/api/submissions/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'ફોર્મ સાચવવામાં સમસ્યા આવી.');
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (missing) return (
    <main className="container">
      <div className="card"><div className="card-body">
        <div className="error" style={{ marginBottom: '16px' }}>આ રેકોર્ડ મળ્યો નથી — તે કદાચ કોઈએ કાઢી નાખ્યો હોય.</div>
        <button className="btn primary" onClick={() => router.push('/admin')}>← Admin Panel</button>
      </div></div>
    </main>
  );

  if (loading) return (
    <main className="container">
      <div className="card"><div className="card-body" style={{ textAlign: 'center', padding: '60px', color: '#a08070' }}>⏳ લોડ થઈ રહ્યું છે...</div></div>
    </main>
  );

  if (done) return (
    <main className="container">
      <div className="form-header"><h1>🕉️ સ્વયંસેવક ફોર્મ</h1><p className="subtitle">ધોલેરાધામ દ્વિશતાબ્દી મહોત્સવ</p></div>
      <div className="card">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>ફોર્મ સફળતાપૂર્વક અપડેટ થઈ ગયું!</h2>
          <p>{f.surname} {f.name} ના ફોર્મમાં કરેલો ફેરફાર સચવાઈ ગયો છે.</p>
          <button className="btn primary" style={{ maxWidth: '280px', margin: '0 auto' }} onClick={() => router.push('/admin')}>← Admin Panel પર પાછા જાઓ</button>
        </div>
      </div>
    </main>
  );

  return (
    <main className="container">
      <div className="form-header">
        <h1>✏️ ફોર્મ એડિટ કરો</h1>
        <p className="subtitle">ધોલેરાધામ દ્વિશતાબ્દી મહોત્સવ — રેકોર્ડ #{String(params.id).slice(-6).toUpperCase()}</p>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <button className="btn" onClick={() => router.push('/admin')}>← Admin Panel પર પાછા</button>
      </div>

      <div className="card">
        <div className="card-body">

          <form onSubmit={save}>

            {/* ─── Section 1: Personal Info ─── */}
            <div className="form-section">
              <div className="section-title">👤 વ્યક્તિગત માહિતી</div>
              <div className="grid">
                <Field label="અટક :" value={f.surname} onChange={v => set('surname', v)} required placeholder="અટક" />
                <Field label="નામ :" value={f.name} onChange={v => set('name', v)} required placeholder="નામ" />
                <Field label="પિતાનું નામ :" value={f.fatherName} onChange={v => set('fatherName', v)} required placeholder="પિતાનું નામ" />
                <Field label="ગામ :" value={f.village} onChange={v => set('village', v)} required placeholder="ગામ / શહેર" />
                <Field className="full" label="સરનામું :" value={f.address} onChange={v => set('address', v)} textarea required placeholder="પૂરું સરનામું..." />
                <Field label="મો. નં. :" value={f.mobile} onChange={v => set('mobile', v)} required placeholder="મોબાઈલ નંબર" />
                <Field label="ઉંમર :" value={f.age} onChange={v => set('age', v)} required placeholder="વર્ષ" />
              </div>
            </div>

            <hr className="section-divider" />

            {/* ─── Section 2: Shirt Size ─── */}
            <div className="form-section">
              <div className="section-title">👕 ટીશર્ટ સાઈઝ</div>
              <div className="field full">
                <div className="sizes">
                  {shirtSizes.map(v => (
                    <label key={v}>
                      <input type="radio" name="shirt" checked={f.shirtSize === v} onChange={() => set('shirtSize', v)} />
                      <span className="size-chip">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <hr className="section-divider" />

            {/* ─── Section 3: Seva Dates ─── */}
            <div className="form-section">
              <div className="section-title">📅 સેવાની તારીખ</div>
              <DateRangePicker
                fromDate={f.fromDate}
                toDate={f.toDate}
                onChange={(from, to) => { set('fromDate', from); set('toDate', to); }}
              />
              <div className="info-box" style={{ marginTop: '14px' }}>
                ✅ સેવાની તારીખ ફક્ત <strong>ડિસેમ્બર ૨૦૨૬</strong> માટે જ પસંદ કરી શકાય.<br />
                ✅ ઉત્સવમાં ઓછામાં ઓછા <strong>૫ દિવસ</strong> સેવા આપવી જરૂરી છે.
              </div>
            </div>

            <hr className="section-divider" />

            {/* ─── Section 4: Department ─── */}
            <div className="form-section">
              <div className="section-title">🏢 વિભાગ પસંદગી</div>
              <div className="field full">
                <label style={{ marginBottom: '10px' }}>આપ કયા વિભાગમાં સેવા આપવા માંગો છો?</label>
                <div className="checks">
                  {departments.map(v => (
                    <label className="check" key={v}>
                      <input type="checkbox" checked={f.departments.includes(v)} onChange={() => toggle('departments', v)} />
                      <span className="check-label">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <Field label="આ સિવાય અન્ય વિભાગ :" value={f.otherDepartment} onChange={v => set('otherDepartment', v)} placeholder="અન્ય વિભાગ (જો હોય તો)" />
              </div>
            </div>

            <hr className="section-divider" />

            {/* ─── Section 5: Sevarth ─── */}
            <div className="form-section">
              <div className="section-title">🚗 સેવાર્થ (વાહન)</div>
              <div className="field full">
                <div className="checks">
                  {sevaTypes.map(v => (
                    <label className="check" key={v}>
                      <input type="checkbox" checked={f.sevaType.includes(v)} onChange={() => toggle('sevaType', v)} />
                      <span className="check-label">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <hr className="section-divider" />

            {/* ─── Section 6: Sant Info ─── */}
            <div className="form-section">
              <div className="section-title">🙏 સંત / સંસ્થા માહિતી</div>
              <div className="grid">
                <Field label="સંતનું નામ :" value={f.santName} onChange={v => set('santName', v)} placeholder="સંત / સંસ્થાનું નામ" />
                <Field label="મો. નં. :" value={f.santMobile} onChange={v => set('santMobile', v)} placeholder="મોબાઈલ નંબર" />
              </div>
            </div>

            <hr className="section-divider" />

            {/* ─── Section 7: Photo ─── */}
            <div className="form-section">
              <div className="section-title">📷 પાસપોર્ટ સાઈઝ ફોટો</div>
              <div className="field full">
                {!f.photoData ? (
                  <label className="photo-upload-area">
                    <div>📤</div>
                    <div style={{ marginTop: '6px', fontWeight: '600', color: '#8e1f0a' }}>ફોટો અપલોડ કરો</div>
                    <div style={{ fontSize: '12px', color: '#a0887a', marginTop: '4px' }}>JPG, PNG, WEBP સ્વીકાર્ય — મહત્તમ 5 MB</div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={onPickPhoto} />
                  </label>
                ) : (
                  <div className="photo-preview">
                    <img src={f.photoData} alt="પાસપોર્ટ સાઈઝ ફોટો" />
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '8px', color: '#2a5c38' }}>✓ ફોટો ઉપલબ્ધ છે</div>
                      <label className="btn remove-photo" style={{ display: 'inline-block', marginBottom: '8px', cursor: 'pointer' }}>
                        🔄 ફોટો બદલો
                        <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={onPickPhoto} />
                      </label>
                      <div>
                        <button type="button" className="btn remove-photo" onClick={() => set('photoData', '')}>ફોટો દૂર કરો</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn primary" disabled={saving} style={{ flex: '1 1 220px' }}>
                {saving ? '⏳ સાચવી રહ્યા છીએ...' : '✓ ફેરફાર સાચવો'}
              </button>
              <button type="button" className="btn" onClick={() => router.push('/admin')} disabled={saving} style={{ flex: '1 1 160px' }}>
                રદ કરો
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, textarea, className = '', required, placeholder }) {
  return (
    <div className={`field ${className}`}>
      <label>{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} />
        : <input value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} />}
    </div>
  );
}
