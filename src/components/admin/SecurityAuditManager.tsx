import React, { useState, useEffect } from 'react';
import { Shield, Activity as ActivityIcon } from 'lucide-react';

export default function SecurityAuditManager() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const res = await fetch('/api/admin/audit-logs');
    if (res.ok) setLogs(await res.json());
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-xs mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-black text-red-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" /> Security & Audit Logs
          </h2>
          <p className="text-xs text-red-600 mt-1">Monitor system activities, role actions, and critical security events.</p>
        </div>
        <button onClick={fetchLogs} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200">
          Refresh Logs
        </button>
      </div>

      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-2 text-xs font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2 text-xs font-bold">{log.userRole}</td>
                <td className="px-4 py-2 text-xs text-red-700 font-semibold">{log.action}</td>
                <td className="px-4 py-2 text-xs">{log.details}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">No audit logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
