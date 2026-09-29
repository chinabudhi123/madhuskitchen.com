import { useState, useEffect } from 'react';
import Head from 'next/head';
import { defaultMenu } from '../data/menu';

const DELIVERY_FEE = 20;

function TagBadge({ label }) {
  const colors = {
    'Combo 1': 'bg-orange-600',
    'Combo 2': 'bg-purple-600',
    'Combo 3': 'bg-green-700',
    'Chicken Half': 'bg-orange-600',
    'Full Plate': 'bg-purple-600',
    'Paneer Half': 'bg-purple-600',
    'Veg Special': 'bg-green-700',
    'Non-Veg Special': 'bg-red-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded text-white ${colors[label] || 'bg-gray-600'}`}>
      {label}
    </span>
  );
}

function MenuItemCard({ item, onAdd, onRemove, qty }) {
  return (
    <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-xl p-4 card-hover flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {item.tag && <TagBadge label={item.tag} />}
          <h3 className="font-bold text-white mt-1 text-base">{item.name}</h3>
          {item.items && <p className="text-gray-400 text-sm mt-0.5">{item.items}</p>}
          {item.unit && <p className="text-gray-400 text-xs">per {item.unit}</p>}
          {item.freeWith && (
            <span className="inline-block mt-1 text-xs bg-[#1a2e1a] text-green-400 border border-green-800 px-2 py-0.5 rounded-full">
              🎁 {item.freeWith}
            </span>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-gold font-bold text-lg">₹{item.price}</p>
        </div>
      </div>
      <div className="flex items-center justify-end mt-1">
        {qty === 0 ? (
          <button
            onClick={() => onAdd(item)}
            className="gold-gradient text-black font-semibold text-sm px-4 py-1.5 rounded-lg hover:opacity-90 transition"
          >
            Add
          </button>
        ) : (
          <div className="flex items-center gap-3 bg-[#2A2A2A] rounded-lg px-3 py-1">
            <button onClick={() => onRemove(item)} className="text-gold font-bold text-lg w-6 text-center">−</button>
            <span className="text-white font-semibold text-sm w-4 text-center">{qty}</span>
            <button onClick={() => onAdd(item)} className="text-gold font-bold text-lg w-6 text-center">+</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [menu, setMenu] = useState(defaultMenu);
  const [cart, setCart] = useState({});
  const [step, setStep] = useState('menu'); // menu | details | confirm | success
  const [delivery, setDelivery] = useState(false);
  const [form, setForm] = useState({
    name: '',
    block: '',
    floor: '',
    phone: '',
    notes: '',
  });
  const [orderPlaced, setOrderPlaced] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('mk_menu');
    if (saved) {
      try { setMenu(JSON.parse(saved)); } catch {}
    }
  }, []);

  const allItems = [
    ...menu.eveningCombos,
    ...menu.dinnerCombos,
    ...menu.alaCarte,
  ].filter(i => i.available);

  const addToCart = (item) => {
    setCart(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[item.id] > 1) next[item.id]--;
      else delete next[item.id];
      return next;
    });
  };

  const cartItems = allItems.filter(i => cart[i.id]);
  const subtotal = cartItems.reduce((s, i) => s + i.price * cart[i.id], 0);
  const deliveryFee = delivery ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const placeOrder = () => {
    const order = {
      id: Math.random().toString(36).substr(2, 8).toUpperCase(),
      items: cartItems.map(i => ({ name: i.name, qty: cart[i.id], price: i.price })),
      subtotal,
      delivery,
      deliveryFee,
      total,
      customer: form,
      time: new Date().toISOString(),
      status: 'pending',
    };
    const orders = JSON.parse(localStorage.getItem('mk_orders') || '[]');
    orders.push(order);
    localStorage.setItem('mk_orders', JSON.stringify(orders));
    setOrderPlaced(order);
    setStep('success');
  };

  if (step === 'success' && orderPlaced) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center p-4">
        <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-gray-400 mb-4">Order ID: <span className="text-gold font-bold">#{orderPlaced.id}</span></p>
          <div className="bg-[#111] rounded-xl p-4 text-left mb-4">
            {orderPlaced.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1 border-b border-[#2A2A2A] last:border-0">
                <span className="text-gray-300">{item.qty}× {item.name}</span>
                <span className="text-white">₹{item.price * item.qty}</span>
              </div>
            ))}
            {orderPlaced.delivery && (
              <div className="flex justify-between text-sm py-1 border-b border-[#2A2A2A]">
                <span className="text-gray-300">Delivery</span>
                <span className="text-white">₹{DELIVERY_FEE}</span>
              </div>
            )}
            <div className="flex justify-between font-bold mt-2">
              <span className="text-white">Total</span>
              <span className="text-gold">₹{orderPlaced.total}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-6">
            {orderPlaced.delivery
              ? `Delivery to Block ${orderPlaced.customer.block}, ${orderPlaced.customer.floor}`
              : 'Self pickup'}
          </p>
          <p className="text-green-400 text-sm mb-6">We'll prepare your order shortly! 🙏</p>
          <button
            onClick={() => { setCart({}); setStep('menu'); setForm({ name:'',block:'',floor:'',phone:'',notes:'' }); setDelivery(false); }}
            className="gold-gradient text-black font-bold px-6 py-3 rounded-xl w-full"
          >
            Order Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Madhu's Kitchen – Home-Cooked with Love</title>
        <meta name="description" content="Order fresh home-cooked food from Madhu's Kitchen. Evening snacks and dinner combos." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-[#111]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#111]/95 backdrop-blur border-b border-[#2A2A2A]">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-gold leading-tight">Madhu's Kitchen</h1>
              <p className="text-xs text-gray-500">Home-Cooked with Love</p>
            </div>
            {cartCount > 0 && (
              <button
                onClick={() => setStep('details')}
                className="gold-gradient text-black font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-2"
              >
                🛒 {cartCount} · ₹{subtotal}
              </button>
            )}
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 pb-32">
          {step === 'menu' && (
            <>
              {/* Hero */}
              <div className="py-6">
                <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-5">
                  <p className="text-gold text-xs font-semibold uppercase tracking-wider">Jai Jagannath 🙏</p>
                  <h2 className="text-2xl font-extrabold text-white mt-1">Today's Menu</h2>
                  <p className="text-gray-400 text-sm mt-1">⚡ Please order before 4:00 PM for timely preparation</p>
                </div>
              </div>

              {/* Evening Combos */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gold text-lg">⚡</span>
                  <h2 className="text-lg font-bold text-white">Evening Combos</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {menu.eveningCombos.filter(i => i.available).map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      qty={cart[item.id] || 0}
                      onAdd={addToCart}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </section>

              {/* Dinner Combos */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🌙</span>
                  <h2 className="text-lg font-bold text-white">Dinner Combos</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {menu.dinnerCombos.filter(i => i.available).map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      qty={cart[item.id] || 0}
                      onAdd={addToCart}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </section>

              {/* A La Carte */}
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">🍽️</span>
                  <h2 className="text-lg font-bold text-white">À La Carte</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {menu.alaCarte.filter(i => i.available).map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      qty={cart[item.id] || 0}
                      onAdd={addToCart}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Details Step */}
          {step === 'details' && (
            <div className="py-6">
              <button onClick={() => setStep('menu')} className="text-gold text-sm mb-4 flex items-center gap-1">
                ← Back to Menu
              </button>
              <h2 className="text-2xl font-extrabold text-white mb-6">Your Details</h2>

              {/* Order Summary */}
              <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-4 mb-6">
                <h3 className="font-bold text-white mb-3">Order Summary</h3>
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-[#2A2A2A] last:border-0">
                    <span className="text-gray-300">{cart[item.id]}× {item.name}</span>
                    <span className="text-white">₹{item.price * cart[item.id]}</span>
                  </div>
                ))}
                {delivery && (
                  <div className="flex justify-between text-sm py-1.5 border-b border-[#2A2A2A]">
                    <span className="text-gray-300">Delivery charge</span>
                    <span className="text-white">₹{DELIVERY_FEE}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold mt-3">
                  <span className="text-white">Total</span>
                  <span className="text-gold text-lg">₹{total}</span>
                </div>
              </div>

              {/* Delivery Toggle */}
              <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-4 mb-6">
                <h3 className="font-bold text-white mb-3">Delivery Option</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDelivery(false)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${!delivery ? 'gold-gradient text-black' : 'bg-[#2A2A2A] text-gray-300'}`}
                  >
                    🚶 Self Pickup
                  </button>
                  <button
                    onClick={() => setDelivery(true)}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition ${delivery ? 'gold-gradient text-black' : 'bg-[#2A2A2A] text-gray-300'}`}
                  >
                    🛵 Delivery +₹{DELIVERY_FEE}
                  </button>
                </div>
                {delivery && (
                  <p className="text-gray-400 text-xs mt-2">Delivered to the Ground Floor of your Block</p>
                )}
              </div>

              {/* Form */}
              <div className="bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-4 mb-6 flex flex-col gap-4">
                <h3 className="font-bold text-white">Contact & Address</h3>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Your Name *</label>
                  <input
                    className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold"
                    placeholder="e.g. Ravi Kumar"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Phone Number *</label>
                  <input
                    className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    type="tel"
                  />
                </div>
                {delivery && (
                  <>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Block / Building *</label>
                      <input
                        className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold"
                        placeholder="e.g. Block A, Tower 3"
                        value={form.block}
                        onChange={e => setForm(f => ({ ...f, block: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Floor / Flat Number *</label>
                      <input
                        className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold"
                        placeholder="e.g. Ground Floor, Flat 101"
                        value={form.floor}
                        onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Special Instructions (optional)</label>
                  <textarea
                    className="w-full bg-[#111] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold resize-none"
                    placeholder="Any allergies or special requests..."
                    rows={2}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={!form.name || !form.phone || (delivery && (!form.block || !form.floor))}
                className="w-full gold-gradient text-black font-bold py-4 rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Place Order · ₹{total}
              </button>
            </div>
          )}
        </main>

        {/* Floating Cart Bar */}
        {cartCount > 0 && step === 'menu' && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#111]/95 backdrop-blur border-t border-[#2A2A2A]">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => setStep('details')}
                className="w-full gold-gradient text-black font-bold py-4 rounded-2xl flex items-center justify-between px-6"
              >
                <span>{cartCount} item{cartCount > 1 ? 's' : ''} in cart</span>
                <span>₹{subtotal} → Proceed</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
