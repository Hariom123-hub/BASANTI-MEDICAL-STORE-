import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, Edit, Save } from 'lucide-react';
import { DeliveryBoy } from '../../types';

export default function DeliveryBoyManager() {
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBoy, setNewBoy] = useState<Partial<DeliveryBoy>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  const fetchDeliveryBoys = async () => {
    const res = await fetch('/api/delivery-boys');
    if (res.ok) setDeliveryBoys(await res.json());
  };

  const handleSave = async () => {
    if (editingId) {
      await fetch('/api/delivery-boys/' + editingId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBoy)
      });
      setEditingId(null);
    } else {
      await fetch('/api/delivery-boys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newBoy, 
          isAvailable: true, 
          totalDeliveries: 0, 
          totalEarnings: 0, 
          userId: 'usr-' + Date.now(),
          activeZonePincodes: newBoy.activeZonePincodes || []
        })
      });
      setIsAdding(false);
    }
    setNewBoy({});
    fetchDeliveryBoys();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/delivery-boys/' + id, { method: 'DELETE' });
    fetchDeliveryBoys();
  };

  const startEdit = (boy: DeliveryBoy) => {
    setNewBoy(boy);
    setEditingId(boy.id);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xs mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2">
            <Truck className="w-5 h-5" /> Delivery Fleet
          </h2>
          <p className="text-xs text-indigo-600 mt-1">Manage delivery boys and operational zones.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setNewBoy({}); setEditingId(null); }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Delivery Agent
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-green-50 p-4 rounded-xl mb-6 border border-green-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Full Name" className="p-2 text-sm rounded-lg border" value={newBoy.name || ''} onChange={e => setNewBoy({...newBoy, name: e.target.value})} />
          <input type="text" placeholder="Phone" className="p-2 text-sm rounded-lg border" value={newBoy.phone || ''} onChange={e => setNewBoy({...newBoy, phone: e.target.value})} />
          <input type="text" placeholder="Vehicle Number" className="p-2 text-sm rounded-lg border" value={newBoy.vehicleNumber || ''} onChange={e => setNewBoy({...newBoy, vehicleNumber: e.target.value})} />
          <input type="text" placeholder="Driving License" className="p-2 text-sm rounded-lg border" value={newBoy.licenseNumber || ''} onChange={e => setNewBoy({...newBoy, licenseNumber: e.target.value})} />
          <input type="text" placeholder="Zones (comma separated pincodes)" className="p-2 text-sm rounded-lg border md:col-span-2" value={newBoy.activeZonePincodes?.join(', ') || ''} onChange={e => setNewBoy({...newBoy, activeZonePincodes: e.target.value.split(',').map(p => p.trim())})} />
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
              <th className="px-4 py-3">Agent Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Zones</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveryBoys.map(boy => (
              <tr key={boy.id} className="border-b">
                <td className="px-4 py-3 font-medium text-gray-900">{boy.name}</td>
                <td className="px-4 py-3">{boy.phone}</td>
                <td className="px-4 py-3">{boy.vehicleNumber}</td>
                <td className="px-4 py-3 text-xs">{boy.activeZonePincodes.join(', ')}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => startEdit(boy)} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(boy.id)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {deliveryBoys.length === 0 && (
              <tr><td colSpan={5} className="text-center py-4 text-gray-500">No delivery agents found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
