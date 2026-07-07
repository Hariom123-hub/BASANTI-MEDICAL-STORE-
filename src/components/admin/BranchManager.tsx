import React, { useState, useEffect } from 'react';
import { Store, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { Branch } from '../../types';

export default function BranchManager() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBranch, setNewBranch] = useState<Partial<Branch>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    const res = await fetch('/api/branches');
    if (res.ok) setBranches(await res.json());
  };

  const handleSave = async () => {
    if (editingId) {
      await fetch('/api/branches/' + editingId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranch)
      });
      setEditingId(null);
    } else {
      await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...newBranch, isActive: true})
      });
      setIsAdding(false);
    }
    setNewBranch({});
    fetchBranches();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/branches/' + id, { method: 'DELETE' });
    fetchBranches();
  };

  const startEdit = (branch: Branch) => {
    setNewBranch(branch);
    setEditingId(branch.id);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-xs mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2">
            <Store className="w-5 h-5" /> Multi-Branch Setup
          </h2>
          <p className="text-xs text-indigo-600 mt-1">Manage pharmacy branches and sync central inventory.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setNewBranch({}); setEditingId(null); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-indigo-50 p-4 rounded-xl mb-6 border border-indigo-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Branch Name" className="p-2 text-sm rounded-lg border" value={newBranch.name || ''} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
          <input type="text" placeholder="Address" className="p-2 text-sm rounded-lg border" value={newBranch.address || ''} onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
          <input type="text" placeholder="City" className="p-2 text-sm rounded-lg border" value={newBranch.city || ''} onChange={e => setNewBranch({...newBranch, city: e.target.value})} />
          <input type="text" placeholder="State" className="p-2 text-sm rounded-lg border" value={newBranch.state || ''} onChange={e => setNewBranch({...newBranch, state: e.target.value})} />
          <input type="text" placeholder="Pincode" className="p-2 text-sm rounded-lg border" value={newBranch.pincode || ''} onChange={e => setNewBranch({...newBranch, pincode: e.target.value})} />
          <input type="text" placeholder="Phone" className="p-2 text-sm rounded-lg border" value={newBranch.phone || ''} onChange={e => setNewBranch({...newBranch, phone: e.target.value})} />
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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map(branch => (
              <tr key={branch.id} className="border-b">
                <td className="px-4 py-3 font-medium text-gray-900">{branch.name}</td>
                <td className="px-4 py-3">{branch.city}, {branch.state}</td>
                <td className="px-4 py-3">{branch.phone}</td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => startEdit(branch)} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(branch.id)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {branches.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">No branches found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
