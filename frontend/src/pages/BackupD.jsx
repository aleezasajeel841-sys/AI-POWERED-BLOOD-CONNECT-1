import React, { useEffect, useState } from 'react';

export default function BackupD() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const base = 'http://localhost:3020/api/backup';

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch(base);
      const data = await res.json();
      setBackups(Array.isArray(data?.backups) ? data.backups : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await fetch(base, { method: 'POST' });
      await res.json();
      await fetchBackups();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this backup?')) return;
    setLoading(true);
    try {
      await fetch(`${base}/${id}`, { method: 'DELETE' });
      await fetchBackups();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (id) => {
    window.location.href = `${base}/${id}/download`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Data Backups</h1>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2"
          >{loading ? 'Working...' : 'Create Backup'}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm text-gray-600">Name</th>
                <th className="px-4 py-2 text-left text-sm text-gray-600">Created</th>
                <th className="px-4 py-2 text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {backups.length === 0 && (
                <tr><td className="px-4 py-6 text-gray-500" colSpan="3">No backups found.</td></tr>
              )}
              {backups.map((b) => (
                <tr key={b._id || b.id}>
                  <td className="px-4 py-2">{b.name || b.filename}</td>
                  <td className="px-4 py-2">{new Date(b.createdAt || b.created_on || Date.now()).toLocaleString()}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => handleDownload(b._id || b.id)} className="px-3 py-1 bg-blue-600 text-white rounded">Download</button>
                    <button onClick={() => handleDelete(b._id || b.id)} className="px-3 py-1 bg-gray-700 text-white rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
