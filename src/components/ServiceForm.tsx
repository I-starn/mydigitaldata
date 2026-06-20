// src/components/ServiceForm.tsx
'use client';
import { useState } from 'react';
// Corrected import path below:
import { ServiceRecord } from '../utils/supabase/client';

interface FormProps {
  onAdd: (record: Omit<ServiceRecord, 'user_id'>) => void;
  onClose: () => void;
}

export default function ServiceForm({ onAdd, onClose }: FormProps) {
  const [clientName, setClientName] = useState('');
  const [contact, setContact] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  
  // Explicit transaction date selection
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Reminder settings
  const [reminderOption, setReminderOption] = useState<'set' | 'never'>('set');
  const [daysToNext, setDaysToNext] = useState('90');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the explicitly selected service date
    const selectedDate = new Date(serviceDate);
    selectedDate.setHours(12, 0, 0, 0); // Normalize time to avoid timezone offset issues

    let nextServiceDate: string | null = null;
    if (reminderOption === 'set') {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(selectedDate.getDate() + parseInt(daysToNext || '0'));
      nextServiceDate = nextDate.toISOString();
    }

    onAdd({
      client_name: clientName,
      client_contact: contact,
      service_type: serviceType,
      description: desc,
      price: parseFloat(price) || 0,
      cost: parseFloat(cost) || 0,
      service_date: selectedDate.toISOString(),
      next_service_date: nextServiceDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg glass-panel p-6 rounded-2xl relative shadow-neonPink border border-white/10">
        <h3 className="text-xl font-bold text-white mb-4">Log New Service Record</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Client Name</label>
              <input type="text" required className="w-full p-2 rounded-lg glass-input text-sm" value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Contact Details</label>
              <input type="text" required className="w-full p-2 rounded-lg glass-input text-sm" value={contact} onChange={e => setContact(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Service Type</label>
              <input type="text" required className="w-full p-2 rounded-lg glass-input text-sm" value={serviceType} onChange={e => setServiceType(e.target.value)} />
            </div>
            {/* Explicit date configuration */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Service Date (Required)</label>
              <input 
                type="date" 
                required 
                className="w-full p-2 rounded-lg glass-input text-sm cursor-pointer" 
                value={serviceDate} 
                onChange={e => setServiceDate(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Service Reminder</label>
              <select 
                className="w-full p-2 rounded-lg glass-input text-sm cursor-pointer"
                value={reminderOption}
                onChange={e => setReminderOption(e.target.value as 'set' | 'never')}
              >
                <option value="set" className="bg-darkBg text-white">Set Reminder Interval</option>
                <option value="never" className="bg-darkBg text-white">Never (One-time customer)</option>
              </select>
            </div>
            {reminderOption === 'set' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Next Service In (Days)</label>
                <input 
                  type="number" 
                  required 
                  className="w-full p-2 rounded-lg glass-input text-sm" 
                  value={daysToNext} 
                  onChange={e => setDaysToNext(e.target.value)} 
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea className="w-full p-2 rounded-lg glass-input text-sm h-16" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Charged Price (Revenue)</label>
              <input type="number" step="0.01" required className="w-full p-2 rounded-lg glass-input text-sm" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Cost incurred (Expense)</label>
              <input type="number" step="0.01" required className="w-full p-2 rounded-lg glass-input text-sm" value={cost} onChange={e => setCost(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white cursor-pointer">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-neonCyan to-neonPink text-white shadow-neonCyan cursor-pointer">Save Service</button>
          </div>
        </form>
      </div>
    </div>
  );
}