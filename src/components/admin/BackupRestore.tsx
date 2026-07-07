import React, { useState } from 'react';
import { Database, Download, UploadCloud, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

export default function BackupRestore() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [status, setStatus] = useState<{type: 'success'|'error', msg: string}|null>(null);

  const handleBackup = async () => {
    setIsBackingUp(true);
    setStatus(null);
    try {
      const res = await fetch('/api/admin/backup');
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `partha-pharmacy-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus({ type: 'success', msg: 'Backup downloaded successfully.' });
    } catch (e) {
      setStatus({ type: 'error', msg: String(e) });
    }
    setIsBackingUp(false);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setStatus(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        const res = await fetch('/api/admin/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json)
        });
        if (res.ok) {
          setStatus({ type: 'success', msg: 'Database restored successfully! Refresh the page.' });
        } else {
          setStatus({ type: 'error', msg: 'Restore failed. Invalid format.' });
        }
      } catch (err) {
        setStatus({ type: 'error', msg: 'Invalid JSON file.' });
      }
      setIsRestoring(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" /> Database Backup & Restore
          </h2>
          <p className="text-xs text-slate-500 mt-1">Export full system state or restore from a previous backup file.</p>
        </div>
      </div>

      {status && (
        <div className={`p-3 rounded-lg mb-4 text-xs font-bold flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {status.msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-blue-100 bg-blue-50/30 p-5 rounded-xl text-center">
          <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 mb-1">Create Full Backup</h3>
          <p className="text-xs text-slate-500 mb-4">Download a complete snapshot of all products, users, orders, and configurations.</p>
          <button 
            onClick={handleBackup}
            disabled={isBackingUp}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download JSON Backup
          </button>
        </div>

        <div className="border border-amber-100 bg-amber-50/30 p-5 rounded-xl text-center">
          <UploadCloud className="w-8 h-8 text-amber-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 mb-1">Restore System</h3>
          <p className="text-xs text-slate-500 mb-4">Upload a JSON backup file to overwrite current database. Warning: Irreversible.</p>
          <label className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer">
            {isRestoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            Select Backup File
            <input type="file" accept=".json" className="hidden" onChange={handleRestore} disabled={isRestoring} />
          </label>
        </div>
      </div>
    </div>
  );
}
