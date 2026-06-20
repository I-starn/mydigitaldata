// src/components/RemindersList.tsx
'use client';
import { ServiceRecord } from '../utils/supabase/client';

export default function RemindersList({ services }: { services: ServiceRecord[] }) {
  
  // Updated Date Formatter to use standard Commonwealth format (e.g., "24 Oct 2026")
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

  const getStatus = (nextDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = new Date(nextDateStr);
    nextDate.setHours(0, 0, 0, 0);

    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Exceeded by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`, style: 'text-red-400 bg-red-950/40 border-red-500/30' };
    } else if (diffDays === 0) {
      return { text: 'Deadline Today', style: 'text-yellow-400 bg-yellow-950/40 border-yellow-500/30 font-semibold' };
    } else {
      return { text: `${diffDays} day${diffDays > 1 ? 's' : ''} remaining`, style: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30' };
    }
  };

  // 1. Filter out services that do not have a next service date configured (Never)
  const activeReminders = services.filter((s): s is ServiceRecord & { next_service_date: string } => 
    s.next_service_date !== null && s.next_service_date !== undefined && s.next_service_date !== ''
  );

  // 2. Sort active reminders chronologically (nearest deadline first)
  const sortedReminders = [...activeReminders].sort((a, b) => 
    new Date(a.next_service_date).getTime() - new Date(b.next_service_date).getTime()
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">Service Reminders</h3>
      {sortedReminders.length === 0 ? (
        <p className="text-gray-500 text-sm">No scheduled follow-up visits logged.</p>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {sortedReminders.map((service, index) => {
            const status = getStatus(service.next_service_date);
            return (
              <div 
                key={service.id || index} 
                className="flex items-center justify-between p-3 rounded-lg glass-panel text-xs md:text-sm animate-fade-in gap-2"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-white truncate">{service.client_name}</h4>
                  <p className="text-gray-400 text-[11px] truncate">{service.client_contact} • {service.service_type}</p>
                  
                  {/* Explicit Calendar Target Date (Commonwealth Format) */}
                  <p className="text-neonCyan text-[11px] mt-1 font-semibold tracking-wide">
                    Next Due: {formatCalendarDate(service.next_service_date)}
                  </p>
                </div>
                
                {/* Status Countdown Badge */}
                <div className={`px-2.5 py-1 rounded-md border text-xs whitespace-nowrap ${status.style}`}>
                  {status.text}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}