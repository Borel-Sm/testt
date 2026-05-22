
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const formatCurrency = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const now = () => new Date().toISOString();

const CATEGORIES = ["Folha Curada", "Mistura", "Cigarro", "Charuto", "Fumo de Rolo", "Outro"];

const INITIAL_PRODUCTS = [
  { id: 1, name: "Folha Curada Premium", category: "Folha Curada", quantity: 50, unitValue: 12.5, dateAdded: "2026-05-10T08:00:00" },
  { id: 2, name: "Fumo de Rolo Artesanal", category: "Fumo de Rolo", quantity: 30, unitValue: 18.0, dateAdded: "2026-05-12T10:30:00" },
  { id: 3, name: "Charuto Médio", category: "Charuto", quantity: 20, unitValue: 35.0, dateAdded: "2026-05-14T14:00:00" },
];

const INITIAL_SALES = [
  { id: 1, productId: 1, productName: "Folha Curada Premium", quantity: 5, unitValue: 12.5, total: 62.5, date: "2026-05-18T09:15:00", buyer: "João S." },
  { id: 2, productId: 3, productName: "Charuto Médio", quantity: 3, unitValue: 35.0, total: 105.0, date: "2026-05-19T14:40:00", buyer: "Maria L." },
  { id: 3, productId: 2, productName: "Fumo de Rolo Artesanal", quantity: 8, unitValue: 18.0, total: 144.0, date: "2026-05-21T11:00:00", buyer: "Pedro A." },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Crimson+Pro:wght@300;400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #110d06; }

  :root {
    --bg: #110d06;
    --surface: #1e1509;
    --card: #271b0c;
    --card-hover: #2f2010;
    --border: #3d2c14;
    --accent: #c8852a;
    --accent-light: #e8a84a;
    --accent-dim: rgba(200, 133, 42, 0.15);
    --text: #f0e6d3;
    --text-muted: #9e8a6e;
    --text-dim: #6a5840;
    --green: #7aad5e;
    --green-dim: rgba(122, 173, 94, 0.15);
    --red: #c06050;
    --red-dim: rgba(192, 96, 80, 0.15);
    --shadow: 0 4px 24px rgba(0,0,0,0.5);
  }

  .app {
    font-family: 'Crimson Pro', Georgia, serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
  }

  /* SIDEBAR */
  .sidebar {
    width: 220px;
    min-height: 100vh;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 0 0 24px;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 10;
  }

  .sidebar-brand {
    padding: 28px 20px 20px;
    border-bottom: 1px solid var(--border);
  }

  .brand-icon {
    font-size: 28px;
    margin-bottom: 6px;
  }

  .brand-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--accent-light);
    line-height: 1.2;
  }

  .brand-sub {
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-top: 2px;
  }

  .nav {
    padding: 16px 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-muted);
    transition: all 0.18s;
    border: 1px solid transparent;
    font-family: 'Crimson Pro', serif;
    background: none;
    width: 100%;
    text-align: left;
  }

  .nav-item:hover {
    background: var(--accent-dim);
    color: var(--text);
  }

  .nav-item.active {
    background: var(--accent-dim);
    color: var(--accent-light);
    border-color: rgba(200, 133, 42, 0.25);
  }

  .nav-icon { font-size: 16px; width: 20px; text-align: center; }

  .sidebar-footer {
    padding: 12px 20px 0;
    border-top: 1px solid var(--border);
    font-size: 11px;
    color: var(--text-dim);
    text-align: center;
  }

  /* MAIN */
  .main {
    margin-left: 220px;
    flex: 1;
    padding: 32px 36px;
    max-width: 1100px;
  }

  .page-header {
    margin-bottom: 28px;
  }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: var(--text);
    line-height: 1;
  }

  .page-subtitle {
    font-size: 15px;
    color: var(--text-muted);
    margin-top: 5px;
  }

  /* CARDS */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 24px;
  }

  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
  }

  /* STAT GRID */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), transparent);
  }

  .stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-dim);
    margin-bottom: 8px;
  }

  .stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--accent-light);
  }

  .stat-sub {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .stat-icon {
    position: absolute;
    top: 16px; right: 16px;
    font-size: 22px;
    opacity: 0.3;
  }

  /* GRID LAYOUTS */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }

  /* TABLE */
  .table-wrap { overflow-x: auto; margin-top: 8px; }

  table { width: 100%; border-collapse: collapse; font-size: 14px; }

  thead th {
    text-align: left;
    padding: 10px 12px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-dim);
    border-bottom: 1px solid var(--border);
    font-family: 'Crimson Pro', serif;
    font-weight: 600;
  }

  tbody tr {
    border-bottom: 1px solid rgba(61,44,20,0.5);
    transition: background 0.15s;
  }

  tbody tr:hover { background: var(--card-hover); }

  tbody td {
    padding: 12px 12px;
    color: var(--text);
    vertical-align: middle;
  }

  .badge {
    display: inline-block;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }

  .badge-green { background: var(--green-dim); color: var(--green); }
  .badge-amber { background: var(--accent-dim); color: var(--accent-light); }
  .badge-red { background: var(--red-dim); color: var(--red); }

  /* FORMS */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

  .field { display: flex; flex-direction: column; gap: 5px; }
  .field.full { grid-column: 1 / -1; }

  label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); }

  input, select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 15px;
    color: var(--text);
    font-family: 'Crimson Pro', serif;
    outline: none;
    transition: border 0.18s;
    width: 100%;
  }

  input:focus, select:focus { border-color: var(--accent); }
  select option { background: #1e1509; }

  .btn {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-family: 'Crimson Pro', serif;
    font-size: 15px;
    font-weight: 600;
    transition: all 0.18s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent), #a06820);
    color: #fff;
  }

  .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }

  .btn-ghost {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-muted);
  }

  .btn-ghost:hover { border-color: var(--accent); color: var(--accent-light); }

  .btn-danger {
    background: var(--red-dim);
    color: var(--red);
    border: 1px solid var(--red-dim);
    padding: 6px 12px;
    font-size: 13px;
  }

  .btn-danger:hover { background: rgba(192,96,80,0.3); }

  .section-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 20px 0;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: var(--text-dim);
    font-size: 14px;
  }

  .empty-state .empty-icon { font-size: 36px; margin-bottom: 8px; opacity: 0.5; }

  .tag {
    display: inline-block;
    background: rgba(61,44,20,0.7);
    color: var(--text-muted);
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .alert {
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 14px;
  }

  .alert-success { background: var(--green-dim); color: var(--green); border: 1px solid rgba(122,173,94,0.2); }
  .alert-error { background: var(--red-dim); color: var(--red); border: 1px solid rgba(192,96,80,0.2); }

  .mb-16 { margin-bottom: 16px; }
  .mt-16 { margin-top: 16px; }

  .recharts-tooltip-wrapper { font-family: 'Crimson Pro', serif !important; }
`;

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [sales, setSales] = useState(INITIAL_SALES);
  const [nextId, setNextId] = useState({ p: 4, s: 4 });

  // Product form
  const [pForm, setPForm] = useState({ name: "", category: CATEGORIES[0], quantity: "", unitValue: "" });
  const [pAlert, setPAlert] = useState(null);

  // Sale form
  const [sForm, setSForm] = useState({ productId: "", quantity: "", buyer: "" });
  const [sAlert, setSAlert] = useState(null);

  const totalStockValue = useMemo(
    () => products.reduce((a, p) => a + p.quantity * p.unitValue, 0),
    [products]
  );

  const totalSalesRevenue = useMemo(
    () => sales.reduce((a, s) => a + s.total, 0),
    [sales]
  );

  const totalItemsInStock = useMemo(
    () => products.reduce((a, p) => a + p.quantity, 0),
    [products]
  );

  // Chart data: sales by day
  const salesByDay = useMemo(() => {
    const map = {};
    sales.forEach((s) => {
      const day = new Date(s.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      map[day] = (map[day] || 0) + s.total;
    });
    return Object.entries(map).map(([d, v]) => ({ dia: d, valor: v }));
  }, [sales]);

  const addProduct = () => {
    if (!pForm.name || !pForm.quantity || !pForm.unitValue) {
      setPAlert({ type: "error", msg: "Preencha todos os campos." });
      return;
    }
    const qty = parseFloat(pForm.quantity);
    const val = parseFloat(pForm.unitValue);
    if (qty <= 0 || val <= 0) {
      setPAlert({ type: "error", msg: "Quantidade e valor devem ser maiores que zero." });
      return;
    }
    setProducts((prev) => [
      ...prev,
      { id: nextId.p, name: pForm.name, category: pForm.category, quantity: qty, unitValue: val, dateAdded: now() },
    ]);
    setNextId((n) => ({ ...n, p: n.p + 1 }));
    setPForm({ name: "", category: CATEGORIES[0], quantity: "", unitValue: "" });
    setPAlert({ type: "success", msg: "Produto adicionado ao estoque!" });
    setTimeout(() => setPAlert(null), 3000);
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addSale = () => {
    if (!sForm.productId || !sForm.quantity) {
      setSAlert({ type: "error", msg: "Selecione o produto e informe a quantidade." });
      return;
    }
    const product = products.find((p) => p.id === parseInt(sForm.productId));
    if (!product) return;
    const qty = parseInt(sForm.quantity);
    if (qty <= 0) { setSAlert({ type: "error", msg: "Quantidade inválida." }); return; }
    if (qty > product.quantity) {
      setSAlert({ type: "error", msg: `Estoque insuficiente. Disponível: ${product.quantity} unidades.` });
      return;
    }
    const total = qty * product.unitValue;
    setSales((prev) => [
      { id: nextId.s, productId: product.id, productName: product.name, quantity: qty, unitValue: product.unitValue, total, date: now(), buyer: sForm.buyer || "—" },
      ...prev,
    ]);
    setProducts((prev) =>
      prev.map((p) => p.id === product.id ? { ...p, quantity: p.quantity - qty } : p)
    );
    setNextId((n) => ({ ...n, s: n.s + 1 }));
    setSForm({ productId: "", quantity: "", buyer: "" });
    setSAlert({ type: "success", msg: `Venda registrada: ${formatCurrency(total)}` });
    setTimeout(() => setSAlert(null), 3000);
  };

  const removeSale = (id) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  const selectedProduct = products.find((p) => p.id === parseInt(sForm.productId));

  const nav = [
    { key: "dashboard", icon: "◈", label: "Painel" },
    { key: "estoque", icon: "⊟", label: "Estoque" },
    { key: "vendas", icon: "⊕", label: "Vendas" },
    { key: "relatorios", icon: "◎", label: "Relatórios" },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">🍂</div>
            <div className="brand-title">Tabaco Artesanal</div>
            <div className="brand-sub">Gestão de Negócio</div>
          </div>
          <nav className="nav">
            {nav.map((n) => (
              <button key={n.key} className={`nav-item ${tab === n.key ? "active" : ""}`} onClick={() => setTab(n.key)}>
                <span className="nav-icon">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">v1.0 · 2026</div>
        </aside>

        {/* MAIN */}
        <main className="main">

          {/* DASHBOARD */}
          {tab === "dashboard" && (
            <>
              <div className="page-header">
                <div className="page-title">Painel Geral</div>
                <div className="page-subtitle">Visão consolidada do seu negócio</div>
              </div>

              <div className="stat-grid">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-label">Valor em Estoque</div>
                  <div className="stat-value">{formatCurrency(totalStockValue)}</div>
                  <div className="stat-sub">{totalItemsInStock} unidades totais</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-label">Receita de Vendas</div>
                  <div className="stat-value">{formatCurrency(totalSalesRevenue)}</div>
                  <div className="stat-sub">{sales.length} vendas realizadas</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏷️</div>
                  <div className="stat-label">Produtos Cadastrados</div>
                  <div className="stat-value">{products.length}</div>
                  <div className="stat-sub">no estoque ativo</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-label">Ticket Médio</div>
                  <div className="stat-value">{formatCurrency(sales.length ? totalSalesRevenue / sales.length : 0)}</div>
                  <div className="stat-sub">por venda</div>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-title">Vendas por Dia (R$)</div>
                  {salesByDay.length === 0 ? (
                    <div className="empty-state"><div>Sem dados de vendas</div></div>
                  ) : (
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={salesByDay} margin={{ top: 8, right: 0, left: -10, bottom: 0 }}>
                        <XAxis dataKey="dia" tick={{ fill: "#9e8a6e", fontSize: 12, fontFamily: "Crimson Pro" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#9e8a6e", fontSize: 11, fontFamily: "Crimson Pro" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#271b0c", border: "1px solid #3d2c14", borderRadius: 8, fontFamily: "Crimson Pro" }}
                          labelStyle={{ color: "#f0e6d3" }}
                          itemStyle={{ color: "#e8a84a" }}
                          formatter={(v) => [formatCurrency(v), "Vendas"]}
                        />
                        <Bar dataKey="valor" fill="#c8852a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="card">
                  <div className="card-title">Últimas Vendas</div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Qtd</th>
                          <th>Total</th>
                          <th>Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.slice(0, 5).map((s) => (
                          <tr key={s.id}>
                            <td>{s.productName}</td>
                            <td>{s.quantity}</td>
                            <td><span className="badge badge-green">{formatCurrency(s.total)}</span></td>
                            <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(s.date)}</td>
                          </tr>
                        ))}
                        {sales.length === 0 && <tr><td colSpan={4} className="empty-state">Sem vendas</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Stock alerts */}
              <div className="card mt-16">
                <div className="card-title">Alertas de Estoque Baixo</div>
                <div className="table-wrap" style={{ marginTop: 10 }}>
                  {products.filter((p) => p.quantity <= 5).length === 0 ? (
                    <div style={{ color: "var(--green)", fontSize: 14, padding: "8px 0" }}>✓ Todos os produtos com estoque adequado.</div>
                  ) : (
                    <table>
                      <thead><tr><th>Produto</th><th>Categoria</th><th>Qtd Restante</th></tr></thead>
                      <tbody>
                        {products.filter((p) => p.quantity <= 5).map((p) => (
                          <tr key={p.id}>
                            <td>{p.name}</td>
                            <td><span className="tag">{p.category}</span></td>
                            <td><span className="badge badge-red">{p.quantity} un.</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ESTOQUE */}
          {tab === "estoque" && (
            <>
              <div className="page-header">
                <div className="page-title">Controle de Estoque</div>
                <div className="page-subtitle">Gerencie seus produtos e quantidades</div>
              </div>

              <div className="card mb-16">
                <div className="card-title">Adicionar Produto ao Estoque</div>
                <hr className="divider" />
                {pAlert && <div className={`alert alert-${pAlert.type}`}>{pAlert.msg}</div>}
                <div className="form-grid">
                  <div className="field full">
                    <label>Nome do Produto</label>
                    <input placeholder="Ex: Folha Curada Especial" value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Categoria</label>
                    <select value={pForm.category} onChange={(e) => setPForm({ ...pForm, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Quantidade (unidades)</label>
                    <input type="number" min="0" placeholder="0" value={pForm.quantity} onChange={(e) => setPForm({ ...pForm, quantity: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Valor Unitário (R$)</label>
                    <input type="number" min="0" step="0.01" placeholder="0,00" value={pForm.unitValue} onChange={(e) => setPForm({ ...pForm, unitValue: e.target.value })} />
                  </div>
                  <div className="field" style={{ alignItems: "flex-end" }}>
                    {pForm.quantity && pForm.unitValue && (
                      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                        Total: <strong style={{ color: "var(--accent-light)" }}>{formatCurrency(parseFloat(pForm.quantity || 0) * parseFloat(pForm.unitValue || 0))}</strong>
                      </div>
                    )}
                    <button className="btn btn-primary" onClick={addProduct}>+ Adicionar ao Estoque</button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="section-actions">
                  <div className="card-title" style={{ marginBottom: 0 }}>Produtos em Estoque</div>
                  <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    Total: <strong style={{ color: "var(--accent-light)" }}>{formatCurrency(totalStockValue)}</strong>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Quantidade</th>
                        <th>Valor Un.</th>
                        <th>Total</th>
                        <th>Data Entrada</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 && (
                        <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📦</div>Nenhum produto cadastrado.</div></td></tr>
                      )}
                      {products.map((p) => (
                        <tr key={p.id}>
                          <td><strong>{p.name}</strong></td>
                          <td><span className="tag">{p.category}</span></td>
                          <td>
                            <span className={`badge ${p.quantity <= 5 ? "badge-red" : p.quantity <= 15 ? "badge-amber" : "badge-green"}`}>
                              {p.quantity} un.
                            </span>
                          </td>
                          <td>{formatCurrency(p.unitValue)}</td>
                          <td style={{ color: "var(--accent-light)", fontWeight: 600 }}>{formatCurrency(p.quantity * p.unitValue)}</td>
                          <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(p.dateAdded).toLocaleDateString("pt-BR")}</td>
                          <td><button className="btn btn-danger" onClick={() => removeProduct(p.id)}>✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* VENDAS */}
          {tab === "vendas" && (
            <>
              <div className="page-header">
                <div className="page-title">Registrar Venda</div>
                <div className="page-subtitle">Acompanhe suas vendas com data, hora e valores</div>
              </div>

              <div className="card mb-16">
                <div className="card-title">Nova Venda</div>
                <hr className="divider" />
                {sAlert && <div className={`alert alert-${sAlert.type}`}>{sAlert.msg}</div>}
                <div className="form-grid">
                  <div className="field">
                    <label>Produto</label>
                    <select value={sForm.productId} onChange={(e) => setSForm({ ...sForm, productId: e.target.value })}>
                      <option value="">Selecione um produto...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} (estoque: {p.quantity})</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Quantidade</label>
                    <input type="number" min="1" placeholder="0" value={sForm.quantity} onChange={(e) => setSForm({ ...sForm, quantity: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Comprador (opcional)</label>
                    <input placeholder="Nome do cliente" value={sForm.buyer} onChange={(e) => setSForm({ ...sForm, buyer: e.target.value })} />
                  </div>
                  <div className="field" style={{ alignItems: "flex-end" }}>
                    {selectedProduct && sForm.quantity && (
                      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                        Total: <strong style={{ color: "var(--accent-light)" }}>
                          {formatCurrency(parseInt(sForm.quantity || 0) * selectedProduct.unitValue)}
                        </strong>
                      </div>
                    )}
                    <button className="btn btn-primary" onClick={addSale}>⊕ Registrar Venda</button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="section-actions">
                  <div className="card-title" style={{ marginBottom: 0 }}>Histórico de Vendas</div>
                  <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    Total recebido: <strong style={{ color: "var(--green)" }}>{formatCurrency(totalSalesRevenue)}</strong>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Produto</th>
                        <th>Qtd</th>
                        <th>Valor Un.</th>
                        <th>Total Recebido</th>
                        <th>Comprador</th>
                        <th>Data e Hora</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.length === 0 && (
                        <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">🧾</div>Nenhuma venda registrada.</div></td></tr>
                      )}
                      {sales.map((s) => (
                        <tr key={s.id}>
                          <td style={{ color: "var(--text-dim)", fontSize: 12 }}>#{s.id}</td>
                          <td><strong>{s.productName}</strong></td>
                          <td>{s.quantity}</td>
                          <td>{formatCurrency(s.unitValue)}</td>
                          <td><span className="badge badge-green">{formatCurrency(s.total)}</span></td>
                          <td style={{ color: "var(--text-muted)" }}>{s.buyer}</td>
                          <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatDate(s.date)}</td>
                          <td><button className="btn btn-danger" onClick={() => removeSale(s.id)}>✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* RELATÓRIOS */}
          {tab === "relatorios" && (
            <>
              <div className="page-header">
                <div className="page-title">Relatórios</div>
                <div className="page-subtitle">Análise financeira do seu negócio</div>
              </div>

              <div className="stat-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <div className="stat-card">
                  <div className="stat-icon">📥</div>
                  <div className="stat-label">Valor Total em Estoque</div>
                  <div className="stat-value">{formatCurrency(totalStockValue)}</div>
                  <div className="stat-sub">Capital investido em produtos</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💵</div>
                  <div className="stat-label">Total de Receita</div>
                  <div className="stat-value" style={{ color: "var(--green)" }}>{formatCurrency(totalSalesRevenue)}</div>
                  <div className="stat-sub">Valor recebido de vendas</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔄</div>
                  <div className="stat-label">Saldo Geral</div>
                  <div className="stat-value" style={{ color: totalSalesRevenue >= totalStockValue ? "var(--green)" : "var(--accent-light)" }}>
                    {formatCurrency(totalSalesRevenue + totalStockValue)}
                  </div>
                  <div className="stat-sub">Estoque + receita</div>
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-title">Receita por Dia (R$)</div>
                  {salesByDay.length === 0 ? (
                    <div className="empty-state">Sem dados</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={salesByDay} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                        <XAxis dataKey="dia" tick={{ fill: "#9e8a6e", fontSize: 12, fontFamily: "Crimson Pro" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#9e8a6e", fontSize: 11, fontFamily: "Crimson Pro" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#271b0c", border: "1px solid #3d2c14", borderRadius: 8, fontFamily: "Crimson Pro" }}
                          labelStyle={{ color: "#f0e6d3" }}
                          itemStyle={{ color: "#7aad5e" }}
                          formatter={(v) => [formatCurrency(v), "Receita"]}
                        />
                        <Line type="monotone" dataKey="valor" stroke="var(--green)" strokeWidth={2} dot={{ fill: "var(--green)", r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="card">
                  <div className="card-title">Produtos Mais Vendidos</div>
                  {(() => {
                    const map = {};
                    sales.forEach((s) => {
                      if (!map[s.productName]) map[s.productName] = { qty: 0, rev: 0 };
                      map[s.productName].qty += s.quantity;
                      map[s.productName].rev += s.total;
                    });
                    const sorted = Object.entries(map).sort((a, b) => b[1].rev - a[1].rev);
                    return sorted.length === 0 ? (
                      <div className="empty-state">Sem dados</div>
                    ) : (
                      <div style={{ marginTop: 10 }}>
                        {sorted.map(([name, d], i) => (
                          <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : "none" }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
                              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{d.qty} unidades vendidas</div>
                            </div>
                            <span className="badge badge-amber">{formatCurrency(d.rev)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="card mt-16">
                <div className="card-title">Resumo por Categoria (Estoque)</div>
                <div className="table-wrap" style={{ marginTop: 10 }}>
                  {(() => {
                    const map = {};
                    products.forEach((p) => {
                      if (!map[p.category]) map[p.category] = { qty: 0, value: 0, count: 0 };
                      map[p.category].qty += p.quantity;
                      map[p.category].value += p.quantity * p.unitValue;
                      map[p.category].count += 1;
                    });
                    const entries = Object.entries(map);
                    return entries.length === 0 ? (
                      <div className="empty-state">Sem dados de estoque</div>
                    ) : (
                      <table>
                        <thead><tr><th>Categoria</th><th>Produtos</th><th>Unidades</th><th>Valor Total</th></tr></thead>
                        <tbody>
                          {entries.map(([cat, d]) => (
                            <tr key={cat}>
                              <td><span className="tag">{cat}</span></td>
                              <td>{d.count}</td>
                              <td>{d.qty}</td>
                              <td style={{ color: "var(--accent-light)", fontWeight: 600 }}>{formatCurrency(d.value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}