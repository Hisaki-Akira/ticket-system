import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/useStore';
import { 
  Plane, 
  User, 
  LogOut, 
  Ticket as TicketIcon, 
  LayoutGrid, 
  Users, 
  Smartphone, 
  Share2, 
  CheckCircle2, 
  Trash2, 
  Eye, 
  ExternalLink,
  RotateCcw,
  Calendar,
  Printer
} from 'lucide-react';
import { Ticket } from '../lib/firebase';
import BoardingPass from './BoardingPass';
import AddFlightForm from './AddFlightForm';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getTicketUrl, saveLocalTicket } from '../lib/ticketUrl';
import { isFlightPassed } from '../lib/mockStore';

const LEFT_COLUMNS = ['A', 'C'];
const CENTER_COLUMNS = ['D', 'E', 'F', 'G'];
const RIGHT_COLUMNS = ['H', 'K'];
const ROWS = 3;

interface StaffTicketingProps {
  onLogout: () => void;
}

export default function StaffTicketing({ onLogout }: StaffTicketingProps) {
  const { 
    flights, 
    tickets, 
    issueTicket, 
    deleteTicket, 
    clearAllTickets, 
    updateStatus, 
    deleteFlight,
    deletePassedFlights,
    markPassedFlightsDeparted,
    resetData,
  } = useStore();

  const [selectedFlightId, setSelectedFlightId] = useState<string>('');
  const [passengerName, setPassengerName] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [issuedTicket, setIssuedTicket] = useState<Ticket | null>(null);
  const [previewFlight, setPreviewFlight] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'issue' | 'manage' | 'passengers'>('issue');
  const [copied, setCopied] = useState<boolean>(false);
  const [filterFlightId, setFilterFlightId] = useState<string>('all');
  const [filterManageDate, setFilterManageDate] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  // Sort flights by date then time
  const sortedFlights = [...flights].sort((a, b) => {
    const cmpDate = a.departureDate.localeCompare(b.departureDate);
    if (cmpDate !== 0) return cmpDate;
    return a.departureTime.localeCompare(b.departureTime);
  });

  const availableDates = Array.from(new Set(flights.map(f => f.departureDate)));

  useEffect(() => {
    if (sortedFlights.length > 0 && !selectedFlightId) {
      setSelectedFlightId(sortedFlights[0].id);
    }
  }, [sortedFlights, selectedFlightId]);

  const handleIssue = async () => {
    if (!selectedFlightId || !passengerName.trim() || !selectedSeat) return;
    
    const flight = flights.find(f => f.id === selectedFlightId);
    const ticket = await issueTicket(selectedFlightId, passengerName.trim(), selectedSeat);
    setIssuedTicket(ticket);
    setPreviewFlight(flight || null);
    if (flight) {
      saveLocalTicket(ticket, flight);
    }
  };

  const handleShowExistingTicket = (t: Ticket) => {
    const flight = flights.find(f => f.id === t.flightId);
    if (flight) {
      setPreviewFlight(flight);
      setIssuedTicket(t);
    }
  };

  const handleDeleteTicket = async (ticketId: string, name: string) => {
    if (window.confirm(`「${name}」様の予約データを削除しますか？`)) {
      await deleteTicket(ticketId);
    }
  };

  const handleClearAllTickets = async () => {
    if (window.confirm('登録されているすべての予約データを一括消去しますか？')) {
      await clearAllTickets();
    }
  };

  const handleDeleteFlight = async (flightId: string, flightNumber: string) => {
    if (window.confirm(`便名「${flightNumber}」を削除しますか？`)) {
      await deleteFlight(flightId);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('初期サンプルデータにリセットしますか？')) {
      await resetData();
    }
  };

  const handleMarkPassedDeparted = async () => {
    const targetDate = filterManageDate === 'all' ? undefined : filterManageDate;
    const count = await markPassedFlightsDeparted(targetDate);
    alert(`${count}件の予定超過便を「出発済」に更新しました。`);
  };

  const handleDeletePassedFlights = async () => {
    const targetDate = filterManageDate === 'all' ? undefined : filterManageDate;
    const msg = targetDate 
      ? `【${targetDate}】の予定時刻を過ぎたフライトを一括削除しますか？\n（関連する搭乗券データも同時に消去されます）`
      : `予定時刻を過ぎたすべてのフライトを一括削除しますか？\n（関連する搭乗券データも同時に消去されます）`;
    if (window.confirm(msg)) {
      const count = await deletePassedFlights(targetDate);
      alert(`${count}件の便を削除しました。`);
    }
  };

  const handleSignOut = () => {
    onLogout();
    navigate('/login');
  };

  const selectedFlight = flights.find(f => f.id === selectedFlightId);
  const flightTickets = tickets.filter(t => t.flightId === selectedFlightId);
  const occupiedSeats = new Set(flightTickets.map(t => t.seat));

  const modalTicketUrl = issuedTicket && (previewFlight || selectedFlight) 
    ? getTicketUrl(issuedTicket, previewFlight || selectedFlight) 
    : '';

  const handleCopyModalUrl = async () => {
    if (!modalTicketUrl) return;
    try {
      await navigator.clipboard.writeText(modalTicketUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered tickets for the passenger list
  const filteredTickets = tickets.filter(t => {
    const matchesFlight = filterFlightId === 'all' || t.flightId === filterFlightId;
    const matchesSearch = !searchTerm.trim() || 
      t.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.seat.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFlight && matchesSearch;
  });

  // Filter flights in management tab
  const displayedManageFlights = sortedFlights.filter(f => {
    if (filterManageDate === 'all') return true;
    return f.departureDate === filterManageDate;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans pb-16">
      
      {/* Top Console Bar */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20 print:hidden shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Plane className="w-5 h-5 text-slate-800" />
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-slate-900">Shibaura Tech Airways</span>
              <span className="text-xs text-slate-500 font-medium">運航管理</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/')}
              className="text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              出発案内を表示
            </button>
            <button 
              onClick={handleSignOut}
              className="text-slate-600 hover:text-slate-900 transition-colors flex items-center space-x-1.5 text-xs font-medium cursor-pointer pl-3 border-l border-gray-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 space-y-6 print:hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 space-x-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('issue')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'issue'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TicketIcon className="w-4 h-4" />
            <span>発券業務</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'manage'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>ダイヤ管理</span>
          </button>

          <button
            onClick={() => setActiveTab('passengers')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'passengers'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>予約一覧 ({tickets.length}件)</span>
          </button>
        </div>

        {/* Tab 1: Ticketing Issue */}
        {activeTab === 'issue' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Section */}
            <div className="lg:col-span-5 space-y-5 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
              <div className="border-b border-gray-200 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  搭乗券 発券入力
                </h2>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">搭乗便選択</label>
                <select 
                  value={selectedFlightId} 
                  onChange={(e) => {
                    setSelectedFlightId(e.target.value);
                    setSelectedSeat('');
                  }}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-slate-900 font-medium"
                >
                  {sortedFlights.map(f => {
                    const passed = isFlightPassed(f);
                    return (
                      <option key={f.id} value={f.id}>
                        {passed ? '【出発済】' : ''}【{f.departureDate} {f.departureTime}発】 {f.flightNumber} - {f.destination} {passed ? '(受付終了)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">搭乗者名</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input 
                    type="text" 
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="例: YAMADA TARO"
                    className="w-full pl-9 bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-800 uppercase text-xs focus:outline-none focus:border-slate-900 placeholder:text-slate-400 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleIssue}
                  disabled={!selectedFlightId || !passengerName.trim() || !selectedSeat}
                  className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed text-xs shadow-xs"
                >
                  <TicketIcon className="w-4 h-4" />
                  <span>搭乗券を発行する</span>
                </button>
              </div>
            </div>

            {/* Seat Map Section (2-4-2 with 3 rows) */}
            <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <span className="text-xs font-bold text-slate-800">座席指定マップ (2-4-2列)</span>
                {selectedSeat && (
                  <span className="text-xs font-mono font-bold text-slate-900">選択中: {selectedSeat}席</span>
                )}
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col items-center overflow-x-auto w-full">
                <div className="text-[11px] font-bold text-slate-500 mb-3">
                  ▲ 機首方向
                </div>

                {/* Seat Map Header */}
                <div className="flex items-center space-x-1.5 sm:space-x-3 text-center text-[10px] text-slate-500 mb-2">
                  <div className="w-[68px] sm:w-[84px]">窓側 / A · C</div>
                  <div className="w-4 sm:w-5">通路</div>
                  <div className="w-[136px] sm:w-[168px]">中央 / D · E · F · G</div>
                  <div className="w-4 sm:w-5">通路</div>
                  <div className="w-[68px] sm:w-[84px]">窓側 / H · K</div>
                </div>

                {/* 3 Rows of 2-4-2 Seats */}
                <div className="space-y-2.5">
                  {Array.from({ length: ROWS }).map((_, rowIdx) => {
                    const rowNum = rowIdx + 1;
                    return (
                      <div key={`staff-row-${rowNum}`} className="flex items-center space-x-1.5 sm:space-x-3">
                        {/* Left Block (2 seats: A, C) */}
                        <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                          {LEFT_COLUMNS.map((col) => {
                            const seatId = `${rowNum}${col}`;
                            const isOccupied = occupiedSeats.has(seatId);
                            const isSelected = selectedSeat === seatId;
                            return (
                              <button
                                key={seatId}
                                disabled={isOccupied}
                                onClick={() => setSelectedSeat(seatId)}
                                className={`w-8 sm:w-10 h-9 sm:h-11 rounded-lg font-mono text-[11px] sm:text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                                  isOccupied 
                                    ? 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed' 
                                    : isSelected 
                                      ? 'bg-slate-900 text-white font-bold shadow-sm' 
                                      : 'bg-white hover:bg-gray-100 text-slate-800 border border-gray-300'
                                }`}
                              >
                                {isOccupied ? '×' : seatId}
                              </button>
                            );
                          })}
                        </div>

                        {/* Aisle 1 (Row Number) */}
                        <div className="w-4 sm:w-5 text-center text-xs font-mono font-bold text-slate-500">
                          {rowNum}
                        </div>

                        {/* Center Block (4 seats: D, E, F, G) */}
                        <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                          {CENTER_COLUMNS.map((col) => {
                            const seatId = `${rowNum}${col}`;
                            const isOccupied = occupiedSeats.has(seatId);
                            const isSelected = selectedSeat === seatId;
                            return (
                              <button
                                key={seatId}
                                disabled={isOccupied}
                                onClick={() => setSelectedSeat(seatId)}
                                className={`w-8 sm:w-10 h-9 sm:h-11 rounded-lg font-mono text-[11px] sm:text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                                  isOccupied 
                                    ? 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed' 
                                    : isSelected 
                                      ? 'bg-slate-900 text-white font-bold shadow-sm' 
                                      : 'bg-white hover:bg-gray-100 text-slate-800 border border-gray-300'
                                }`}
                              >
                                {isOccupied ? '×' : seatId}
                              </button>
                            );
                          })}
                        </div>

                        {/* Aisle 2 (Row Number) */}
                        <div className="w-4 sm:w-5 text-center text-xs font-mono font-bold text-slate-500">
                          {rowNum}
                        </div>

                        {/* Right Block (2 seats: H, K) */}
                        <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
                          {RIGHT_COLUMNS.map((col) => {
                            const seatId = `${rowNum}${col}`;
                            const isOccupied = occupiedSeats.has(seatId);
                            const isSelected = selectedSeat === seatId;
                            return (
                              <button
                                key={seatId}
                                disabled={isOccupied}
                                onClick={() => setSelectedSeat(seatId)}
                                className={`w-8 sm:w-10 h-9 sm:h-11 rounded-lg font-mono text-[11px] sm:text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                                  isOccupied 
                                    ? 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed' 
                                    : isSelected 
                                      ? 'bg-slate-900 text-white font-bold shadow-sm' 
                                      : 'bg-white hover:bg-gray-100 text-slate-800 border border-gray-300'
                                }`}
                              >
                                {isOccupied ? '×' : seatId}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex items-center space-x-6 mt-4 text-xs text-slate-600">
                <div className="flex items-center space-x-1.5"><div className="w-3 h-3 bg-white border border-gray-300 rounded"></div><span>空席</span></div>
                <div className="flex items-center space-x-1.5"><div className="w-3 h-3 bg-slate-900 rounded"></div><span>選択中</span></div>
                <div className="flex items-center space-x-1.5"><div className="w-3 h-3 bg-gray-200 border border-gray-300 rounded flex items-center justify-center text-[8px] text-gray-500">×</div><span>指定済</span></div>
              </div>
            </div>

          </div>
        ) : activeTab === 'manage' ? (
          <div className="space-y-6">
            <AddFlightForm onSuccess={() => {}} />
            
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-200 pb-3">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold text-slate-900">
                    登録済みフライト一覧
                  </h2>
                  {displayedManageFlights.some(f => isFlightPassed(f)) && (
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={handleMarkPassedDeparted}
                        className="text-[11px] font-medium text-slate-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-2.5 py-1 rounded cursor-pointer transition-colors"
                      >
                        予定時刻超過便を「出発済」に更新
                      </button>
                      <button
                        onClick={handleDeletePassedFlights}
                        className="text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded cursor-pointer transition-colors"
                      >
                        予定超過便を一括消去
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 text-xs">
                  {availableDates.length > 0 && (
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <select 
                        value={filterManageDate}
                        onChange={(e) => setFilterManageDate(e.target.value)}
                        className="bg-white border border-gray-300 rounded px-2.5 py-1 text-slate-700 font-mono"
                      >
                        <option value="all">全日程 ({sortedFlights.length}便)</option>
                        {availableDates.map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    onClick={handleResetData}
                    className="flex items-center space-x-1 text-slate-600 hover:text-slate-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>サンプル初期化</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead>
                    <tr className="text-slate-500 text-[11px] font-bold">
                      <th className="px-4 py-2.5 text-left">出発日</th>
                      <th className="px-4 py-2.5 text-left">時刻</th>
                      <th className="px-4 py-2.5 text-left">便名</th>
                      <th className="px-4 py-2.5 text-left">行先</th>
                      <th className="px-4 py-2.5 text-left">搭乗口</th>
                      <th className="px-4 py-2.5 text-left">状況</th>
                      <th className="px-4 py-2.5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayedManageFlights.map((f) => {
                      const passed = isFlightPassed(f);
                      return (
                        <tr key={f.id} className={`transition-colors ${passed ? 'bg-gray-50/70' : 'hover:bg-gray-50'}`}>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-600">
                            {f.departureDate}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-slate-900 tabular-nums">
                            {f.departureTime}
                            {passed && (
                              <span className="ml-1.5 text-[10px] text-slate-500 font-sans font-normal bg-gray-200 px-1 py-0.5 rounded">
                                予定超過
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-slate-800">
                            {f.flightNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-800">{f.destination}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-700">{f.gate}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <select 
                              className={`bg-white border rounded px-2 py-1 text-xs focus:outline-none font-medium ${
                                f.status === 'Departed' ? 'border-gray-200 text-slate-500 bg-gray-50' : 'border-gray-300 text-slate-800 focus:border-slate-900'
                              }`}
                              value={f.status}
                              onChange={(e) => updateStatus(f.id, e.target.value as any)}
                            >
                              <option value="Scheduled">定刻</option>
                              <option value="Boarding">搭乗中</option>
                              <option value="Departed">出発済</option>
                              <option value="Delayed">遅延</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <button 
                              onClick={() => handleDeleteFlight(f.id, f.flightNumber)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                              title="この便を削除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {displayedManageFlights.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                          該当するフライトはありません。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h1 className="text-base font-bold text-slate-900">予約一覧・搭乗券照会</h1>
              </div>

              {tickets.length > 0 && (
                <button
                  onClick={handleClearAllTickets}
                  className="text-xs text-rose-700 hover:text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>予約データを一括削除 ({tickets.length}件)</span>
                </button>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
              
              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-6">
                  <select 
                    value={filterFlightId} 
                    onChange={(e) => setFilterFlightId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-slate-900"
                  >
                    <option value="all">全便を表示 ({tickets.length}名)</option>
                    {sortedFlights.map(f => {
                      const count = tickets.filter(t => t.flightId === f.id).length;
                      return (
                        <option key={f.id} value={f.id}>
                          【{f.departureDate} {f.departureTime}】 {f.flightNumber} - {f.destination} ({count}名)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="氏名や座席番号で検索..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Tickets Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead>
                    <tr className="text-slate-500 font-bold text-[11px]">
                      <th className="px-4 py-2.5 text-left">搭乗日時</th>
                      <th className="px-4 py-2.5 text-left">便名</th>
                      <th className="px-4 py-2.5 text-left">座席</th>
                      <th className="px-4 py-2.5 text-left">旅客氏名</th>
                      <th className="px-4 py-2.5 text-left">発券時刻</th>
                      <th className="px-4 py-2.5 text-right">照会 / 操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTickets.length > 0 ? (
                      [...filteredTickets]
                        .sort((a, b) => b.issuedAt - a.issuedAt)
                        .map((t) => {
                          const fl = flights.find(f => f.id === t.flightId);
                          return (
                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-600">
                                {fl ? `${fl.departureDate} ${fl.departureTime}` : '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-slate-900">
                                {fl?.flightNumber || 'STA-???'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-slate-900">
                                {t.seat}席
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                                {t.passengerName} 様
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                {new Date(t.issuedAt).toLocaleTimeString('ja-JP')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                                <button
                                  onClick={() => handleShowExistingTicket(t)}
                                  className="inline-flex items-center space-x-1 text-xs text-slate-800 hover:text-slate-950 bg-gray-100 hover:bg-gray-200 border border-gray-300 px-2.5 py-1 rounded transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>搭乗券</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteTicket(t.id, t.passengerName)}
                                  className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                  title="予約を削除"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                          該当する予約者は見つかりませんでした。
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Ticket Preview Modal */}
      {issuedTicket && (previewFlight || selectedFlight) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-white text-slate-900 border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-4xl w-full max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl print:p-0 print:border-none print:shadow-none">
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 print:hidden">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">搭乗券の発行照会</h2>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>印刷</span>
                </button>
                <button 
                  onClick={() => {
                    setIssuedTicket(null);
                    setPreviewFlight(null);
                    setPassengerName('');
                    setSelectedSeat('');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            </div>

            {/* Smartphone QR Code Scan Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 print:hidden">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2.5 rounded-lg border border-gray-300 flex-shrink-0">
                  <QRCodeSVG 
                    value={modalTicketUrl} 
                    size={110} 
                    level="M" 
                    includeMargin={false}
                  />
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-center sm:justify-start gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    <span>スマートフォン読取用</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {(previewFlight || selectedFlight)?.departureDate} {(previewFlight || selectedFlight)?.departureTime}発 • {(previewFlight || selectedFlight)?.flightNumber}便 • {issuedTicket.seat}席 {issuedTicket.passengerName} 様
                  </h3>
                  <p className="text-xs text-slate-500">
                    スマートフォンのカメラでQRコードを読み取ると、端末に搭乗券が保存されます。
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <button 
                  onClick={handleCopyModalUrl}
                  className="w-full px-4 py-2 bg-white hover:bg-gray-50 text-slate-700 border border-gray-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'コピー完了' : 'URLをコピー'}</span>
                </button>
                <a
                  href={modalTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>搭乗券画面を開く</span>
                </a>
              </div>
            </div>
            
            <div className="print:block w-full flex justify-center">
              <BoardingPass ticket={issuedTicket} flight={previewFlight || selectedFlight!} />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
