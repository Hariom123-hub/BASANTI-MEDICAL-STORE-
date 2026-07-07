import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Trash2, Check } from 'lucide-react';

export default function PurchaseOrderManager() {
  const [pos, setPos] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPo, setNewPo] = useState<any>({});

  useEffect(() => {
    fetchPos();
  }, []);

  const fetchPos = async () => {
    const res = await fetch('/api/purchase-orders');
    if (res.ok) setPos(await res.json());
  };

  const handleSave = async () => {
    await fetch('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({...newPo, status: "SENT", paymentStatus: "PENDING"})
    });
    setIsAdding(false);
    setNewPo({});
    fetchPos();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/purchase-orders/' + id, { method: 'DELETE' });
    fetchPos();
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-xs mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black text-orange-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-600" /> Purchase Orders
          </h2>
          <p className="text-xs text-orange-600 mt-1">Manage vendor POs and inventory receiving workflows.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create PO
        </button>
      </div>

      {isAdding && (
        <div className="bg-orange-50 p-4 rounded-xl mb-6 border border-orange-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Supplier ID/Name" className="p-2 text-sm rounded-lg border" value={newPo.supplierId || ''} onChange={e => setNewPo({...newPo, supplierId: e.target.value})} />
          <input type="text" placeholder="Warehouse ID" className="p-2 text-sm rounded-lg border" value={newPo.warehouseId || ''} onChange={e => setNewPo({...newPo, warehouseId: e.target.value})} />
          <input type="number" placeholder="Total Amount (₹)" className="p-2 text-sm rounded-lg border" value={newPo.totalAmount || ''} onChange={e => setNewPo({...newPo, totalAmount: parseInt(e.target.value)})} />
          
          <div className="md:col-span-2 flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-xs font-bold text-white bg-orange-600 rounded-lg flex items-center gap-1"><Check className="w-4 h-4" /> Submit PO</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">PO ID</th>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pos.map(po => (
              <tr key={po.id} className="border-b">
                <td className="px-4 py-3 font-mono text-xs">{po.id}</td>
                <td className="px-4 py-3 font-bold">{po.supplierId}</td>
                <td className="px-4 py-3 text-green-700 font-bold">₹{po.totalAmount}</td>
                <td className="px-4 py-3 text-xs font-bold">{po.status}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(po.id)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {pos.length === 0 && (
              <tr><td colSpan={5} className="text-center py-4 text-gray-500">No purchase orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
