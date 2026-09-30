'use client';
import { useState } from 'react'; import { departments, sevaTypes, shirtSizes, eventYear, eventMonth, eventStartDay, eventEndDay } from '../lib/constants'; import DateRangePicker from './DateRangePicker';
const GU_MONTH_FULL = ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'];
const GU_DIGITS = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
const toGuNum = n => String(n).split('').map(c => GU_DIGITS[Number(c)]).join('');
const MONTH_NAME = GU_MONTH_FULL[eventMonth];
const EVENT_RANGE = `${toGuNum(eventStartDay)} થી ${toGuNum(eventEndDay)} ${MONTH_NAME} ${toGuNum(eventYear)}`;
const initial = { surname: '', name: '', fatherName: '', village: '', address: '', mobile: '', age: '', shirtSize: '', fromDate: '', toDate: '', departments: [], otherDepartment: '', sevaType: [], santName: '', santMobile: '', photoData: '' };
export default function Home() {
  const [f, setF] = useState(initial),
    [loading, setLoading] = useState(false),
    [done, setDone] = useState(false),
    [error, setError] = useState('');

  const set = (k, v) => setF(x => ({ ...x, [k]: v }));
  const toggle = (k, v) => setF(x => ({ ...x, [k]: x[k].includes(v) ? x[k].filter(a => a !== v) : [...x[k], v] }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (f.fromDate && f.toDate) {
      const from = new Date(f.fromDate), to = new Date(f.toDate);
      const diffDays = Math.round((to - from) / (1000 * 60 * 60 * 24));
      if (diffDays < 4) {
        setError('સેવાનો સમયગાળો ઓછામાં ઓછો ૫ દિવસ હોવો જ જોઈએ. (ઉ.દા. ૨૩ ડિસે. થી ૨૭ ડિસે.)');
        return;
      }
    }
    setLoading(true);
    try {
      const r = await fetch('/api/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) }), d = await r.json();
      if (!r.ok) throw Error(d.error || 'Form submit failed');
      setDone(true);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  if (done) return (
    <main className="container">
      <div className="form-header"><h1>સ્વયંસેવક ફોર્મ</h1><p className="subtitle">ધોલેરાધામ દ્વિશતાબ્દી મહોત્સવ</p></div>
      <div className="card">
        <div className="success-card">
          <div className="success-icon">🙏</div>
          <h2>જય શ્રી સ્વામિનારાયણ!</h2>
          <p>આપની માહિતી સફળતાપૂર્વક નોંધાઈ ગઈ છે. આપની સેવા ભાવના માટે ખૂબ ખૂબ આભાર.</p>
          <div className="submit-where">
            <div className="submit-where-title">📌 ફોર્મ ક્યાં પહોંચાડવું?</div>
            <div>ભરેલું ફોર્મ આ પૈકાની ઓફિસમાં અચૂક પહોંચાડવું —</div>
            <ul>
              <li><strong>શ્રી સ્વામિનારાયણ સંસ્કારધામ ગુરુકુલ, ધ્રાંગધ્રા</strong></li>
              <li><strong>શ્રી સ્વામિનારાયણ મંદિર, રામપુરા, સુરત</strong></li>
            </ul>
          </div>
          <button className="btn primary" style={{maxWidth:'280px',margin:'0 auto'}} onClick={() => { setF(initial); setDone(false); }}>બીજું ફોર્મ ભરવું</button>
        </div>
      </div>
    </main>
  );

  return (
    <main className="container">
      <div className="form-header">
        <h1>🕉️ સ્વયંસેવક ફોર્મ</h1>
        <p className="subtitle">ધોલેરાધામ દ્વિશતાબ્દી મહોત્સવ — {EVENT_RANGE}</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="notice">
            જે ભક્તો Manual Form ભરવા માંગતા હોય તેઓ <b>શ્રી સ્વામિનારાયણ મંદિર, રામપુરા</b> ની ઓફિસમાંથી Manual Form મેળવી શકે છે.
          </div>

          <form onSubmit={submit}>

            {/* ─── Section 1: Personal Info ─── */}
            <div className="form-section">
              <div className="section-title">👤 વ્યક્તિગત માહિતી</div>
              <div className="grid">
                <Field label="અટક :" value={f.surname} onChange={v => set('surname', v)} required placeholder="આપની અટક" />
                <Field label="નામ :" value={f.name} onChange={v => set('name', v)} required placeholder="આપનું નામ" />
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
              <div className="info-box" style={{marginTop:'14px'}}>
                <strong>ઉત્સવ પ્રારંભ:</strong> {toGuNum(eventStartDay)} {MONTH_NAME} {toGuNum(eventYear)} — <strong>સમાપ્તિ:</strong> {toGuNum(eventEndDay)} {MONTH_NAME} {toGuNum(eventYear)}<br />
                ✅ સેવાની તારીખ ફક્ત <strong>ડિસેમ્બર ૨૦૨૬</strong> માટે જ પસંદ કરી શકાય.<br />
                ✅ ઉત્સવમાં ઓછામાં ઓછા <strong>૫ દિવસ</strong> સેવા આપવી જરૂરી છે.<br />
                ✅ ભાઈઓ તથા બહેનો ભક્તો સેવાનો લાભ લઈ શકશે.
              </div>
            </div>

            <hr className="section-divider" />

            {/* ─── Section 4: Department ─── */}
            <div className="form-section">
              <div className="section-title">🏢 વિભાગ પસંદગી</div>
              <div className="field full">
                <label style={{marginBottom:'10px'}}>આપ કયા વિભાગમાં સેવા આપવા માંગો છો?</label>
                <div className="checks">
                  {departments.map(v => (
                    <label className="check" key={v}>
                      <input type="checkbox" checked={f.departments.includes(v)} onChange={() => toggle('departments', v)} />
                      <span className="check-label">{v}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{marginTop:'14px'}}>
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
              <p className="sant-section-label">કયા સંત કે સંસ્થા હસ્તક સેવામાં જોડાયા છો? સંતનું નામ અને મોબાઈલ નંબર :</p>
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
                <p className="small">કૃપા કરીને પાસપોર્ટ સાઈઝનો ફોટો (JPG/PNG) અપલોડ કરો — મહત્તમ 5 MB</p>
                {!f.photoData ? (
                  <label className="photo-upload-area">
                    <div>📤</div>
                    <div style={{marginTop:'6px',fontWeight:'600',color:'#8e1f0a'}}>ફોટો અપલોડ કરો</div>
                    <div style={{fontSize:'12px',color:'#a0887a',marginTop:'4px'}}>JPG, PNG, WEBP સ્વીકાર્ય</div>
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}} onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) { setError('ફોટો 5 MB કરતા ઓછો હોવો જોઈએ.'); e.target.value = ''; return; }
                      try { const data = await resizePhoto(file); set('photoData', data); setError(''); } catch (err) { setError('ફોટો અપલોડ કરવામાં સમસ્યા આવી.'); }
                    }} />
                  </label>
                ) : (
                  <div className="photo-preview">
                    <img src={f.photoData} alt="પાસપોર્ટ સાઈઝ ફોટો" />
                    <div>
                      <div style={{fontWeight:'600',marginBottom:'8px',color:'#2a5c38'}}>✓ ફોટો અપલોડ થઈ ગયો</div>
                      <button type="button" className="btn remove-photo" onClick={() => set('photoData', '')}>ફોટો બદલો / દૂર કરો</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Error ─── */}
            {error && <div className="error">{error}</div>}

            {/* ─── Note ─── */}
            <div className="form-note">
              <strong>📌 નોંધ :</strong> આ સ્વયંસેવક ફોર્મ વિગતવાર ભરીને સંચાલકો અથવા પૂ. સંતો દ્વારા શ્રી સ્વામિનારાયણ મંદિર, ધોળેરાધામ, કોઠારીશ્રીની ઓફિસમાં અચૂક પહોંચાડશો.
            </div>

            <button className="btn primary" disabled={loading}>
              {loading ? '⏳ સબમિટ થઈ રહ્યું છે...' : '✓ ફોર્મ સબમિટ કરો'}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}

async function resizePhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = url });
    const maxW = 600, maxH = 800;
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally { URL.revokeObjectURL(url) }
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