import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/useStore';
import { PlaneTakeoff, User, LogOut, Ticket as TicketIcon, AlertCircle, Plus, LayoutGrid } from 'lucide-react';
import { Ticket } from '../lib/firebase';
import BoardingPass from './BoardingPass';
import AddFlightForm from './AddFlightForm';
import { useNavigate } from 'react-router-dom';

const COLUMNS = ['A', 'B', 'C', 'D'];
const ROWS = 6;

interface StaffTicketingProps {
  onLogout: () => void;
}

export default function StaffTicketing({ onLogout }: StaffTicketingProps) {
  const { flights, tickets, issueTicket, updateStatus, isFirebaseConfigured } = useStore();
  const [selectedFlightId, setSelectedFlightId] = useState<string>('');
  const [passengerName, setPassengerName] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<'issue' | 'manage'>('issue');
  const navigate = useNavigate();

  useEffect(() => {
    if (flights.length > 0 && !selectedFlightId) {
      setSelectedFlightId(flights[0].id);
    }
  }, [flights, selectedFlightId]);

  const handleIssue = async () => {
    if (!selectedFlightId || !passengerName.trim() || !selectedSeat) return;
    
    const ticket = await issueTicket(selectedFlightId, passengerName.trim(), selectedSeat);
    setIssuedTicket(ticket);
  };

  const handleSignOut = () => {
    onLogout();
    navigate('/login');
  };

  const selectedFlight = flights.find(f => f.id === selectedFlightId);
  const flightTickets = tickets.filter(t => t.flightId === selectedFlightId);
  const occupiedSeats = new Set(flightTickets.map(t => t.seat));

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans pb-12">
      <div className="bg-blue-900 text-white shadow-md print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PlaneTakeoff className="w-6 h-6 text-blue-300" />
            <span className="font-semibold tracking-wide text-lg">Staff Operations Portal</span>
          </div>
          <div className="flex items-center space-x-6">
            {!isFirebaseConfigured && (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 rounded-full text-xs font-medium flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>Mock Mode</span>
              </span>
            )}
            <button 
              onClick={handleSignOut}
              className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 print:hidden">
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('issue')}
              className={`${
                activeTab === 'issue'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <TicketIcon className="w-4 h-4" />
              <span>Issue Tickets</span>
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Manage Flights</span>
            </button>
          </nav>
        </div>

        {activeTab === 'issue' ? (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Ticket Issuance</h1>
              <p className="text-gray-500 text-sm mt-1">Select a flight and assign a seat to issue a boarding pass.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Section */}
              <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Flight Selection</label>
              <select 
                value={selectedFlightId} 
                onChange={(e) => {
                  setSelectedFlightId(e.target.value);
                  setSelectedSeat('');
                }}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {flights.map(f => (
                  <option key={f.id} value={f.id}>{f.flightNumber} - {f.destination} ({f.departureTime})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Passenger Name</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="e.g. TARO YAMADA"
                  className="w-full pl-10 bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder:text-gray-400 placeholder:normal-case"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={handleIssue}
                disabled={!selectedFlightId || !passengerName.trim() || !selectedSeat}
                className="w-full flex items-center justify-center space-x-2 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-300 disabled:text-gray-500 text-white font-medium py-2.5 px-4 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
              >
                <TicketIcon className="w-5 h-5" />
                <span>Issue Boarding Pass</span>
              </button>
            </div>
          </div>

          {/* Seat Map Section */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
            <h2 className="text-sm font-medium text-gray-700 self-start mb-6">Seat Allocation Map</h2>
            
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-200 rounded-b-xl border border-t-0 border-gray-300"></div>
              
              <div className="flex space-x-10 mt-2">
                {/* Left Columns */}
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: ROWS }).map((_, rowIdx) => (
                    <React.Fragment key={`left-${rowIdx}`}>
                      {COLUMNS.slice(0, 2).map((col) => {
                        const seatId = `${rowIdx + 1}${col}`;
                        const isOccupied = occupiedSeats.has(seatId);
                        const isSelected = selectedSeat === seatId;
                        return (
                          <button
                            key={seatId}
                            disabled={isOccupied}
                            onClick={() => setSelectedSeat(seatId)}
                            className={`w-12 h-14 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-bold transition-colors focus:outline-none
                              ${isOccupied ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed' : 
                                isSelected ? 'bg-blue-900 text-white shadow-md' : 
                                'bg-white text-gray-600 border border-gray-300 hover:border-blue-500 hover:text-blue-600'}`}
                          >
                            {isOccupied ? '×' : seatId}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>

                {/* Aisle */}
                <div className="w-6 flex flex-col items-center justify-between py-2">
                  {Array.from({ length: ROWS }).map((_, i) => (
                    <div key={`aisle-${i}`} className="text-xs text-gray-400 font-medium">{i + 1}</div>
                  ))}
                </div>

                {/* Right Columns */}
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: ROWS }).map((_, rowIdx) => (
                    <React.Fragment key={`right-${rowIdx}`}>
                      {COLUMNS.slice(2, 4).map((col) => {
                        const seatId = `${rowIdx + 1}${col}`;
                        const isOccupied = occupiedSeats.has(seatId);
                        const isSelected = selectedSeat === seatId;
                        return (
                          <button
                            key={seatId}
                            disabled={isOccupied}
                            onClick={() => setSelectedSeat(seatId)}
                            className={`w-12 h-14 rounded-t-lg rounded-b-sm flex items-center justify-center text-xs font-bold transition-colors focus:outline-none
                              ${isOccupied ? 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed' : 
                                isSelected ? 'bg-blue-900 text-white shadow-md' : 
                                'bg-white text-gray-600 border border-gray-300 hover:border-blue-500 hover:text-blue-600'}`}
                          >
                            {isOccupied ? '×' : seatId}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-8 mt-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div><span>Available</span></div>
              <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-blue-900 rounded-sm"></div><span>Selected</span></div>
              <div className="flex items-center space-x-2"><div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded-sm flex items-center justify-center text-[10px] text-gray-400 font-bold">×</div><span>Occupied</span></div>
            </div>
            </div>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            <AddFlightForm onSuccess={() => setActiveTab('issue')} />
            
            {/* Display flights list to change status */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Flights</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dest</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {flights.map((f) => (
                      <tr key={f.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">{f.flightNumber}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{f.destination}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{f.departureTime}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{f.gate}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                           <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                             ${f.status === 'Boarding' ? 'bg-green-100 text-green-800' : 
                               f.status === 'Delayed' ? 'bg-red-100 text-red-800' : 
                               f.status === 'Departed' ? 'bg-gray-100 text-gray-800' : 
                               'bg-blue-100 text-blue-800'}`}>
                             {f.status}
                           </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <select 
                            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={f.status}
                            onChange={(e) => updateStatus(f.id, e.target.value as any)}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Boarding">Boarding</option>
                            <option value="Departed">Departed</option>
                            <option value="Delayed">Delayed</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {flights.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                          No flights available. Register one above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Preview Modal */}
      {issuedTicket && selectedFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-5xl overflow-auto max-h-[90vh] print:p-0 print:shadow-none print:overflow-visible">
            <div className="flex justify-between items-center mb-6 print:hidden">
              <h2 className="text-xl font-bold text-gray-900">Boarding Pass Issued</h2>
              <div className="flex space-x-3">
                <button 
                  onClick={() => window.print()}
                  className="bg-blue-900 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-800 transition-colors"
                >
                  Print Ticket
                </button>
                <button 
                  onClick={() => {
                    setIssuedTicket(null);
                    setPassengerName('');
                    setSelectedSeat('');
                  }}
                  className="bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
                >
                  Close & Next
                </button>
              </div>
            </div>
            
            <div className="print:block w-full flex justify-center">
              <BoardingPass ticket={issuedTicket} flight={selectedFlight} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
