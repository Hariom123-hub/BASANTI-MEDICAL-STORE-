import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit, Save } from 'lucide-react';
import { Supplier } from '../../types';

export default function SupplierManager() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const res = await fetch('/api/suppliers');
    if (res.ok) setSuppliers(await res.json());
  };

  const handleSave = async () => {
    if (editingId) {
      await fetch('/api/suppliers/' + editingId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier)
      });
      setEditingId(null);
    } else {
      await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...newSupplier, isActive: true, outstandingBalance: 0})
      });
      setIsAdding(false);
    }
    setNewSupplier({});
    fetchSuppliers();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/suppliers/' + id, { method: 'DELETE' });
    fetchSuppliers();
  };

  const startEdit = (supplier: Supplier) => {
    setNewSupplier(supplier);
    setEditingId(supplier.id);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xs mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2">
            <Package className="w-5 h-5" /> Supplier Network
          </h2>
          <p className="text-xs text-indigo-600 mt-1">Manage vendor supply chains and outstanding balances.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setNewSupplier({}); setEditingId(null); }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-purple-50 p-4 rounded-xl mb-6 border border-purple-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Company Name" className="p-2 text-sm rounded-lg border" value={newSupplier.name || ''} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} />
          <input type="text" placeholder="Contact Person" className="p-2 text-sm rounded-lg border" value={newSupplier.contactPerson || ''} onChange={e => setNewSupplier({...newSupplier, contactPerson: e.target.value})} />
          <input type="text" placeholder="Phone" className="p-2 text-sm rounded-lg border" value={newSupplier.phone || ''} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} />
          <input type="text" placeholder="Email" className="p-2 text-sm rounded-lg border" value={newSupplier.email || ''} onChange={e => setNewSupplier({...newSupplier, email: e.target.value})} />
          <input type="text" placeholder="GST Number" className="p-2 text-sm rounded-lg border" value={newSupplier.gstNumber || ''} onChange={e => setNewSupplier({...newSupplier, gstNumber: e.target.value})} />
          <input type="text" placeholder="Address" className="p-2 text-sm rounded-lg border" value={newSupplier.address || ''} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} />
          <div className="md:col-span-2 flex justify-end gap-2">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-xs font-bold text-white bg-green-600 rounded-lg flex items-center gap-1"><Save className="w-4 h-4" /> Save</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Supplier Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">GST Number</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(sup => (
              <tr key={sup.id} className="border-b">
                <td className="px-4 py-3 font-medium text-gray-900">{sup.name}</td>
                <td className="px-4 py-3">{sup.contactPerson} ({sup.phone})</td>
                <td className="px-4 py-3 font-mono text-xs">{sup.gstNumber}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => startEdit(sup)} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(sup.id)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">No suppliers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
