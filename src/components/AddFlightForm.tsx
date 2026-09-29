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
        destination: destination.toUpperCase(),
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
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Plane className="w-5 h-5 text-blue-600" />
        <span>新規フライト登録（日時指定）</span>
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">便名</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Plane className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                required
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="例: FA-101"
                className="w-full pl-10 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder:text-gray-400 placeholder:normal-case"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">行先</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="例: 大阪（伊丹）"
                className="w-full pl-10 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">出発日</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="date" 
                required
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full pl-10 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">出発時刻</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="time" 
                required
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full pl-10 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700">搭乗口（ゲート）</label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                required
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                placeholder="例: A1, B3"
                className="w-full pl-10 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder:text-gray-400 placeholder:normal-case"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-2 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting || !flightNumber || !destination || !departureDate || !departureTime || !gate}
            className="flex justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? '登録中...' : 'フライトを登録する'}
          </button>
        </div>
      </form>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800">
        <p><strong>注記:</strong> フライトを登録すると、指定された日付・時刻の便として運行され、自動的に24席分（1A〜6D）の空席データが生成されます。</p>
      </div>
    </div>
  );
}
