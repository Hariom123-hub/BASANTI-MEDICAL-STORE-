import React, { useState, useEffect } from 'react';
import { Code, Plus, Trash2, Save } from 'lucide-react';

export default function ApiWebhookManager() {
  const [hooks, setHooks] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newHook, setNewHook] = useState<any>({});

  useEffect(() => {
    fetchHooks();
  }, []);

  const fetchHooks = async () => {
    const res = await fetch('/api/admin/webhooks');
    if (res.ok) setHooks(await res.json());
  };

  const handleSave = async () => {
    await fetch('/api/admin/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({...newHook, isActive: true})
    });
    setIsAdding(false);
    setNewHook({});
    fetchHooks();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/admin/webhooks/' + id, { method: 'DELETE' });
    fetchHooks();
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Code className="w-5 h-5 text-slate-600" /> API & Webhooks
          </h2>
          <p className="text-xs text-slate-500 mt-1">Configure external integrations, payment webhooks, and REST endpoints.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Webhook
        </button>
      </div>

      {isAdding && (
        <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className="p-2 text-sm rounded-lg border" value={newHook.event || ''} onChange={e => setNewHook({...newHook, event: e.target.value})}>
            <option value="">Select Event Trigger</option>
            <option value="order.created">Order Created</option>
            <option value="order.paid">Order Paid (Razorpay)</option>
            <option value="prescription.uploaded">Prescription Uploaded</option>
            <option value="stock.low">Low Stock Alert</option>
          </select>
          <input type="text" placeholder="Webhook URL (https://...)" className="p-2 text-sm rounded-lg border" value={newHook.url || ''} onChange={e => setNewHook({...newHook, url: e.target.value})} />
          <input type="text" placeholder="Secret Key (Optional)" className="p-2 text-sm rounded-lg border md:col-span-2" value={newHook.secret || ''} onChange={e => setNewHook({...newHook, secret: e.target.value})} />
          
          <div className="md:col-span-2 flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-xs font-bold text-white bg-slate-800 rounded-lg flex items-center gap-1"><Save className="w-4 h-4" /> Save</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Event Trigger</th>
              <th className="px-4 py-3">Endpoint URL</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hooks.map(hook => (
              <tr key={hook.id} className="border-b">
                <td className="px-4 py-3 font-bold text-slate-700">{hook.event}</td>
                <td className="px-4 py-3 font-mono text-xs">{hook.url}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(hook.id)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {hooks.length === 0 && (
              <tr><td colSpan={3} className="text-center py-4 text-gray-500">No webhooks configured.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
