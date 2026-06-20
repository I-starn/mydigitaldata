// src/components/ServiceDetailModal.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceRecord } from '../utils/supabase/client';

interface ModalProps {
  log: ServiceRecord;
  onClose: () => void;
}

export default function ServiceDetailModal({ log, onClose }: ModalProps) {
  
  // Format monetary figures to MWK with commas
  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Format dates cleanly (Commonwealth format: e.g., "19 Jun 2026")
  const formatCalendarDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  // Reusable countdown/deadline calculator
  const getStatus = (nextDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(nextDateStr);
    nextDate.setHours(0, 0, 0, 0);

    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Deadline Exceeded by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`, style: 'text-red-400 bg-red-950/40 border-red-500/30' };
    } else if (diffDays === 0) {
      return { text: 'Deadline Today', style: 'text-yellow-400 bg-yellow-950/40 border-yellow-500/30 font-semibold' };
    } else {
      return { text: `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`, style: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' };
    }
  };

  const profitOrLoss = Number(log.price) - Number(log.cost);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      {/* Dimmed backdrop closer */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      {/* Main Glassmorphic Popup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-2xl glass-panel rounded-2xl relative shadow-neonCyan border border-white/10 overflow-hidden z-10"
      >
        {/* Neon Gradient Header Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-neonCyan via-neonPurple to-neonPink" />

        <div className="p-6 md:p-8 space-y-6">
          {/* Header section */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-neonCyan font-bold bg-neonCyan/10 px-2 py-0.5 rounded-md">
                Service Log Profile
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-2">{log.client_name}</h2>
              <p className="text-xs text-gray-400 mt-1">Contact: {log.client_contact}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: Log info */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Service Performed</h4>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-white font-medium">
                  {log.service_type}
                </div>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Service Date</h4>
                <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm text-gray-300">
                  {formatCalendarDate(log.service_date)}
                </div>
              </div>

              {/* Follow-up / Reminder Panel */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Reminder Status</h4>
                {log.next_service_date ? (
                  <div className="p-3.5 rounded-lg bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Next Service Due:</span>
                      <span className="text-white font-semibold">{formatCalendarDate(log.next_service_date)}</span>
                    </div>
                    {/* Dynamic Countdown Badge */}
                    <div className={`p-2 rounded-md border text-center text-xs font-semibold ${getStatus(log.next_service_date).style}`}>
                      {getStatus(log.next_service_date).text}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-xs text-center text-gray-500 italic">
                    One-time customer (No reminders scheduled)
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Financials */}
            <div className="p-5 rounded-xl bg-black/30 border border-white/5 flex flex-col justify-between h-full">
              <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">Financial Overview</h4>
              
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-sm">
                  <span className="text-gray-400">Charged (Revenue):</span>
                  <span className="font-mono text-neonCyan font-semibold">MWK {formatCurrency(Number(log.price))}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5 text-sm">
                  <span className="text-gray-400">Expense (Cost):</span>
                  <span className="font-mono text-neonPink font-semibold">MWK {formatCurrency(Number(log.cost))}</span>
                </div>
                <div className="flex justify-between items-center py-3 text-sm">
                  <span className="text-gray-300 font-semibold">Net Profit:</span>
                  <span className={`font-mono font-bold text-lg ${profitOrLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {profitOrLoss < 0 ? '-' : ''}MWK {formatCurrency(Math.abs(profitOrLoss))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Large Description Block */}
          {log.description && (
            <div>
              <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">Service Description / Notes</h4>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs md:text-sm text-gray-300 max-h-[120px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {log.description}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}