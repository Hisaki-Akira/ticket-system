import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/useStore';
import { Plane, Clock } from 'lucide-react';

export default function DepartureBoard() {
  const { flights, tickets, isFirebaseConfigured } = useStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Boarding': return 'text-green-700 bg-green-50 border-green-200';
      case 'Departed': return 'text-gray-500 bg-gray-50 border-gray-200';
      case 'Delayed': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  const statusMap: Record<string, string> = {
    'Scheduled': '定刻',
    'Boarding': '搭乗中',
    'Departed': '出発済',
    'Delayed': '遅延'
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans pb-12">
      {/* Corporate Header */}
      <div className="bg-blue-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="bg-white p-2 rounded-lg">
              <Plane className="w-8 h-8 text-blue-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">出発案内</h1>
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mt-1">第1ターミナル • 国際線</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2 text-2xl font-bold font-mono tracking-wider">
              <Clock className="w-5 h-5 text-blue-300" />
              <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
            <p className="text-blue-200 text-sm mt-1">現在時刻</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Board */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 bg-gray-50 text-gray-500 px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
            <div className="col-span-2">時刻</div>
            <div className="col-span-3">行先</div>
            <div className="col-span-2">便名</div>
            <div className="col-span-1 text-center">搭乗口</div>
            <div className="col-span-2 text-center">搭乗率</div>
            <div className="col-span-2 text-right">状況</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {[...flights]
              .sort((a, b) => {
                if (a.status === 'Departed' && b.status !== 'Departed') return 1;
                if (a.status !== 'Departed' && b.status === 'Departed') return -1;
                return a.departureTime.localeCompare(b.departureTime);
              })
              .map(flight => {
              const flightTickets = tickets.filter(t => t.flightId === flight.id);
              const loadPercentage = flight.totalSeats > 0 ? Math.round((flightTickets.length / flight.totalSeats) * 100) : 0;
              
              return (
                <div key={flight.id} className="flex flex-col md:grid md:grid-cols-12 gap-0 md:gap-4 px-6 py-5 md:items-center hover:bg-gray-50 transition-colors">
                  
                  {/* Time & Status (Mobile Top Row) */}
                  <div className="flex justify-between items-center md:contents">
                    <div className="md:col-span-2 text-2xl md:text-xl font-bold text-gray-900 font-mono md:order-1">
                      {flight.departureTime}
                    </div>
                    <div className="md:col-span-2 flex md:justify-end md:order-6">
                      <span className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wide border ${getStatusStyle(flight.status)}`}>
                        {statusMap[flight.status] || flight.status}
                      </span>
                    </div>
                  </div>

                  {/* Destination & Flight Number */}
                  <div className="flex flex-col md:contents mt-2 md:mt-0">
                    <div className="md:col-span-3 text-xl font-bold text-gray-900 uppercase md:order-2">
                      {flight.destination}
                    </div>
                    <div className="md:col-span-2 text-sm md:text-lg text-gray-600 font-mono md:order-3">
                      {flight.flightNumber}
                    </div>
                  </div>

                  {/* Gate & Load */}
                  <div className="flex justify-between items-center mt-4 md:mt-0 pt-4 md:pt-0 border-t border-gray-100 md:border-none md:contents">
                    <div className="flex items-center space-x-2 md:space-x-0 md:col-span-1 md:block md:text-center text-lg md:text-xl font-bold text-blue-900 md:order-4">
                      <span className="text-sm text-gray-500 font-normal md:hidden">搭乗口:</span>
                      <span>{flight.gate}</span>
                    </div>
                    
                    <div className="md:col-span-2 flex flex-col justify-center space-y-1.5 px-0 md:px-2 w-1/2 md:w-auto md:order-5">
                      <div className="flex justify-between text-xs text-gray-500 font-medium">
                        <span>{flightTickets.length} / {flight.totalSeats}</span>
                        <span>{loadPercentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${loadPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
            
            {flights.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                本日のフライトは予定されていません。
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center mt-6 text-xs text-gray-500">
          <p>運航情報は変更される場合があります。搭乗口の案内をご確認ください。</p>
          {!isFirebaseConfigured && (
            <p className="text-amber-600 flex items-center bg-amber-50 px-2 py-1 rounded border border-amber-200">
              <span className="mr-2">⚠</span> シミュレーション環境
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
