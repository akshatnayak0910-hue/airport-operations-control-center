import React, { useState, useMemo } from 'react';
import { RetailTransaction } from '../types';
import { ShoppingCart, DollarSign, TrendingUp, CreditCard, Coffee, Package } from 'lucide-react';

interface RetailAnalyticsProps {
  retail: RetailTransaction[];
}

const CATEGORY_COLOR: Record<string, string> = {
  'Food & Beverage': 'bg-amber-500',
  'Duty-Free': 'bg-indigo-500',
  'Shopping': 'bg-purple-500',
  'Pharmacy': 'bg-emerald-500',
  'Electronics': 'bg-cyan-500',
  'Books & Gifts': 'bg-rose-500',
};

const PAYMENT_COLOR: Record<string, string> = {
  'UPI': 'bg-cyan-500',
  'Credit Card': 'bg-indigo-500',
  'Debit Card': 'bg-emerald-500',
  'Cash': 'bg-amber-500',
  'Contactless': 'bg-purple-500',
};

export const RetailAnalytics: React.FC<RetailAnalyticsProps> = ({ retail }) => {
  const [selectedTerminal, setSelectedTerminal] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const terminals = useMemo(() => Array.from(new Set(retail.map(r => r.terminal))).sort(), [retail]);
  const categories = useMemo(() => Array.from(new Set(retail.map(r => r.category))).sort(), [retail]);

  const filtered = useMemo(() => retail.filter(r => {
    const matchTerminal = selectedTerminal === 'All' || r.terminal === selectedTerminal;
    const matchCat = selectedCategory === 'All' || r.category === selectedCategory;
    return matchTerminal && matchCat;
  }), [retail, selectedTerminal, selectedCategory]);

  // KPIs
  const totalRevenue = filtered.reduce((acc, r) => acc + r.amount, 0);
  const totalTransactions = filtered.length;
  const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Revenue by category
  const revenueByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(r => { map[r.category] = (map[r.category] || 0) + r.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const maxCatRevenue = revenueByCategory.length > 0 ? revenueByCategory[0][1] : 1;

  // Top outlets
  const topOutlets = useMemo(() => {
    const map: Record<string, { revenue: number; txns: number; category: string }> = {};
    filtered.forEach(r => {
      if (!map[r.outletName]) map[r.outletName] = { revenue: 0, txns: 0, category: r.category };
      map[r.outletName].revenue += r.amount;
      map[r.outletName].txns += 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 6);
  }, [filtered]);

  // Payment mode breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach(r => { map[r.paymentMode] = (map[r.paymentMode] || 0) + r.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  // Revenue by terminal
  const terminalRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    retail.forEach(r => { map[r.terminal] = (map[r.terminal] || 0) + r.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [retail]);
  const maxTerminalRevenue = terminalRevenue.length > 0 ? terminalRevenue[0][1] : 1;

  // Recent transactions feed
  const recentTxns = [...filtered].sort((a, b) => b.transactionTime.getTime() - a.transactionTime.getTime()).slice(0, 10);

  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${Math.round(n)}`;

  return (
    <div className="flex flex-col gap-5" style={{ height: 'calc(100vh - 210px)', overflow: 'hidden' }}>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-center flex-shrink-0">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ShoppingCart className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wider">Retail & Revenue Intelligence</span>
        </div>
        <div className="flex-1" />
        <select value={selectedTerminal} onChange={e => setSelectedTerminal(e.target.value)}
          className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 py-2 px-3 rounded-lg focus:outline-none">
          <option value="All">All Terminals</option>
          {terminals.map(t => <option key={t} value={t}>Terminal {t}</option>)}
        </select>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
          className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 py-2 px-3 rounded-lg focus:outline-none">
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4 flex-shrink-0">
        <div className="p-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">{fmt(totalRevenue)}</div>
          <div className="text-xs text-slate-500 font-mono mt-1">{totalTransactions} transactions</div>
        </div>
        <div className="p-4 rounded-2xl border border-cyan-500/25 bg-cyan-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Avg Basket Size</span>
            <ShoppingCart className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-cyan-400">{fmt(avgTransaction)}</div>
          <div className="text-xs text-slate-500 font-mono mt-1">per transaction</div>
        </div>
        <div className="p-4 rounded-2xl border border-purple-500/25 bg-purple-500/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Active Outlets</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">
            {new Set(filtered.map(r => r.outletId)).size}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-1">across terminals</div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 overflow-hidden">

        {/* Revenue by Category — CSS bar chart */}
        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 flex flex-col overflow-hidden">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2 flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue by Category
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {revenueByCategory.map(([cat, rev]) => {
              const pct = Math.round((rev / maxCatRevenue) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">{cat}</span>
                    <span className="text-slate-400">{fmt(rev)}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full overflow-hidden" style={{ height: '8px' }}>
                    <div className={`h-full rounded-full transition-all duration-700 ${CATEGORY_COLOR[cat] || 'bg-slate-500'}`}
                      style={{ width: pct + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Outlets */}
        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 flex flex-col overflow-hidden">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2 flex-shrink-0">
            <Coffee className="w-4 h-4 text-amber-400" /> Top Outlets
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto">
            {topOutlets.map(([name, data], idx) => (
              <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/40">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black font-mono bg-slate-800 text-slate-300 flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">{name}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">{data.txns} txns</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-emerald-400">{fmt(data.revenue)}</div>
                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 text-white ${CATEGORY_COLOR[data.category] || 'bg-slate-600'}`}>
                    {data.category.split(' ')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: payment modes + terminal heatmap + live feed */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* Payment Mode Split */}
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Payment Modes
            </h3>
            <div className="space-y-2">
              {paymentBreakdown.map(([mode, rev]) => {
                const pct = Math.round((rev / Math.max(totalRevenue, 1)) * 100);
                return (
                  <div key={mode} className="flex items-center gap-2 text-xs font-mono">
                    <span className="w-20 text-slate-400 truncate">{mode}</span>
                    <div className="flex-1 bg-slate-800 rounded-full overflow-hidden" style={{ height: '5px' }}>
                      <div className={`h-full rounded-full ${PAYMENT_COLOR[mode] || 'bg-slate-500'}`} style={{ width: pct + '%' }} />
                    </div>
                    <span className="text-slate-400 w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Terminal Revenue Heatmap */}
          <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 flex-shrink-0">
            <h3 className="text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider">Terminal Revenue</h3>
            <div className="grid grid-cols-2 gap-2">
              {terminalRevenue.map(([terminal, rev]) => {
                const pct = Math.round((rev / maxTerminalRevenue) * 100);
                const intensity = pct > 75 ? 'bg-emerald-500/30 border-emerald-500/40' :
                  pct > 40 ? 'bg-cyan-500/20 border-cyan-500/30' : 'bg-slate-800/40 border-slate-700/30';
                return (
                  <div key={terminal} className={`p-2.5 rounded-lg border text-center ${intensity}`}>
                    <div className="text-xs font-bold font-mono text-slate-200">T{terminal}</div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">{fmt(rev)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Transaction Feed */}
          <div className="flex-1 p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden flex flex-col">
            <h3 className="text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider flex-shrink-0">Live Txn Feed</h3>
            <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[10px]">
              {recentTxns.map(txn => (
                <div key={txn.transactionId} className="flex justify-between items-center py-1.5 border-b border-slate-800/30">
                  <div>
                    <span className="text-slate-300 font-semibold">{txn.outletName.slice(0, 14)}</span>
                    <span className="text-slate-600 mx-1">|</span>
                    <span className="text-slate-500">{txn.itemName.slice(0, 12)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{txn.transactionTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                    <span className="text-emerald-400 font-bold">{fmt(txn.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

