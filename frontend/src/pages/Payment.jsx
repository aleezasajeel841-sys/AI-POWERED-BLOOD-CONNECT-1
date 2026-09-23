import React, { useState } from 'react';
import { apiUrl } from '../config/api.js';

export default function Payment() {
  const [amount, setAmount] = useState('500');
  const [gateway, setGateway] = useState('easypaisa');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDonate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(apiUrl('/api/payment'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), paymentMethod: gateway, purpose: 'Donation' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Payment initiation failed');
      setMessage('Payment initiated. Follow the instructions in the opened window or provided link.');
      if (data?.redirectUrl) window.location.href = data.redirectUrl;
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Donate to Support Camps & Events</h1>
        <form onSubmit={handleDonate} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Amount (PKR)</label>
            <input
              type="number"
              min="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Payment Gateway</label>
            <select
              value={gateway}
              onChange={(e) => setGateway(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="easypaisa">Easypaisa</option>
              <option value="jazzcash">JazzCash</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg py-2"
          >
            {loading ? 'Processing...' : 'Donate Now'}
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
        <p className="mt-6 text-xs text-gray-500">Transactions are processed securely via the selected gateway. We do not store card or wallet credentials.</p>
      </div>
    </div>
  );
}
