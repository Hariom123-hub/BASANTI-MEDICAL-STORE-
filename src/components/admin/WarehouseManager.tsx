import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit, Save } from 'lucide-react';

export default function WarehouseManager() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newWh, setNewWh] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    const res = await fetch('/api/warehouses');
    if (res.ok) setWarehouses(await res.json());
  };

  const handleSave = async () => {
    if (editingId) {
      await fetch('/api/warehouses/' + editingId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWh)
      });
      setEditingId(null);
    } else {
      await fetch('/api/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...newWh, isActive: true})
      });
      setIsAdding(false);
    }
    setNewWh({});
    fetchWarehouses();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/warehouses/' + id, { method: 'DELETE' });
    fetchWarehouses();
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-xs mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black text-teal-900 flex items-center gap-2">
            <Layers className="w-5 h-5" /> Warehouse Management
          </h2>
          <p className="text-xs text-teal-600 mt-1">Manage multiple warehouse locations and stock transfers.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setNewWh({}); setEditingId(null); }}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Warehouse
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-teal-50 p-4 rounded-xl mb-6 border border-teal-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Warehouse Name" className="p-2 text-sm rounded-lg border" value={newWh.name || ''} onChange={e => setNewWh({...newWh, name: e.target.value})} />
          <input type="text" placeholder="Location/Address" className="p-2 text-sm rounded-lg border" value={newWh.location || ''} onChange={e => setNewWh({...newWh, location: e.target.value})} />
          <input type="text" placeholder="Manager Name" className="p-2 text-sm rounded-lg border" value={newWh.managerId || ''} onChange={e => setNewWh({...newWh, managerId: e.target.value})} />
          
          <div className="md:col-span-2 flex justify-end gap-2">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border rounded-lg">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 text-xs font-bold text-white bg-teal-600 rounded-lg flex items-center gap-1"><Save className="w-4 h-4" /> Save</button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Warehouse Name</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Manager</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map(wh => (
              <tr key={wh.id} className="border-b">
                <td className="px-4 py-3 font-medium text-gray-900">{wh.name}</td>
                <td className="px-4 py-3">{wh.location}</td>
                <td className="px-4 py-3">{wh.managerId}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => { setNewWh(wh); setEditingId(wh.id); }} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(wh.id)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {warehouses.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">No warehouses configured.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
