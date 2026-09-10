import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Scale, Lock, BookOpen, Printer } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'honor';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="legal-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div className="bg-[#FDFCF8] border border-[#E5E4E2] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_20px_50px_rgba(27,28,28,0.15)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E5E4E2] flex items-center justify-between bg-[#F9F7F1]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D9E6DC] text-[#3E4942] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-lg font-bold text-[#1b1c1c] leading-tight">
                Academic Sanctuary Legal & Trust
              </h2>
              <p className="text-xs text-[#737874]">
                Effective Date: September 2024 • Academic Cohort Governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="legal-print-button"
              onClick={handlePrint}
              title="Print Document"
              className="p-2 text-[#737874] hover:text-[#1b1c1c] hover:bg-[#EAE8E7] rounded-lg transition-colors cursor-pointer"
              aria-label="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              id="legal-close-button"
              onClick={onClose}
              className="p-2 text-[#737874] hover:text-[#1b1c1c] hover:bg-[#EAE8E7] rounded-lg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E5E4E2] bg-[#FDFCF8] px-6 gap-2 pt-2">
          <button
            id="tab-terms-of-service"
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#56615a] text-[#1b1c1c]'
                : 'border-transparent text-[#737874] hover:text-[#1b1c1c]'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>
          <button
            id="tab-privacy-policy"
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#56615a] text-[#1b1c1c]'
                : 'border-transparent text-[#737874] hover:text-[#1b1c1c]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
          <button
            id="tab-academic-integrity"
            onClick={() => setActiveTab('honor')}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'honor'
                ? 'border-[#56615a] text-[#1b1c1c]'
                : 'border-transparent text-[#737874] hover:text-[#1b1c1c]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Honor Code & Fair Use</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-[#434844] text-sm leading-relaxed">
          {activeTab === 'terms' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="text-xs font-semibold text-[#56615a] tracking-wider uppercase">Agreement</span>
                <h3 className="text-xl font-bold text-[#1b1c1c] mt-0.5 mb-2">Terms of Service</h3>
                <p>
                  Welcome to <strong>Academic Sanctuary</strong>. By creating an account, joining a cohort classroom, uploading course notes, or accessing academic resources on our platform, you agree to comply with and be bound by these Terms of Service.
                </p>
              </div>

              <section className="bg-[#F9F7F1] p-4 rounded-xl border border-[#E5E4E2] space-y-2">
                <h4 className="font-bold text-[#1b1c1c] flex items-center gap-1.5 text-sm">
                  <FileText className="w-4 h-4 text-[#56615a]" />
                  1. Purpose & Cohort Boundary
                </h4>
                <p className="text-xs md:text-sm">
                  Academic Sanctuary is designed exclusively as a collaborative educational sanctuary for verified university cohorts, classes, and academic departments.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-[#1b1c1c]">2. Student-Contributed Content & Intellectual Property</h4>
                <p>
                  Students and moderators retain ownership of their personal study summaries, handwritten lecture annotations, and original notes uploaded to Academic Sanctuary.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-[#1b1c1c]">3. Moderation & Administrative Roles</h4>
                <p>
                  Each classroom is governed by designated Super Admins and Admins who hold permissions to curate materials, approve enrollments, and preserve academic integrity.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="text-xs font-semibold text-[#56615a] tracking-wider uppercase">Privacy & Data Governance</span>
                <h3 className="text-xl font-bold text-[#1b1c1c] mt-0.5 mb-2">Privacy Policy</h3>
                <p>
                  At <strong>Academic Sanctuary</strong>, we recognize the sensitivity of student records, academic conversations, and peer study materials.
                </p>
              </div>

              <section className="bg-[#F9F7F1] p-4 rounded-xl border border-[#E5E4E2] space-y-2">
                <h4 className="font-bold text-[#1b1c1c] flex items-center gap-1.5 text-sm">
                  <Lock className="w-4 h-4 text-[#56615a]" />
                  Zero Third-Party Advertising Policy
                </h4>
                <p className="text-xs md:text-sm">
                  We never sell, rent, or monetize your academic activity, student profiles, notes, or messages to third-party ad networks.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'honor' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <span className="text-xs font-semibold text-[#56615a] tracking-wider uppercase">Academic Integrity</span>
                <h3 className="text-xl font-bold text-[#1b1c1c] mt-0.5 mb-2">Honor Code & Fair Use Policy</h3>
                <p>
                  Academic Sanctuary thrives on mutual trust, scholarly ethics, and supportive peer teamwork.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E4E2] bg-[#F9F7F1] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-[#737874]">
            Academic Sanctuary • Open Academic Standards
          </div>
          <button
            id="legal-understood-button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#56615a] hover:bg-[#434d46] text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};
