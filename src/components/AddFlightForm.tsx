import React, { useState } from 'react';
import { Plane, Calendar, MapPin, Clock } from 'lucide-react';
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
    <div className="bg-[#11192C] p-6 rounded-xl border border-slate-800 space-y-5">
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <Plane className="w-4 h-4 text-sky-400" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
          新規フライト登録
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-400">便名 (FLIGHT)</label>
            <input 
              type="text" 
              required
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="例: STA-101"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-sky-500 uppercase placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-400">行先 (DESTINATION)</label>
            <input 
              type="text" 
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="例: 大阪（伊丹）"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-400">出発日 (DATE)</label>
            <input 
              type="date" 
              required
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-400">出発時刻 (TIME)</label>
            <input 
              type="time" 
              required
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-400">搭乗口 (GATE)</label>
            <input 
              type="text" 
              required
              value={gate}
              onChange={(e) => setGate(e.target.value)}
              placeholder="例: A1"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-sky-500 uppercase placeholder:text-slate-600"
            />
          </div>

        </div>
        
        <div className="pt-2 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting || !flightNumber || !destination || !departureDate || !departureTime || !gate}
            className="flex items-center space-x-1.5 py-2 px-5 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? '登録中...' : 'フライトを登録する'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
