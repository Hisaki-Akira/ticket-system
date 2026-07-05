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
              <h1 className="text-3xl font-bold tracking-tight">Departures</h1>
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wider mt-1">Terminal 1 • International</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2 text-2xl font-bold font-mono tracking-wider">
              <Clock className="w-5 h-5 text-blue-300" />
              <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
            </div>
            <p className="text-blue-200 text-sm mt-1">Local Time</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Board */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 bg-gray-50 text-gray-500 px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
            <div className="col-span-2">Time</div>
            <div className="col-span-3">Destination</div>
            <div className="col-span-2">Flight</div>
            <div className="col-span-1 text-center">Gate</div>
            <div className="col-span-2 text-center">Load Factor</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {flights.map(flight => {
              const flightTickets = tickets.filter(t => t.flightId === flight.id);
              const loadPercentage = Math.round((flightTickets.length / flight.totalSeats) * 100);
              
              return (
                <div key={flight.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-2 text-xl font-bold text-gray-900 font-mono">
                    {flight.departureTime}
                  </div>
                  <div className="col-span-3 text-xl font-bold text-gray-900 uppercase">
                    {flight.destination}
                  </div>
                  <div className="col-span-2 text-lg text-gray-600 font-mono">
                    {flight.flightNumber}
                  </div>
                  <div className="col-span-1 text-center text-xl font-bold text-blue-900">
                    {flight.gate}
                  </div>
                  
                  {/* Load Bar */}
                  <div className="col-span-2 flex flex-col justify-center space-y-1.5 px-2">
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

                  <div className="col-span-2 flex justify-end">
                    <span className={`px-3 py-1 rounded-md text-sm font-bold uppercase tracking-wide border ${getStatusStyle(flight.status)}`}>
                      {flight.status}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {flights.length === 0 && (
              <div className="p-12 text-center text-gray-500">
                No flights scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center mt-6 text-xs text-gray-500">
          <p>Flight information is subject to change. Please verify at the gate.</p>
          {!isFirebaseConfigured && (
            <p className="text-amber-600 flex items-center bg-amber-50 px-2 py-1 rounded border border-amber-200">
              <span className="mr-2">⚠</span> Simulated Network Environment
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
