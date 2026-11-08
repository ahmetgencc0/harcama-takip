import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'harcama-defterim-v1';
const CATEGORIES = ['Market', 'Yeme İçme', 'Ulaşım', 'Faturalar', 'Alışveriş', 'Diğer'];
const CATEGORY_COLORS = {
  Market: 'green',
  'Yeme İçme': 'orange',
  Ulaşım: 'blue',
  Faturalar: 'purple',
  Alışveriş: 'pink',
  Diğer: 'gray',
};

function todayISO() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function getStoredExpenses() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date(`${value}T12:00:00`).toLocaleDateString('tr-TR');
}

function Icon({ name, size = 20 }) {
  const paths = {
    wallet: <><rect x="3" y="6" width="18" height="15" rx="2" /><path d="M3 9V5a2 2 0 0 1 2-2h13" /><path d="M16 14h5" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 15 4-5 3 3 6-7" /></>,
    receipt: <><path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-2V3Z" /><path d="M9 8h6M9 12h6" /></>,
    arrow: <><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></>,
    trash: <><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m6 6 1 15h10l1-15" /><path d="M10 11v6M14 11v6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    folder: <><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3V7Z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const initialForm = () => ({ title: '', amount: '', category: 'Market', date: todayISO() });

export default function App() {
  const [expenses, setExpenses] = useState(getStoredExpenses);
  const [form, setForm] = useState(initialForm);
  const [filter, setFilter] = useState('Tümü');
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch {
      // Tarayıcı depolamaya izin vermezse uygulama yine de açık kaldığı sürece çalışır.
    }
  }, [expenses]);

  const total = useMemo(() => expenses.reduce((sum, item) => sum + item.amount, 0), [expenses]);
  const highest = useMemo(() => expenses.reduce((max, item) => Math.max(max, item.amount), 0), [expenses]);
  const visibleExpenses = useMemo(
    () => expenses
      .filter((item) => filter === 'Tümü' || item.category === filter)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt),
    [expenses, filter]
  );

  function updateForm(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
    if (error) setError('');
  }

  function addExpense(event) {
    event.preventDefault();
    const title = form.title.trim();
    const amount = Number(form.amount);
    if (!title) {
      setError('Lütfen harcama adını yaz.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Tutar sıfırdan büyük bir sayı olmalıdır.');
      return;
    }
    if (!form.date) {
      setError('Lütfen tarih seç.');
      return;
    }
    const expense = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      title,
      amount,
      category: form.category,
      date: form.date,
      createdAt: Date.now(),
    };
    setExpenses((previous) => [expense, ...previous]);
    setForm(initialForm());
    setError('');
  }

  function deleteExpense(id) {
    setExpenses((previous) => previous.filter((item) => item.id !== id));
  }

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><Icon name="wallet" size={22} /></div>
          <div className="brand-name">Harcama<span>Defterim</span></div>
        </div>
        <span className="topbar-tag">Kişisel finans takibi</span>
      </header>

      <main className="main-content">
        <div className="hero">
          <div>
            <span className="eyebrow">KİŞİSEL PANELİN</span>
            <h1>Harcamalarını kolayca takip et.</h1>
            <p>Giderlerini kaydet, kategorilere ayır ve bütçeni tek ekrandan gör.</p>
          </div>
          <div className="hero-decoration" aria-hidden="true"><Icon name="chart" size={64} /></div>
        </div>

        <section className="stats-grid" aria-label="Harcama özeti">
          <article className="stat-card featured">
            <div className="stat-icon"><Icon name="wallet" size={20} /></div>
            <div className="stat-name">Toplam harcama</div>
            <div className="stat-value">{formatMoney(total)}</div>
            <div className="stat-foot">Tüm kayıtların toplamı</div>
          </article>
          <article className="stat-card">
            <div className="stat-icon light-blue"><Icon name="receipt" size={20} /></div>
            <div className="stat-name">Harcama sayısı</div>
            <div className="stat-value">{expenses.length}</div>
            <div className="stat-foot">Kaydedilen işlem</div>
          </article>
          <article className="stat-card">
            <div className="stat-icon light-orange"><Icon name="arrow" size={20} /></div>
            <div className="stat-name">En yüksek harcama</div>
            <div className="stat-value">{formatMoney(highest)}</div>
            <div className="stat-foot">Tek seferde yapılan</div>
          </article>
        </section>

        <div className="content-grid">
          <section className="panel add-panel" aria-labelledby="add-title">
            <div className="panel-heading">
              <div>
                <h2 id="add-title">Yeni harcama ekle</h2>
                <p>Harcamanı aşağıdaki alanlara gir.</p>
              </div>
              <span className="heading-icon"><Icon name="plus" size={20} /></span>
            </div>

            <form onSubmit={addExpense} className="expense-form">
              <label htmlFor="title">Harcama adı</label>
              <input id="title" type="text" maxLength="60" placeholder="Örn. Market alışverişi" value={form.title} onChange={(e) => updateForm('title', e.target.value)} required />

              <label htmlFor="amount">Tutar (TL)</label>
              <input id="amount" type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="Örn. 250.50" value={form.amount} onChange={(e) => updateForm('amount', e.target.value)} required />

              <div className="form-row">
                <div>
                  <label htmlFor="category">Kategori</label>
                  <select id="category" value={form.category} onChange={(e) => updateForm('category', e.target.value)}>
                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="date">Tarih</label>
                  <input id="date" type="date" value={form.date} onChange={(e) => updateForm('date', e.target.value)} required />
                </div>
              </div>

              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-button" type="submit"><Icon name="plus" size={19} /> Harcamayı kaydet</button>
            </form>
            <div className="local-note"><span className="note-dot" /> Bilgiler bu tarayıcıda saklanır.</div>
          </section>

          <section className="panel table-panel" aria-labelledby="list-title">
            <div className="panel-heading list-heading">
              <div>
                <h2 id="list-title">Harcama geçmişi</h2>
                <p>Eklediğin kayıtları buradan yönet.</p>
              </div>
              <div className="filter-wrap">
                <label htmlFor="filter">Filtrele</label>
                <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="Tümü">Tüm kategoriler</option>
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            {visibleExpenses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Icon name="folder" size={35} /></div>
                <h3>{expenses.length === 0 ? 'Henüz harcama eklenmedi' : 'Bu kategoride kayıt yok'}</h3>
                <p>{expenses.length === 0 ? 'İlk harcamanı soldaki formdan ekleyebilirsin.' : 'Farklı bir kategori seçerek kayıtlarını görüntüle.'}</p>
              </div>
            ) : (
              <div className="table-scroller">
                <table>
                  <thead><tr><th>Harcama</th><th>Kategori</th><th>Tarih</th><th className="align-right">Tutar</th><th className="align-right">İşlem</th></tr></thead>
                  <tbody>
                    {visibleExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td><strong>{expense.title}</strong></td>
                        <td><span className={`category-pill ${CATEGORY_COLORS[expense.category] ?? 'gray'}`}>{expense.category}</span></td>
                        <td className="date-cell">{formatDate(expense.date)}</td>
                        <td className="amount-cell">{formatMoney(expense.amount)}</td>
                        <td className="align-right"><button type="button" className="delete-button" onClick={() => deleteExpense(expense.id)} aria-label={`${expense.title} kaydını sil`} title="Kaydı sil"><Icon name="trash" size={17} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="table-footer">Görüntülenen kayıt: <strong>{visibleExpenses.length}</strong></div>
          </section>
        </div>
      </main>
      <footer className="footer">Harcama Defterim • React & Vite ile geliştirilmiştir.</footer>
    </div>
  );
}
