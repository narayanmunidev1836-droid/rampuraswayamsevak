'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [logged, setLogged] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function load() {
    setLoading(true);
    const r = await fetch('/api/admin/submissions');
    if (r.status === 401) { setLogged(false); setLoading(false); return; }
    setRows(await r.json());
    setLogged(true);
    setLoading(false);
  }

  function doLogout() {
    setLogged(false);
    router.push('/');
  }

  function doHome() {
    router.push('/admin');
  }

  async function doExport() {
    setExporting(true);
    try {
      const r = await fetch('/api/admin/export');
      if (r.status === 401) { setLogged(false); return; }
      if (!r.ok) throw new Error('export failed');
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swayamsevak-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError('Excel export માં તકલી આવી. ફરી પ્રયત્ન કરો.');
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function doLogin(e) {
    e.preventDefault();
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(login) });
    if (!r.ok) { setError('Login details ખોટી છે.'); return; }
    await load();
  }

  const filtered = rows.filter(r =>
    !search || `${r.surname} ${r.name} ${r.village} ${r.mobile} ${r.fatherName}`.toLowerCase().includes(search.toLowerCase())
  );

  // ── LOGIN PAGE ──────────────────────────────────────────────
  if (!logged) return (
    <main style={{ minHeight: '100vh', background: '#f5ede6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 16px 48px rgba(80,30,10,0.14)', width: '100%', maxWidth: '420px', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,#8e1f0a,#c4511f)', padding: '28px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔐</div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: '22px', fontWeight: 700 }}>Admin Login</h1>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>ધોલેરાધામ સ્વયંસેવક પ્રણાલી</p>
        </div>
        <div style={{ padding: '28px 32px 32px' }}>
          <form onSubmit={doLogin}>
            <div className="field" style={{ marginBottom: '16px' }}>
              <label>Email</label>
              <input type="email" value={login.email} onChange={e => setLogin({ ...login, email: e.target.value })} placeholder="admin@example.com" />
            </div>
            <div className="field" style={{ marginBottom: '20px' }}>
              <label>Password</label>
              <input type="password" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} placeholder="••••••••" />
            </div>
            {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}
            <button className="btn primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>Login →</button>
          </form>
        </div>
      </div>
    </main>
  );

  // ── ADMIN DASHBOARD ─────────────────────────────────────────
  return (
    <main style={{ minHeight: '100vh', background: '#f5ede6' }}>

      {/* Top Header */}
      <div style={{ background: 'linear-gradient(135deg,#8e1f0a,#c4511f)', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: 700 }}>🕉️ સ્વયંસેવક Admin Panel</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>ધોલેરાધામ દ્વિશતાબ્દી મહોત્સવ</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={doExport} disabled={exporting || rows.length === 0} title="બધા રેકોર્ડ સાથે Excel (.xlsx) ડાઉનલોડ કરો" style={{ background: '#fff', border: 'none', color: '#8e1f0a', borderRadius: '10px', padding: '9px 20px', cursor: exporting || rows.length === 0 ? 'not-allowed' : 'pointer', opacity: exporting || rows.length === 0 ? 0.6 : 1, fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
          {exporting ? '⏳ Excel Export' : '📊 Excel Export'}
        </button>
        <button onClick={doHome} style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '10px', padding: '9px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🔄 Home
        </button>
        <button onClick={load} style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '10px', padding: '9px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🔄 Refresh
        </button>
        <button onClick={doLogout} style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: '10px', padding: '9px 20px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🔄 Logout
        </button>
        </div>
      </div>

      <div style={{ padding: '24px 24px 48px', maxWidth: '1300px', margin: '0 auto' }}>

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { icon: '📋', label: 'કુલ ફોર્મ', value: rows.length },
            { icon: '🔍', label: 'ફિલ્ટર થયેલ', value: filtered.length },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e8ddd6', boxShadow: '0 4px 16px rgba(80,30,10,0.07)', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '28px' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#8e1f0a', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#8a6a5a', marginTop: '3px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="error" style={{ marginBottom: '16px' }}>{error}</div>}

        {/* Search */}
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8ddd6', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 8px rgba(80,30,10,0.05)' }}>
          <span style={{ fontSize: '18px' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="નામ, ગામ, મોબાઈલ... દ્વારા શોધો"
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', background: 'transparent', fontFamily: 'inherit', color: '#2f211c' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: '#f0e8e5', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', color: '#8e1f0a', fontWeight: 700, fontSize: '13px' }}>✕ સાફ</button>}
        </div>

        {/* Table Card */}
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e8ddd6', overflow: 'hidden', boxShadow: '0 4px 20px rgba(80,30,10,0.08)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#a08070', fontSize: '16px' }}>⏳ લોડ થઈ રહ્યું છે...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#a08070' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
              <div style={{ fontWeight: 600 }}>{search ? 'કોઈ ફોર્મ મળ્યું નહિ' : 'હજુ કોઈ ફોર્મ ભરાયું નથી'}</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg,#fdf0ea,#fde8dc)', borderBottom: '2px solid #f0d8c8' }}>
                    {['#', 'અટક / નામ', 'પિતાનું નામ', 'ગામ', 'મો. નં.', 'ઉંમર', 'ટી-શર્ટ', 'સેવા તારીખ', 'વિભાગ', 'Action'].map(h => (
                      <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontWeight: 700, color: '#6a2810', fontSize: '13px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r._id} style={{ borderBottom: '1px solid #f5ede6', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fffaf7'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '12px 16px', color: '#a08070', fontWeight: 600 }}>{i + 1}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#2f211c' }}>{r.surname} {r.name}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#5a3a28' }}>{r.fatherName}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#fdf0ea', color: '#8e1f0a', borderRadius: '6px', padding: '3px 10px', fontSize: '13px', fontWeight: 600 }}>{r.village}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#5a3a28', whiteSpace: 'nowrap' }}>{r.mobile}</td>
                      <td style={{ padding: '12px 16px', color: '#5a3a28', textAlign: 'center' }}>{r.age}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {r.shirtSize ? <span style={{ background: '#f0f0f0', borderRadius: '6px', padding: '3px 10px', fontWeight: 700, fontSize: '13px' }}>{r.shirtSize}</span> : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                        {r.fromDate && r.toDate ? (
                          <div>
                            <span style={{ fontWeight: 600, color: '#2f211c' }}>{r.fromDate}</span>
                            <span style={{ color: '#c4511f', margin: '0 4px' }}>→</span>
                            <span style={{ fontWeight: 600, color: '#2f211c' }}>{r.toDate}</span>
                          </div>
                        ) : <span style={{ color: '#ccc' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', maxWidth: '180px' }}>
                        <span style={{ fontSize: '13px', color: '#5a3a28' }}>{r.departments?.join(', ') || '—'}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => window.open(`/admin/print/${r._id}?autoprint=1`, '_blank')}
                            style={{ background: 'linear-gradient(135deg,#8e1f0a,#c4511f)', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(142,31,10,0.25)' }}
                          >
                            🖨 Print
                          </button>
                          <button
                            onClick={() => router.push(`/admin/print/${r._id}`)}
                            style={{ background: '#f0e8e4', color: '#8e1f0a', border: '1.5px solid #e0c8be', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}
                          >
                            👁 View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}