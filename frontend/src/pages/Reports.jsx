import React from 'react';

const items = [
  { label: 'Inventory (All)', path: '/api/reports/inventory-report' },
  { label: 'Inventory (Manager)', path: '/api/reports/inventory-report-Manager' },
  { label: 'Health Evaluation (All)', path: '/api/reports/healthEvaluation-report' },
  { label: 'Health Evaluation (Hospital)', path: '/api/reports/healthEvaluation-report-Hospital' },
  { label: 'Appointments', path: '/api/reports/appointment-report' },
  { label: 'System Admin', path: '/api/reports/systemAdmin-report' },
  { label: 'Donors', path: '/api/reports/donor-report' },
  { label: 'Hospitals', path: '/api/reports/hospital-report' },
  { label: 'Emergency Requests', path: '/api/reports/emergency-br-report' },
  { label: 'Hospital Admins', path: '/api/reports/hospitalAdmin-report' },
  { label: 'Feedback', path: '/api/reports/feedback-report' },
  { label: 'Inquiry', path: '/api/reports/inquiry-report' },
];

export default function Reports() {
  const base = 'http://localhost:3020';
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports & Analytics</h1>
        <p className="text-gray-600 mb-6">Click to generate and download reports (PDF/CSV as configured by backend).</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((it) => (
            <a
              key={it.path}
              className="px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-center font-semibold"
              href={`${base}${it.path}`}
            >
              {it.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
