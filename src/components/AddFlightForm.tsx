import React, { useState } from 'react';
import { Plane } from 'lucide-react';
import { useStore } from '../lib/useStore';
import { getTodayDateStr } from '../lib/mockStore';

interface AddFlightFormProps {
  onSuccess: () => void;
}

export default function AddFlightForm({ onSuccess }: AddFlightFormProps) {
  const { addFlight } = useStore();
  const [flightNumber, setFlightNumber] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(getTodayDateStr());
  const [departureTime, setDepartureTime] = useState('');
  const [gate, setGate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNumber || !destination || !departureDate || !departureTime || !gate) return;
    
    setIsSubmitting(true);
    try {
      await addFlight({
        flightNumber: flightNumber.toUpperCase(),
        destination: destination.trim(),
        departureDate,
        departureTime,
        gate: gate.toUpperCase(),
        status: 'Scheduled',
      });
      
      // Reset form
      setFlightNumber('');
      setDestination('');
      setDepartureDate(getTodayDateStr());
      setDepartureTime('');
      setGate('');
      onSuccess();
    } catch (error) {
      console.error("Failed to add flight", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-5 shadow-xs">
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
        <Plane className="w-4 h-4 text-slate-700" />
        <h2 className="text-sm font-bold text-slate-900">
          新規フライト登録
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">便名</label>
            <input 
              type="text" 
              required
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="例: STA-101"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-slate-900 uppercase placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">行先</label>
            <input 
              type="text" 
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="例: 大阪（伊丹）"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-slate-900 placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">出発日</label>
            <input 
              type="date" 
              required
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">出発時刻</label>
            <input 
              type="time" 
              required
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">搭乗口</label>
            <input 
              type="text" 
              required
              value={gate}
              onChange={(e) => setGate(e.target.value)}
              placeholder="例: A1"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-slate-900 uppercase placeholder:text-slate-400"
            />
          </div>

        </div>
        
        <div className="pt-2 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting || !flightNumber || !destination || !departureDate || !departureTime || !gate}
            className="flex items-center space-x-1.5 py-2 px-5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 disabled:text-gray-400 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            <span>{isSubmitting ? '登録中...' : 'フライトを登録する'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
