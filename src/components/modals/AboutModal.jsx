import { useState } from 'react';
import { X } from 'lucide-react';

export default function AboutModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('mission');

  const tabs = [
    { id: 'mission', label: 'Mission' },
    { id: 'dua', label: 'Dua' },
    { id: 'amanahdigital', label: 'AmanahDigital1447' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
        className="bg-brand-surface rounded-3xl shadow-2xl max-w-md w-full p-6 flex flex-col"
        style={{ border: '1px solid var(--border-subtle)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center relative mb-4 flex-shrink-0">
          <h2 id="about-modal-title" className="text-xl font-semibold text-brand-text">About Us</h2>
          <button
            onClick={onClose}
            className="absolute right-0 p-1 rounded-lg hover:bg-brand-elevated transition-all"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${
                activeTab === id ? 'text-brand-text border-b-2 border-brand-gold' : 'hover:text-brand-text'
              }`}
              style={{ color: activeTab === id ? undefined : 'var(--text-muted)' }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="text-sm leading-relaxed space-y-3 overflow-y-auto text-center" style={{ color: 'var(--text-muted)' }}>
          {activeTab === 'mission' && (
            <>
              <p>
                The purpose of this website is to listen to Quran recitation of those who have returned to our Creator, and insha'allah this will be sadaqah jariya for them. May Allah accept their ibadah.
              </p>
              <p className="text-center font-semibold text-brand-text mt-4">
                May Allah accept this as reward for my parents.
              </p>
              <p className="text-center font-semibold text-brand-text">
                In memory of Shiekh Magdi Osman.
              </p>
            </>
          )}
          {activeTab === 'dua' && (
            <p>
              May Allah accept the good deeds of all those who have passed away, and forgive them for their shortcomings. May Allah bless all those who listen to the recitation on this website and bless the reciters with hasant. Ameen
            </p>
          )}
          {activeTab === 'amanahdigital' && (
            <div className="space-y-3">
              <p>
                AmanahDigital creates innovative services and tools designed to strengthen the Ummah's iman and spiritual growth.
              </p>
              <p>
                We make it easier to engage in deen-related activities through simple, accessible, and impactful digital solutions.
              </p>
              <a
                href="https://amanahdigital.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-1 text-brand-gold hover:text-brand-gold-mid underline transition-colors"
              >
                amanahdigital.co.uk
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
