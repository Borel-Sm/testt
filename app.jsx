import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const formatCurrency = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const now = () => new Date().toISOString();

const CATEGORIES = ["Prensado", "Mistura", "Cigarro", "Charuto", "Fumo de Rolo", "Outro"];

const INITIAL_PRODUCTS = [
  { id: 1, name: "Folha Curada Premium", category: "Folha Curada", quantity: 50, costValue: 8.0, saleValue: 12.5, dateAdded: "2026-05-10T08:00:00" },
  { id: 2, name: "Fumo de Rolo Artesanal", category: "Fumo de Rolo", quantity: 30, costValue: 12.0, saleValue: 18.0, dateAdded: "2026-05-12T10:30:00" },
  { id: 3, name: "Charuto Médio", category: "Charuto", quantity: 20, costValue: 22.0, saleValue: 35.0, dateAdded: "2026-05-14T14:00:00" },
];

const INITIAL_SALES = [
  { id: 1, productId: 1, productName: "Folha Curada Premium", quantity: 5, costValue: 8.0, saleValue: 12.5, total: 62.5, totalCost: 40.0, date: "2026-05-18T09:15:00", buyer: "João S." },
  { id: 2, productId: 3, productName: "Charuto Médio", quantity: 3, costValue: 22.0, saleValue: 35.0, total: 105.0, totalCost: 66.0, date: "2026-05-19T14:40:00", buyer: "Maria L." },
  { id: 3, productId: 2, productName: "Fumo de Rolo Artesanal", quantity: 8, costValue: 12.0, saleValue: 18.0, total: 144.0, totalCost: 96.0, date: "2026-05-21T11:00:00", buyer: "Pedro A." },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Crimson+Pro:wght@300;400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

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
    --blue: #6a9fc0;
    --blue-dim: rgba(106, 159, 192, 0.15);
  }

  .app {
    font-family: 'Crimson Pro', Georgia, serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .topbar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 14px 20px 0;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .topbar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .brand-icon { font-size: 22px; }

  .brand-title {
    font-family: 'Playfair Display', serif;
    font-size: 17px;
    font-weight: 700;
    color: var(--accent-light);
  }

  .brand-sub {
    font-size: 10px;
    color: var(--text-dim);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .nav {
    display: flex;
    gap: 2px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .nav::-webkit-scrollbar { display: none; }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-muted);
    transition: all 0.18s;
    border: 1px solid transparent;
    border-bottom: none;
    font-family: 'Crimson Pro', serif;
    background: none;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .nav-item:hover { background: var(--accent-dim); color: var(--text); }
  .nav-item.active {
    background: var(--bg);
    color: var(--accent-light);
    border-color: var(--border);
    border-bottom-color: var(--bg);
  }

  .nav-icon { font-size: 15px; }

  .main {
    flex: 1;
    padding: 24px 16px;
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
  }

  .page-header { margin-bottom: 22px; }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--text);
    line-height: 1;
  }

  .page-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 16px;
  }

  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .stat-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 16px;
  }

  .stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
  }
  .stat-card.accent::before { background: linear-gradient(90deg, var(--accent), transparent); }
  .stat-card.green::before { background: linear-gradient(90deg, var(--green), transparent); }
  .stat-card.red::before { background: linear-gradient(90deg, var(--red), transparent); }
  .stat-card.blue::before { background: linear-gradient(90deg, var(--blue), transparent); }

  .stat-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-dim);
    margin-bottom: 6px;
  }

  .stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
  }

  .stat-sub {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 3px;
  }

  .stat-icon {
    position: absolute;
    top: 12px; right: 12px;
    font-size: 18px;
    opacity: 0.25;
  }

  .table-wrap { overflow-x: auto; margin-top: 8px; }

  table { width: 100%; border-collapse: collapse; font-size: 13px; }

  thead th {
    text-align: left;
    padding: 8px 10px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-dim);
    border-bottom: 1px solid var(--border);
    font-family: 'Crimson Pro', serif;
    font-weight: 600;
    white-space: nowrap;
  }

  tbody tr {
    border-bottom: 1px solid rgba(61,44,20,0.5);
    transition: background 0.15s;
  }
  tbody tr:hover { background: var(--card-hover); }

  tbody td {
    padding: 10px 10px;
    color: var(--text);
    vertical-align: middle;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }

  .badge-green { background: var(--green-dim); color: var(--green); }
  .badge-amber { background: var(--accent-dim); color: var(--accent-light); }
  .badge-red { background: var(--red-dim); color: var(--red); }
  .badge-blue { background: var(--blue-dim); color: var(--blue); }

  .form-stack { display: flex; flex-direction: column; gap: 12px; }
  .field { display: flex; flex-direction: column; gap: 5px; }

  label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); }

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

  /* price fields visual distinction */
  .field-cost input:focus { border-color: var(--red); }
  .field-cost label { color: var(--red); opacity: 0.8; }
  .field-sale input:focus { border-color: var(--green); }
  .field-sale label { color: var(--green); opacity: 0.8; }

  .price-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .price-divider {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 2px 0;
  }

  .price-divider-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .price-divider-label {
    font-size: 10px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .btn {
    padding: 11px 20px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-family: 'Crimson Pro', serif;
    font-size: 15px;
    font-weight: 600;
    transition: all 0.18s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--accent), #a06820);
    color: #fff;
  }
  .btn-primary:hover { filter: brightness(1.15); }

  .btn-danger {
    background: var(--red-dim);
    color: var(--red);
    border: 1px solid var(--red-dim);
    padding: 6px 10px;
    font-size: 12px;
    width: auto;
  }
  .btn-danger:hover { background: rgba(192,96,80,0.3); }

  .section-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 14px 0;
  }

  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--text-dim);
    font-size: 14px;
  }
  .empty-icon { font-size: 30px; margin-bottom: 8px; opacity: 0.5; }

  .tag {
    display: inline-block;
    background: rgba(61,44,20,0.7);
    color: var(--text-muted);
    font-size: 11px;
    padding: 2px 7px;
    border-radius: 4px;
    white-space: nowrap;
  }

  .alert {
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 12px;
  }
  .alert-success { background: var(--green-dim); color: var(--green); border: 1px solid rgba(122,173,94,0.2); }
  .alert-error { background: var(--red-dim); color: var(--red); border: 1px solid rgba(192,96,80,0.2); }

  .mb-16 { margin-bottom: 16px; }
  .mt-16 { margin-top: 16px; }

  .total-preview {
    font-size: 13px;
    color: var(--text-muted);
    padding: 10px 12px;
    background: var(--surface);
    border-radius: 8px;
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .total-preview-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .total-preview-row.profit {
    border-top: 1px solid var(--border);
    margin-top: 4px;
    padding-top: 6px;
    font-weight: 600;
  }

  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

  .margin-bar-wrap {
    margin-top: 6px;
    background: rgba(61,44,20,0.4);
    border-radius: 4px;
    height: 6px;
    overflow: hidden;
  }
  .margin-bar {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--green), #5d9448);
    transition: width 0.4s ease;
  }
`;

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [sales, setSales] = useState(INITIAL_SALES);
  const [nextId, setNextId] = useState({ p: 4, s: 4 });

  const [pForm, setPForm] = useState({ name: "", category: CATEGORIES[0], quantity: "", costValue: "", saleValue: "" });
  const [pAlert, setPAlert] = useState(null);

  const [sForm, setSForm] = useState({ productId: "", quantity: "", buyer: "" });
  const [sAlert, setSAlert] = useState(null);

  const totalStockCost = useMemo(() => products.reduce((a, p) => a + p.quantity * p.costValue, 0), [products]);
  const totalStockSaleValue = useMemo(() => products.reduce((a, p) => a + p.quantity * p.saleValue, 0), [products]);
  const totalItemsInStock = useMemo(() => products.reduce((a, p) => a + p.quantity, 0), [products]);

  const totalRevenue = useMemo(() => sales.reduce((a, s) => a + s.total, 0), [sales]);
  const totalCost = useMemo(() => sales.reduce((a, s) => a + s.totalCost, 0), [sales]);
  const totalProfit = useMemo(() => totalRevenue - totalCost, [totalRevenue, totalCost]);
  const profitMargin = useMemo(() => totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0, [totalProfit, totalRevenue]);

  const salesByDay = useMemo(() => {
    const map = {};
    sales.forEach((s) => {
      const day = new Date(s.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      if (!map[day]) map[day] = { receita: 0, custo: 0 };
      map[day].receita += s.total;
      map[day].custo += s.totalCost;
    });
    return Object.entries(map).map(([d, v]) => ({ dia: d, receita: v.receita, lucro: v.receita - v.custo }));
  }, [sales]);

  const addProduct = () => {
    if (!pForm.name || !pForm.quantity || !pForm.costValue || !pForm.saleValue) {
      setPAlert({ type: "error", msg: "Preencha todos os campos." }); return;
    }
    const qty = parseFloat(pForm.quantity);
    const cost = parseFloat(pForm.costValue);
    const sale = parseFloat(pForm.saleValue);
    if (qty <= 0 || cost <= 0 || sale <= 0) {
      setPAlert({ type: "error", msg: "Valores devem ser maiores que zero." }); return;
    }
    if (sale < cost) {
      setPAlert({ type: "error", msg: "Atenção: valor de venda menor que o de compra!" }); return;
    }
    setProducts((prev) => [...prev, {
      id: nextId.p, name: pForm.name, category: pForm.category,
      quantity: qty, costValue: cost, saleValue: sale, dateAdded: now()
    }]);
    setNextId((n) => ({ ...n, p: n.p + 1 }));
    setPForm({ name: "", category: CATEGORIES[0], quantity: "", costValue: "", saleValue: "" });
    setPAlert({ type: "success", msg: "Produto adicionado ao estoque!" });
    setTimeout(() => setPAlert(null), 3000);
  };

  const removeProduct = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const addSale = () => {
    if (!sForm.productId || !sForm.quantity) {
      setSAlert({ type: "error", msg: "Selecione o produto e informe a quantidade." }); return;
    }
    const product = products.find((p) => p.id === parseInt(sForm.productId));
    if (!product) return;
    const qty = parseInt(sForm.quantity);
    if (qty <= 0) { setSAlert({ type: "error", msg: "Quantidade inválida." }); return; }
    if (qty > product.quantity) {
      setSAlert({ type: "error", msg: `Estoque insuficiente. Disponível: ${product.quantity} unidades.` }); return;
    }
    const total = qty * product.saleValue;
    const totalCostSale = qty * product.costValue;
    setSales((prev) => [{
      id: nextId.s, productId: product.id, productName: product.name,
      quantity: qty, costValue: product.costValue, saleValue: product.saleValue,
      total, totalCost: totalCostSale, date: now(), buyer: sForm.buyer || "—"
    }, ...prev]);
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, quantity: p.quantity - qty } : p));
    setNextId((n) => ({ ...n, s: n.s + 1 }));
    setSForm({ productId: "", quantity: "", buyer: "" });
    setSAlert({ type: "success", msg: `Venda registrada! Lucro: ${formatCurrency(total - totalCostSale)}` });
    setTimeout(() => setSAlert(null), 3000);
  };

  const removeSale = (id) => setSales((prev) => prev.filter((s) => s.id !== id));

  const selectedProduct = products.find((p) => p.id === parseInt(sForm.productId));
  const saleQty = parseInt(sForm.quantity || 0);
  const salePreviewRevenue = selectedProduct ? saleQty * selectedProduct.saleValue : 0;
  const salePreviewCost = selectedProduct ? saleQty * selectedProduct.costValue : 0;
  const salePreviewProfit = salePreviewRevenue - salePreviewCost;

  const pQty = parseFloat(pForm.quantity || 0);
  const pCost = parseFloat(pForm.costValue || 0);
  const pSale = parseFloat(pForm.saleValue || 0);

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
        <div className="topbar">
          <div className="topbar-brand">
            <span className="brand-icon">🍂</span>
            <div>
              <div className="brand-title">Tabaco Artesanal</div>
              <div className="brand-sub">Gestão de Negócio</div>
            </div>
          </div>
          <nav className="nav">
            {nav.map((n) => (
              <button key={n.key} className={`nav-item ${tab === n.key ? "active" : ""}`} onClick={() => setTab(n.key)}>
                <span className="nav-icon">{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
        </div>

        <main className="main">

          {/* DASHBOARD */}
          {tab === "dashboard" && (
            <>
              <div className="page-header">
                <div className="page-title">Painel Geral</div>
                <div className="page-subtitle">Visão consolidada do seu negócio</div>
              </div>

              <div className="stat-grid">
                <div className="stat-card accent">
                  <div className="stat-icon">📦</div>
                  <div className="stat-label">Estoque (custo)</div>
                  <div className="stat-value" style={{ color: "var(--accent-light)" }}>{formatCurrency(totalStockCost)}</div>
                  <div className="stat-sub">{totalItemsInStock} unidades</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-icon">💰</div>
                  <div className="stat-label">Receita Total</div>
                  <div className="stat-value" style={{ color: "var(--green)" }}>{formatCurrency(totalRevenue)}</div>
                  <div className="stat-sub">{sales.length} vendas</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-icon">📊</div>
                  <div className="stat-label">Lucro Realizado</div>
                  <div className="stat-value" style={{ color: "var(--blue)" }}>{formatCurrency(totalProfit)}</div>
                  <div className="stat-sub">Margem: {profitMargin.toFixed(1)}%</div>
                </div>
                <div className="stat-card accent">
                  <div className="stat-icon">🏷️</div>
                  <div className="stat-label">Produtos</div>
                  <div className="stat-value" style={{ color: "var(--accent-light)" }}>{products.length}</div>
                  <div className="stat-sub">no estoque ativo</div>
                </div>
              </div>

              <div className="card mb-16">
                <div className="card-title">Receita vs Lucro por Dia (R$)</div>
                {salesByDay.length === 0 ? (
                  <div className="empty-state">Sem dados de vendas</div>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={salesByDay} margin={{ top: 8, right: 0, left: -10, bottom: 0 }}>
                      <XAxis dataKey="dia" tick={{ fill: "#9e8a6e", fontSize: 11, fontFamily: "Crimson Pro" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#9e8a6e", fontSize: 10, fontFamily: "Crimson Pro" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#271b0c", border: "1px solid #3d2c14", borderRadius: 8, fontFamily: "Crimson Pro" }}
                        labelStyle={{ color: "#f0e6d3" }}
                        formatter={(v, name) => [formatCurrency(v), name === "receita" ? "Receita" : "Lucro"]}
                      />
                      <Bar dataKey="receita" fill="#c8852a" radius={[3, 3, 0, 0]} opacity={0.6} />
                      <Bar dataKey="lucro" fill="#7aad5e" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card mb-16">
                <div className="card-title">Últimas Vendas</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Produto</th><th>Receita</th><th>Lucro</th></tr></thead>
                    <tbody>
                      {sales.slice(0, 5).map((s) => (
                        <tr key={s.id}>
                          <td>{s.productName}</td>
                          <td><span className="badge badge-amber">{formatCurrency(s.total)}</span></td>
                          <td><span className="badge badge-green">{formatCurrency(s.total - s.totalCost)}</span></td>
                        </tr>
                      ))}
                      {sales.length === 0 && <tr><td colSpan={3} className="empty-state">Sem vendas</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card">
                <div className="card-title">⚠ Alertas de Estoque Baixo</div>
                {products.filter((p) => p.quantity <= 5).length === 0 ? (
                  <div style={{ color: "var(--green)", fontSize: 14, padding: "6px 0" }}>✓ Todos os produtos com estoque adequado.</div>
                ) : (
                  <div className="table-wrap" style={{ marginTop: 8 }}>
                    <table>
                      <thead><tr><th>Produto</th><th>Qtd</th></tr></thead>
                      <tbody>
                        {products.filter((p) => p.quantity <= 5).map((p) => (
                          <tr key={p.id}>
                            <td>{p.name}</td>
                            <td><span className="badge badge-red">{p.quantity} un.</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ESTOQUE */}
          {tab === "estoque" && (
            <>
              <div className="page-header">
                <div className="page-title">Controle de Estoque</div>
                <div className="page-subtitle">Gerencie seus produtos</div>
              </div>

              <div className="card mb-16">
                <div className="card-title">Adicionar Produto</div>
                <hr className="divider" />
                {pAlert && <div className={`alert alert-${pAlert.type}`}>{pAlert.msg}</div>}
                <div className="form-stack">
                  <div className="field">
                    <label>Nome do Produto</label>
                    <input placeholder="Ex: Folha Curada Especial" value={pForm.name} onChange={(e) => setPForm({ ...pForm, name: e.target.value })} />
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label>Categoria</label>
                      <select value={pForm.category} onChange={(e) => setPForm({ ...pForm, category: e.target.value })}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Quantidade</label>
                      <input type="number" min="0" placeholder="0" value={pForm.quantity} onChange={(e) => setPForm({ ...pForm, quantity: e.target.value })} />
                    </div>
                  </div>

                  <div className="price-divider">
                    <div className="price-divider-line" />
                    <div className="price-divider-label">Valores por unidade</div>
                    <div className="price-divider-line" />
                  </div>

                  <div className="price-row">
                    <div className="field field-cost">
                      <label>💸 Preço de Compra (R$)</label>
                      <input type="number" min="0" step="0.01" placeholder="0,00" value={pForm.costValue} onChange={(e) => setPForm({ ...pForm, costValue: e.target.value })} />
                    </div>
                    <div className="field field-sale">
                      <label>🏷 Preço de Venda (R$)</label>
                      <input type="number" min="0" step="0.01" placeholder="0,00" value={pForm.saleValue} onChange={(e) => setPForm({ ...pForm, saleValue: e.target.value })} />
                    </div>
                  </div>

                  {pQty > 0 && pCost > 0 && pSale > 0 && (
                    <div className="total-preview">
                      <div className="total-preview-row">
                        <span>Custo total do lote</span>
                        <span style={{ color: "var(--red)" }}>{formatCurrency(pQty * pCost)}</span>
                      </div>
                      <div className="total-preview-row">
                        <span>Receita potencial</span>
                        <span style={{ color: "var(--accent-light)" }}>{formatCurrency(pQty * pSale)}</span>
                      </div>
                      <div className="total-preview-row profit">
                        <span>Lucro potencial</span>
                        <span style={{ color: pSale > pCost ? "var(--green)" : "var(--red)" }}>
                          {formatCurrency(pQty * (pSale - pCost))}
                          {pSale > pCost && <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.7 }}>({(((pSale - pCost) / pSale) * 100).toFixed(1)}% margem)</span>}
                        </span>
                      </div>
                    </div>
                  )}

                  <button className="btn btn-primary" onClick={addProduct}>+ Adicionar ao Estoque</button>
                </div>
              </div>

              <div className="card">
                <div className="section-actions">
                  <div className="card-title" style={{ marginBottom: 0 }}>Produtos em Estoque</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Custo: <strong style={{ color: "var(--accent-light)" }}>{formatCurrency(totalStockCost)}</strong>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Produto</th><th>Qtd</th><th>Compra</th><th>Venda</th><th>Margem</th><th></th></tr>
                    </thead>
                    <tbody>
                      {products.length === 0 && (
                        <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">📦</div>Nenhum produto.</div></td></tr>
                      )}
                      {products.map((p) => {
                        const margin = p.saleValue > 0 ? (((p.saleValue - p.costValue) / p.saleValue) * 100).toFixed(0) : 0;
                        return (
                          <tr key={p.id}>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                              <span className="tag">{p.category}</span>
                            </td>
                            <td>
                              <span className={`badge ${p.quantity <= 5 ? "badge-red" : p.quantity <= 15 ? "badge-amber" : "badge-green"}`}>
                                {p.quantity}
                              </span>
                            </td>
                            <td style={{ fontSize: 12, color: "var(--red)", opacity: 0.85 }}>{formatCurrency(p.costValue)}</td>
                            <td style={{ fontSize: 12, color: "var(--green)" }}>{formatCurrency(p.saleValue)}</td>
                            <td>
                              <span className="badge badge-blue">{margin}%</span>
                            </td>
                            <td><button className="btn btn-danger" onClick={() => removeProduct(p.id)}>✕</button></td>
                          </tr>
                        );
                      })}
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
                <div className="page-subtitle">Acompanhe suas vendas e lucros</div>
              </div>

              <div className="card mb-16">
                <div className="card-title">Nova Venda</div>
                <hr className="divider" />
                {sAlert && <div className={`alert alert-${sAlert.type}`}>{sAlert.msg}</div>}
                <div className="form-stack">
                  <div className="field">
                    <label>Produto</label>
                    <select value={sForm.productId} onChange={(e) => setSForm({ ...sForm, productId: e.target.value })}>
                      <option value="">Selecione um produto...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — venda: {formatCurrency(p.saleValue)} (estoque: {p.quantity})</option>
                      ))}
                    </select>
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label>Quantidade</label>
                      <input type="number" min="1" placeholder="0" value={sForm.quantity} onChange={(e) => setSForm({ ...sForm, quantity: e.target.value })} />
                    </div>
                    <div className="field">
                      <label>Comprador</label>
                      <input placeholder="Nome (opcional)" value={sForm.buyer} onChange={(e) => setSForm({ ...sForm, buyer: e.target.value })} />
                    </div>
                  </div>
                  {selectedProduct && saleQty > 0 && (
                    <div className="total-preview">
                      <div className="total-preview-row">
                        <span>Custo da venda</span>
                        <span style={{ color: "var(--red)" }}>{formatCurrency(salePreviewCost)}</span>
                      </div>
                      <div className="total-preview-row">
                        <span>Receita da venda</span>
                        <span style={{ color: "var(--accent-light)" }}>{formatCurrency(salePreviewRevenue)}</span>
                      </div>
                      <div className="total-preview-row profit">
                        <span>Lucro desta venda</span>
                        <span style={{ color: "var(--green)" }}>{formatCurrency(salePreviewProfit)}</span>
                      </div>
                    </div>
                  )}
                  <button className="btn btn-primary" onClick={addSale}>⊕ Registrar Venda</button>
                </div>
              </div>

              <div className="card">
                <div className="section-actions">
                  <div className="card-title" style={{ marginBottom: 0 }}>Histórico</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    Lucro: <strong style={{ color: "var(--green)" }}>{formatCurrency(totalProfit)}</strong>
                  </div>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Produto</th><th>Qtd</th><th>Receita</th><th>Lucro</th><th>Data</th><th></th></tr>
                    </thead>
                    <tbody>
                      {sales.length === 0 && (
                        <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">🧾</div>Nenhuma venda.</div></td></tr>
                      )}
                      {sales.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{s.productName}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.buyer}</div>
                          </td>
                          <td>{s.quantity}</td>
                          <td><span className="badge badge-amber">{formatCurrency(s.total)}</span></td>
                          <td><span className="badge badge-green">{formatCurrency(s.total - s.totalCost)}</span></td>
                          <td style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{formatDate(s.date)}</td>
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
                <div className="page-subtitle">Análise financeira completa</div>
              </div>

              <div className="stat-grid-3">
                <div className="stat-card red">
                  <div className="stat-icon">📤</div>
                  <div className="stat-label">Custo das Vendas</div>
                  <div className="stat-value" style={{ color: "var(--red)" }}>{formatCurrency(totalCost)}</div>
                  <div className="stat-sub">Capital investido</div>
                </div>
                <div className="stat-card green">
                  <div className="stat-icon">📥</div>
                  <div className="stat-label">Receita Total</div>
                  <div className="stat-value" style={{ color: "var(--green)" }}>{formatCurrency(totalRevenue)}</div>
                  <div className="stat-sub">Total recebido</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-icon">✨</div>
                  <div className="stat-label">Lucro Líquido</div>
                  <div className="stat-value" style={{ color: "var(--blue)" }}>{formatCurrency(totalProfit)}</div>
                  <div className="stat-sub">Margem: {profitMargin.toFixed(1)}%</div>
                </div>
              </div>

              {totalRevenue > 0 && (
                <div className="card mb-16">
                  <div className="card-title">Margem de Lucro Geral</div>
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                      <span>0%</span>
                      <strong style={{ color: "var(--green)" }}>{profitMargin.toFixed(1)}%</strong>
                      <span>100%</span>
                    </div>
                    <div className="margin-bar-wrap">
                      <div className="margin-bar" style={{ width: `${Math.min(profitMargin, 100)}%` }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="card mb-16">
                <div className="card-title">Receita vs Lucro por Dia (R$)</div>
                {salesByDay.length === 0 ? (
                  <div className="empty-state">Sem dados</div>
                ) : (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={salesByDay} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                      <XAxis dataKey="dia" tick={{ fill: "#9e8a6e", fontSize: 11, fontFamily: "Crimson Pro" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#9e8a6e", fontSize: 10, fontFamily: "Crimson Pro" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#271b0c", border: "1px solid #3d2c14", borderRadius: 8, fontFamily: "Crimson Pro" }}
                        labelStyle={{ color: "#f0e6d3" }}
                        formatter={(v, name) => [formatCurrency(v), name === "receita" ? "Receita" : "Lucro"]}
                      />
                      <Bar dataKey="receita" fill="#c8852a" radius={[3, 3, 0, 0]} opacity={0.6} name="receita" />
                      <Bar dataKey="lucro" fill="#7aad5e" radius={[3, 3, 0, 0]} name="lucro" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card mb-16">
                <div className="card-title">Lucro por Produto</div>
                {(() => {
                  const map = {};
                  sales.forEach((s) => {
                    if (!map[s.productName]) map[s.productName] = { qty: 0, revenue: 0, cost: 0 };
                    map[s.productName].qty += s.quantity;
                    map[s.productName].revenue += s.total;
                    map[s.productName].cost += s.totalCost;
                  });
                  const sorted = Object.entries(map).sort((a, b) => (b[1].revenue - b[1].cost) - (a[1].revenue - a[1].cost));
                  return sorted.length === 0 ? (
                    <div className="empty-state">Sem dados</div>
                  ) : (
                    <div style={{ marginTop: 10 }}>
                      {sorted.map(([name, d], i) => {
                        const profit = d.revenue - d.cost;
                        const margin = d.revenue > 0 ? ((profit / d.revenue) * 100).toFixed(0) : 0;
                        return (
                          <div key={name} style={{ padding: "10px 0", borderBottom: i < sorted.length - 1 ? "1px solid var(--border)" : "none" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.qty} un. · Receita: {formatCurrency(d.revenue)} · Custo: {formatCurrency(d.cost)}</div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <div><span className="badge badge-green">{formatCurrency(profit)}</span></div>
                                <div style={{ fontSize: 11, color: "var(--blue)", marginTop: 3 }}>{margin}% margem</div>
                              </div>
                            </div>
                            <div className="margin-bar-wrap">
                              <div className="margin-bar" style={{ width: `${Math.min(margin, 100)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="card">
                <div className="card-title">Potencial do Estoque Atual</div>
                <div className="table-wrap" style={{ marginTop: 8 }}>
                  <table>
                    <thead><tr><th>Categoria</th><th>Custo</th><th>Se Vender Tudo</th><th>Lucro Pot.</th></tr></thead>
                    <tbody>
                      {(() => {
                        const map = {};
                        products.forEach((p) => {
                          if (!map[p.category]) map[p.category] = { cost: 0, sale: 0 };
                          map[p.category].cost += p.quantity * p.costValue;
                          map[p.category].sale += p.quantity * p.saleValue;
                        });
                        return Object.entries(map).map(([cat, d]) => (
                          <tr key={cat}>
                            <td><span className="tag">{cat}</span></td>
                            <td style={{ color: "var(--red)", fontSize: 12 }}>{formatCurrency(d.cost)}</td>
                            <td style={{ color: "var(--accent-light)", fontSize: 12 }}>{formatCurrency(d.sale)}</td>
                            <td><span className="badge badge-green">{formatCurrency(d.sale - d.cost)}</span></td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}