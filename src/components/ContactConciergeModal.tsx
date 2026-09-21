import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Accessory } from '../types';

interface ContactConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAccessory?: Accessory | null;
}

export const ContactConciergeModal: React.FC<ContactConciergeModalProps> = ({
  isOpen,
  onClose,
  preselectedAccessory,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(
    preselectedAccessory
      ? `Hello, I would like to inquire about ${preselectedAccessory.name} and request styling details.`
      : ''
  );
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setMessage('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#332B2B]/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#F8F2EC] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 border border-[#E8DFD5] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-concierge-modal-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2.5 text-[#736767] hover:text-[#332B2B] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close form"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-10 h-10 border border-[#332B2B] flex items-center justify-center mx-auto text-[#332B2B]">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#332B2B] font-light">
              Inquiry Received
            </h3>
            <p className="text-sm text-[#736767] max-w-sm mx-auto leading-relaxed font-sans">
              Thank you, {name || 'esteemed guest'}. Our stylist team will review your inquiry and respond within 24 hours.
            </p>
            <div className="pt-4">
              <button
                id="concierge-done-btn"
                onClick={handleReset}
                className="px-8 py-3 border border-[#332B2B] text-[#332B2B] hover:bg-[#332B2B] hover:text-[#F8F2EC] text-[10px] tracking-[0.22em] uppercase transition-colors"
              >
                Return to Showcase
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <span className="text-[10px] tracking-[0.26em] uppercase text-[#736767] font-medium block mb-2">
                SIGNORA BLOOM
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-[#332B2B] font-light">
                Signora Bloom Inquiries & Customer Care
              </h3>
              <p className="text-xs text-[#736767] mt-2 font-sans">
                Connect with our team regarding collection details, styling questions, or order inquiries.
              </p>
            </div>

            {preselectedAccessory && (
              <div className="mb-6 p-3 bg-[#FAF6F1] border border-[#E8DFD5] flex items-center gap-3">
                <img
                  src={preselectedAccessory.image}
                  alt={preselectedAccessory.name}
                  className="w-12 h-12 object-cover border border-[#E8DFD5]"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[9px] uppercase tracking-wider text-[#736767] block">Inquiring Regarding:</span>
                  <span className="font-serif text-sm font-medium text-[#332B2B] truncate block">{preselectedAccessory.name}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#736767] font-medium mb-1">
                  Name *
                </label>
                <input
                  id="concierge-input-name"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF6F1] border border-[#E8DFD5] text-xs text-[#332B2B] placeholder:text-[#998D8D] focus:outline-none focus:border-[#332B2B]"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#736767] font-medium mb-1">
                  Email *
                </label>
                <input
                  id="concierge-input-email"
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF6F1] border border-[#E8DFD5] text-xs text-[#332B2B] placeholder:text-[#998D8D] focus:outline-none focus:border-[#332B2B]"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-[#736767] font-medium mb-1">
                  Message
                </label>
                <textarea
                  id="concierge-input-message"
                  rows={3}
                  placeholder="Share your inquiry or styling questions..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF6F1] border border-[#E8DFD5] text-xs text-[#332B2B] placeholder:text-[#998D8D] focus:outline-none focus:border-[#332B2B] resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  id="concierge-submit-btn"
                  type="submit"
                  className="w-full py-3.5 bg-[#332B2B] text-[#F8F2EC] hover:bg-[#524747] text-[11px] tracking-[0.24em] uppercase font-medium transition-colors cursor-pointer"
                >
                  Send Inquiry
                </button>
              </div>

              <div className="text-[10px] text-center text-[#8E8080] pt-1">
                Discreet · Strictly confidential · No marketing distribution
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
