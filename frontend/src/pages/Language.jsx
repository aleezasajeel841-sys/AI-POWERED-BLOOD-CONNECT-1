import React, { useEffect, useState } from 'react';

export default function Language() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    const html = document.documentElement;
    if (lang === 'ur') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ur');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
    }
  }, [lang]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Language Settings</h1>
        <p className="text-gray-600 mb-6">Choose your preferred language. Urdu enables RTL layout.</p>
        <div className="flex gap-3">
          <button
            onClick={() => setLang('en')}
            className={`px-4 py-2 rounded-lg border ${lang==='en' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-800'}`}
          >English</button>
          <button
            onClick={() => setLang('ur')}
            className={`px-4 py-2 rounded-lg border ${lang==='ur' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-800'}`}
          >اردو (Urdu)</button>
        </div>
      </div>
    </div>
  );
}
