// src/components/Dashboard.tsx
'use client';
import { useState, useEffect } from 'react';
import { createClient, isSupabaseConfigured, ServiceRecord } from '../utils/supabase/client';
import { getCachedServices, setCachedServices, fetchAndSyncServices } from '../app/lib/sync';
import AnalyticsChart from './AnalyticsChart';
import RemindersList from './RemindersList';
import ServiceForm from './ServiceForm';
import { motion } from 'framer-motion';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Dashboard({ session }: { session: any }) {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const user = session.user;

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth());

  // Initialize the browser-based supabase client
  const supabase = createClient();

  useEffect(() => {
    const cached = getCachedServices();
    if (cached.length) setServices(cached);

    const sync = async () => {
      const liveData = await fetchAndSyncServices(user.id);
      setServices(liveData);
    };
    sync();
  }, [user.id]);

  const addService = async (newRecord: Omit<ServiceRecord, 'user_id'>) => {
    const localId = typeof window !== 'undefined' && window.crypto?.randomUUID 
      ? window.crypto.randomUUID() 
      : `local-${Date.now()}`;

    const fullRecord = { ...newRecord, user_id: user.id, id: localId };
    
    const updatedLocal = [fullRecord, ...services];
    setServices(updatedLocal);
    setCachedServices(updatedLocal);

    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          client_name: newRecord.client_name,
          client_contact: newRecord.client_contact,
          service_type: newRecord.service_type,
          description: newRecord.description,
          price: newRecord.price,
          cost: newRecord.cost,
          service_date: newRecord.service_date,
          next_service_date: newRecord.next_service_date,
          user_id: user.id
        }])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        const updatedWithDbId = updatedLocal.map(item => 
          item.id === localId ? data[0] : item
        );
        setServices(updatedWithDbId);
        setCachedServices(updatedWithDbId);
      }
    } catch (err) {
      console.error('Failed to upload service database entry:', err);
    }
  };

  const deleteService = async (id: string) => {
    const updatedLocal = services.filter(s => s.id !== id);
    setServices(updatedLocal);
    setCachedServices(updatedLocal);

    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to delete service entry from Supabase:', err);
    }
  };

  // Filter service array based on year and selected month
  const filteredData = services.filter(s => {
    const serviceDate = new Date(s.service_date);
    const matchesYear = serviceDate.getFullYear() === selectedYear;
    const matchesMonth = selectedMonth === 'all' || serviceDate.getMonth() === selectedMonth;
    return matchesYear && matchesMonth;
  });

  const totalRevenue = filteredData.reduce((acc, curr) => acc + Number(curr.price), 0);
  const totalCost = filteredData.reduce((acc, curr) => acc + Number(curr.cost), 0);
  const profitOrLoss = totalRevenue - totalCost;

  // Helper function to format large amounts into readable comma-spaced strings
  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Garage Dashboard</h1>
          <p className="text-gray-400 text-sm">Real-time revenue, profit & service reminders</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsOpenForm(true)}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-neonCyan to-neonPink text-white font-semibold text-sm transition shadow-neonCyan cursor-pointer"
          >
            + Log Service
          </button>
        </div>
      </div>

      {/* Modern Filter Board */}
      <div className="glass-panel p-4 rounded-2xl mb-8 border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="text-sm font-semibold tracking-wide text-white uppercase">
            Data Filters: {selectedMonth === 'all' ? `Whole Year ${selectedYear}` : `${MONTHS[selectedMonth]} ${selectedYear}`}
          </div>
          
          {/* Year Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Select Year:</span>
            <select
              className="p-1.5 rounded-lg glass-input text-xs cursor-pointer"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[selectedYear + 1, selectedYear, selectedYear - 1, selectedYear - 2].map(y => (
                <option key={y} value={y} className="bg-darkBg text-white">{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Month Selector Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-13 gap-1.5">
          <button
            onClick={() => setSelectedMonth('all')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
              selectedMonth === 'all' ? 'bg-gradient-to-r from-neonCyan to-neonPurple text-white shadow-neonCyan' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            Whole Year
          </button>
          {MONTHS.map((m, index) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(index)}
              className={`px-2 py-2 rounded-lg text-xs transition cursor-pointer text-center truncate ${
                selectedMonth === index ? 'bg-white/10 text-neonCyan border border-neonCyan/30' : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              {m.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Revenue Metric */}
        <motion.div whileHover={{ y: -2 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-neonCyan" />
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Revenue</p>
          <p className="text-2xl font-bold text-white mt-1">MWK {formatCurrency(totalRevenue)}</p>
        </motion.div>

        {/* Total Cost Metric */}
        <motion.div whileHover={{ y: -2 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-neonPink" />
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Total Costs</p>
          <p className="text-2xl font-bold text-white mt-1">MWK {formatCurrency(totalCost)}</p>
        </motion.div>

        {/* Net Profit Metric */}
        <motion.div whileHover={{ y: -2 }} className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-neonPurple" />
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Net Profit / Loss</p>
          <p className={`text-2xl font-bold mt-1 ${profitOrLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {profitOrLoss < 0 ? '-' : ''}MWK {formatCurrency(Math.abs(profitOrLoss))}
          </p>
        </motion.div>
      </div>

      {/* Main Board Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <AnalyticsChart services={filteredData} filter={selectedMonth === 'all' ? 'year' : 'month'} />
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <RemindersList services={services} />
        </div>
      </div>

      {/* Recent Activity Table with Delete Capability */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Recent Services Logged</h3>
        {filteredData.length === 0 ? (
          <p className="text-gray-500 text-sm">No recorded service items match your current filter selection.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-400">
                  <th className="py-2">Client</th>
                  <th className="py-2">Service Type</th>
                  <th className="py-2">Date</th>
                  <th className="py-2 text-right">Revenue</th>
                  <th className="py-2 text-right">Cost</th>
                  <th className="py-2 text-center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, i) => (
                  <tr key={item.id || i} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="py-3 col-span-1">
                      <div className="font-semibold text-white">{item.client_name}</div>
                      <div className="text-[10px] text-gray-400">{item.client_contact}</div>
                    </td>
                    <td className="py-3 text-gray-300">
                      <div>{item.service_type}</div>
                      {item.description && <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{item.description}</div>}
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(item.service_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3 text-right text-neonCyan font-mono font-semibold">MWK {formatCurrency(Number(item.price))}</td>
                    <td className="py-3 text-right text-neonPink font-mono font-semibold">MWK {formatCurrency(Number(item.cost))}</td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => deleteService(item.id!)}
                        className="text-red-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition cursor-pointer"
                        title="Delete log"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mx-auto">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Overlay */}
      {isOpenForm && (
        <ServiceForm 
          onAdd={addService}
          onClose={() => setIsOpenForm(false)}
        />
      )}
    </div>
  );
}