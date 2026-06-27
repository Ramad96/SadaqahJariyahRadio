import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function CommunityModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('upload');
  const [contentHeight, setContentHeight] = useState(0);
  const [feedbackForm, setFeedbackForm] = useState({ subject: '', message: '' });

  const uploadRef = useRef(null);
  const feedbackRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const uploadHeight = uploadRef.current?.scrollHeight || 0;
      const feedbackHeight = feedbackRef.current?.scrollHeight || 0;
      const maxHeight = Math.max(uploadHeight, feedbackHeight);
      if (maxHeight > 0) setContentHeight(maxHeight);
    }
  }, [feedbackForm]);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(feedbackForm.subject || 'Website Feedback');
    const body = encodeURIComponent(
      `Subject: ${feedbackForm.subject || 'Website Feedback'}\n\nMessage:\n${feedbackForm.message}`
    );
    window.location.href = `mailto:amanahdigital1447@gmail.com?subject=${subject}&body=${body}`;
  };

  const tabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'feedback', label: 'Feedback' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="community-modal-title"
        className="bg-brand-surface rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] p-6 flex flex-col"
        style={{ border: '1px solid var(--border-subtle)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center relative mb-4 flex-shrink-0">
          <h2 id="community-modal-title" className="text-xl font-semibold text-brand-text">Community</h2>
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

        <div
          ref={containerRef}
          className="text-sm leading-relaxed space-y-3 overflow-y-auto relative text-center"
          style={{ minHeight: contentHeight > 0 ? `${contentHeight}px` : 'auto', color: 'var(--text-muted)' }}
        >
          {/* Hidden clones for height measurement */}
          <div ref={uploadRef} className="absolute opacity-0 pointer-events-none invisible">
            <p>
              If you have a recording of a person who has passed away and would like to include it on this website please contact <span className="font-bold text-brand-text">amanahdigital1447@gmail.com</span>
            </p>
          </div>
          <div ref={feedbackRef} className="absolute opacity-0 pointer-events-none invisible">
            <div>
              <h3 className="text-brand-text font-semibold mb-3">Feedback</h3>
              <p className="mb-4">If you encounter any issues with the website or have feedback, please fill out the form below.</p>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-2">Subject</label>
                  <input type="text" className="w-full px-3 py-2 bg-brand-elevated rounded-lg text-brand-text" style={{ border: '1px solid var(--border-subtle)' }} placeholder="Brief description of the issue" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text mb-2">Message</label>
                  <textarea rows={5} className="w-full px-3 py-2 bg-brand-elevated rounded-lg text-brand-text resize-none" style={{ border: '1px solid var(--border-subtle)' }} placeholder="Please describe the issue..." />
                </div>
                <button type="submit" className="w-full px-4 py-2 bg-brand-gold text-brand-void font-medium rounded-lg">Send Feedback</button>
              </form>
            </div>
          </div>

          {activeTab === 'upload' && (
            <p>
              If you have a recording of a person who has passed away and would like to include it on this website please contact <span className="font-bold text-brand-text">amanahdigital1447@gmail.com</span>
            </p>
          )}

          {activeTab === 'feedback' && (
            <div>
              <h3 className="text-brand-text font-semibold mb-3">Feedback</h3>
              <p className="mb-4">
                If you encounter any issues with the website or have feedback, please fill out the form below. This will open your email client to send a message to us.
              </p>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label htmlFor="feedback-subject" className="block text-sm font-medium text-brand-text mb-2">Subject</label>
                  <input
                    type="text"
                    id="feedback-subject"
                    value={feedbackForm.subject}
                    onChange={(e) => setFeedbackForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-3 py-2 bg-brand-elevated rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    style={{ border: '1px solid var(--border-subtle)' }}
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div>
                  <label htmlFor="feedback-message" className="block text-sm font-medium text-brand-text mb-2">Message</label>
                  <textarea
                    id="feedback-message"
                    rows={5}
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full px-3 py-2 bg-brand-elevated rounded-lg text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none"
                    style={{ border: '1px solid var(--border-subtle)' }}
                    placeholder="Please describe the issue or provide your feedback..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-brand-gold hover:bg-brand-gold-mid text-brand-void font-medium rounded-lg transition-all"
                >
                  Send Feedback
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
