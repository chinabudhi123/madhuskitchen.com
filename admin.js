import { useState, useEffect } from 'react';
import Head from 'next/head';
import { defaultMenu } from '../data/menu';

const ADMIN_PASSWORD = 'madhu2024'; // Change this!

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-900 text-yellow-300',
    preparing: 'bg-blue-900 text-blue-300',
    ready: 'bg-green-900 text-green-300',
    delivered: 'bg-gray-800 text-gray-400',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${map[status] || map.pending}`}>
      {status}
    </span>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [tab, setTab] = useState('orders'); // orders | menu
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState(defaultMenu);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!authed) return;
    const raw = localStorage.getItem('mk_orders');
    if (raw) setOrders(JSON.parse(raw));
    const rawMenu = localStorage.getItem('mk_menu');
    if (rawMenu) setMenu(JSON.parse(rawMenu));
  }, [authed]);

  const login = () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const updateOrderStatus = (orderId, status) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem('mk_orders', JSON.stringify(updated));
  };

  const toggleItem = (section, id) => {
    setMenu(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, available: !item.available } : item
      ),
    }));
  };

  const updatePrice = (section, id, price) => {
    setMenu(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, price: Number(price) } : item
      ),
    }));
  };

  const saveMenu = () => {
    localStorage.setItem('mk_menu', JSON.stringify(menu));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetMenu = () => {
    setMenu(defaultMenu);
    localStorage.removeItem('mk_menu');
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center p-4">
        <Head><title>Admin – Madhu's Kitchen</title></Head>
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-8 max-w-sm w-full">
          <h1 className="text-2xl font-extrabold text-gold mb-2">Admin Portal</h1>
          <p className="text-gray-400 text-sm mb-6">Madhu's Kitchen</p>
          <label className="text-gray-400 text-xs mb-1 block">Password</label>
          <input
            type="password"
            className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold mb-2"
            placeholder="Enter admin password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
          />
          {pwError && <p className="text-red-400 text-xs mb-3">Incorrect password</p>}
          <button
            onClick={login}
            className="w-full gold-gradient text-black font-bold py-3 rounded-xl mt-2"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head><title>Admin – Madhu's Kitchen</title></Head>
      <div className="min-h-screen bg-[#111]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#111]/95 backdrop-blur border-b border-[#2A2A2A]">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-extrabold text-gold">Admin Portal</h1>
              <p className="text-xs text-gray-500">Madhu's Kitchen</p>
            </div>
            <button
              onClick={() => setAuthed(false)}
              className="text-gray-400 text-sm hover:text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('orders')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 ${tab === 'orders' ? 'gold-gradient text-black' : 'bg-[#1C1C1C] text-gray-300'}`}
            >
              Orders
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('menu')}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm ${tab === 'menu' ? 'gold-gradient text-black' : 'bg-[#1C1C1C] text-gray-300'}`}
            >
              Manage Menu
            </button>
          </div>

          {/* Orders Tab */}
          {tab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-12 text-center">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-gray-400">No orders yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {[...orders].reverse().map(order => (
                    <div key={order.id} className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-white">#{order.id}</p>
                          <p className="text-gray-400 text-sm">{order.customer.name} · {order.customer.phone}</p>
                          {order.delivery && (
                            <p className="text-gray-400 text-xs mt-0.5">
                              📦 Block: {order.customer.block} · {order.customer.floor}
                            </p>
                          )}
                          {!order.delivery && <p className="text-gray-400 text-xs mt-0.5">🚶 Self Pickup</p>}
                          <p className="text-gray-500 text-xs mt-0.5">
                            {new Date(order.time).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gold font-bold text-lg">₹{order.total}</p>
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                      <div className="border-t border-[#2A2A2A] pt-3 mb-3">
                        {order.items.map((item, i) => (
                          <p key={i} className="text-sm text-gray-300 py-0.5">
                            {item.qty}× {item.name} <span className="text-gray-500">₹{item.price * item.qty}</span>
                          </p>
                        ))}
                        {order.customer.notes && (
                          <p className="text-xs text-yellow-400 mt-1">📝 {order.customer.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {['pending', 'preparing', 'ready', 'delivered'].map(s => (
                          <button
                            key={s}
                            onClick={() => updateOrderStatus(order.id, s)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold capitalize transition ${order.status === s ? 'gold-gradient text-black' : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#333]'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Menu Management Tab */}
          {tab === 'menu' && (
            <div>
              <div className="flex gap-3 mb-6">
                <button
                  onClick={saveMenu}
                  className="gold-gradient text-black font-bold px-5 py-2.5 rounded-xl text-sm"
                >
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
                <button
                  onClick={resetMenu}
                  className="bg-[#2A2A2A] text-gray-300 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#333]"
                >
                  Reset to Default
                </button>
              </div>

              {[
                { key: 'eveningCombos', label: '⚡ Evening Combos' },
                { key: 'dinnerCombos', label: '🌙 Dinner Combos' },
                { key: 'alaCarte', label: '🍽️ À La Carte' },
              ].map(({ key, label }) => (
                <div key={key} className="mb-8">
                  <h2 className="text-base font-bold text-white mb-3">{label}</h2>
                  <div className="flex flex-col gap-2">
                    {menu[key].map(item => (
                      <div
                        key={item.id}
                        className={`bg-[#1C1C1C] border rounded-xl p-4 flex items-center gap-4 ${item.available ? 'border-[#2A2A2A]' : 'border-red-900 opacity-60'}`}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">{item.name}</p>
                          {item.items && <p className="text-gray-500 text-xs">{item.items}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">₹</span>
                          <input
                            type="number"
                            className="w-20 bg-[#111] border border-[#2A2A2A] rounded-lg px-2 py-1.5 text-white text-sm focus:outline-none focus:border-gold text-center"
                            value={item.price}
                            onChange={e => updatePrice(key, item.id, e.target.value)}
                          />
                        </div>
                        <button
                          onClick={() => toggleItem(key, item.id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${item.available ? 'bg-green-900 text-green-300 hover:bg-red-900 hover:text-red-300' : 'bg-red-900 text-red-300 hover:bg-green-900 hover:text-green-300'}`}
                        >
                          {item.available ? '✓ Available' : '✗ Hidden'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
