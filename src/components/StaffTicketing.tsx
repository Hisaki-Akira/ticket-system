import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/useStore';
import { 
  PlaneTakeoff, 
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

const LEFT_COLUMNS = ['A', 'C'];
const CENTER_COLUMNS = ['D', 'E', 'G'];
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
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 font-sans pb-16">
      
      {/* Top Console Bar */}
      <header className="border-b border-slate-800 bg-[#0F1626]/90 backdrop-blur sticky top-0 z-20 print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PlaneTakeoff className="w-5 h-5 text-sky-400" />
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-sm text-white">SHIBAURA TECH AIRWAYS</span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">OPS CONSOLE</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/')}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              出発案内を表示
            </button>
            <button 
              onClick={handleSignOut}
              className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1.5 text-xs font-medium cursor-pointer pl-3 border-l border-slate-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 space-y-6 print:hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('issue')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'issue'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TicketIcon className="w-4 h-4" />
            <span>発券業務 (TICKETING)</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'manage'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>ダイヤ管理 (SCHEDULE)</span>
          </button>

          <button
            onClick={() => setActiveTab('passengers')}
            className={`pb-3 border-b-2 flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'passengers'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>予約名簿 (PASSENGERS: {tickets.length})</span>
          </button>
        </div>

        {/* Tab 1: Ticketing Issue */}
        {activeTab === 'issue' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Section */}
            <div className="lg:col-span-5 space-y-5 bg-[#11192C] p-6 rounded-xl border border-slate-800">
              <div className="border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  搭乗券 発券入力
                </h2>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400">搭乗便選択</label>
                <select 
                  value={selectedFlightId} 
                  onChange={(e) => {
                    setSelectedFlightId(e.target.value);
                    setSelectedSeat('');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs focus:outline-none focus:border-sky-500 font-medium"
                >
                  {sortedFlights.map(f => (
                    <option key={f.id} value={f.id}>
                      【{f.departureDate} {f.departureTime}発】 {f.flightNumber} - {f.destination}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-400">旅客氏名 (ローマ字または漢字)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input 
                    type="text" 
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="例: YAMADA TARO"
                    className="w-full pl-9 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 uppercase text-xs focus:outline-none focus:border-sky-500 placeholder:text-slate-600 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleIssue}
                  disabled={!selectedFlightId || !passengerName.trim() || !selectedSeat}
                  className="w-full flex items-center justify-center space-x-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed text-xs"
                >
                  <TicketIcon className="w-4 h-4" />
                  <span>搭乗券を発行する (QRコード生成)</span>
                </button>
              </div>
            </div>

            {/* Seat Map Section */}
            <div className="lg:col-span-7 bg-[#11192C] p-6 rounded-xl border border-slate-800 flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">座席指定マップ</span>
                {selectedSeat && (
                  <span className="text-xs font-mono font-bold text-sky-400">選択中: {selectedSeat}席</span>
                )}
              </div>
              
              <div className="bg-[#0C121E] p-6 rounded-xl border border-slate-800 flex flex-col items-center">
                <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-3">
                  ▲ 機首方向 (FRONT)
                </div>

                {/* Seat Map Header: Window / Aisle Indicators */}
                <div className="flex items-center space-x-2 sm:space-x-3 text-center text-[10px] font-mono text-slate-400 mb-2">
                  <div className="w-[72px] sm:w-[88px] text-slate-400">窓側 / A · C</div>
                  <div className="w-5 text-slate-600">通路</div>
                  <div className="w-[108px] sm:w-[132px] text-slate-400">中央 / D · E · G</div>
                  <div className="w-5 text-slate-600">通路</div>
                  <div className="w-[72px] sm:w-[88px] text-slate-400">窓側 / H · K</div>
                </div>

                {/* 3 Rows of 2-3-2 Seats */}
                <div className="space-y-2.5">
                  {Array.from({ length: ROWS }).map((_, rowIdx) => {
                    const rowNum = rowIdx + 1;
                    return (
                      <div key={`staff-row-${rowNum}`} className="flex items-center space-x-2 sm:space-x-3">
                        {/* Left Block (2 seats: A, C) */}
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          {LEFT_COLUMNS.map((col) => {
                            const seatId = `${rowNum}${col}`;
                            const isOccupied = occupiedSeats.has(seatId);
                            const isSelected = selectedSeat === seatId;
                            return (
                              <button
                                key={seatId}
                                disabled={isOccupied}
                                onClick={() => setSelectedSeat(seatId)}
                                className={`w-9 sm:w-10 h-10 sm:h-11 rounded-lg font-mono text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                                  isOccupied 
                                    ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed' 
                                    : isSelected 
                                      ? 'bg-sky-500 text-white font-black shadow-lg shadow-sky-500/30 ring-2 ring-sky-400' 
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                                }`}
                              >
                                {isOccupied ? '×' : seatId}
                              </button>
                            );
                          })}
                        </div>

                        {/* Aisle 1 (Row Number) */}
                        <div className="w-5 text-center text-xs font-mono font-bold text-slate-500">
                          {rowNum}
                        </div>

                        {/* Center Block (3 seats: D, E, G) */}
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                          {CENTER_COLUMNS.map((col) => {
                            const seatId = `${rowNum}${col}`;
                            const isOccupied = occupiedSeats.has(seatId);
                            const isSelected = selectedSeat === seatId;
                            return (
                              <button
                                key={seatId}
                                disabled={isOccupied}
                                onClick={() => setSelectedSeat(seatId)}
                                className={`w-9 sm:w-10 h-10 sm:h-11 rounded-lg font-mono text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                                  isOccupied 
                                    ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed' 
                                    : isSelected 
                                      ? 'bg-sky-500 text-white font-black shadow-lg shadow-sky-500/30 ring-2 ring-sky-400' 
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                                }`}
                              >
                                {isOccupied ? '×' : seatId}
                              </button>
                            );
                          })}
                        </div>

                        {/* Aisle 2 (Row Number) */}
                        <div className="w-5 text-center text-xs font-mono font-bold text-slate-500">
                          {rowNum}
                        </div>

                        {/* Right Block (2 seats: H, K) */}
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                          {RIGHT_COLUMNS.map((col) => {
                            const seatId = `${rowNum}${col}`;
                            const isOccupied = occupiedSeats.has(seatId);
                            const isSelected = selectedSeat === seatId;
                            return (
                              <button
                                key={seatId}
                                disabled={isOccupied}
                                onClick={() => setSelectedSeat(seatId)}
                                className={`w-9 sm:w-10 h-10 sm:h-11 rounded-lg font-mono text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                                  isOccupied 
                                    ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed' 
                                    : isSelected 
                                      ? 'bg-sky-500 text-white font-black shadow-lg shadow-sky-500/30 ring-2 ring-sky-400' 
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
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
              
              <div className="flex items-center space-x-6 mt-4 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5"><div className="w-3 h-3 bg-slate-800 border border-slate-700 rounded"></div><span>空席</span></div>
                <div className="flex items-center space-x-1.5"><div className="w-3 h-3 bg-sky-500 rounded"></div><span>選択中</span></div>
                <div className="flex items-center space-x-1.5"><div className="w-3 h-3 bg-slate-800/40 border border-slate-800 rounded flex items-center justify-center text-[8px] text-slate-600">×</div><span>指定済</span></div>
              </div>
            </div>

          </div>
        ) : activeTab === 'manage' ? (
          <div className="space-y-6">
            <AddFlightForm onSuccess={() => setActiveTab('issue')} />
            
            <div className="bg-[#11192C] p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  登録済みフライト一覧
                </h2>
                
                <div className="flex items-center space-x-3 text-xs">
                  {availableDates.length > 0 && (
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <select 
                        value={filterManageDate}
                        onChange={(e) => setFilterManageDate(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 font-mono"
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
                    className="flex items-center space-x-1 text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>サンプル初期化</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-xs">
                  <thead>
                    <tr className="text-slate-400 font-mono text-[11px] uppercase">
                      <th className="px-4 py-2.5 text-left">出発日</th>
                      <th className="px-4 py-2.5 text-left">時刻</th>
                      <th className="px-4 py-2.5 text-left">便名</th>
                      <th className="px-4 py-2.5 text-left">行先</th>
                      <th className="px-4 py-2.5 text-left">搭乗口</th>
                      <th className="px-4 py-2.5 text-left">状況</th>
                      <th className="px-4 py-2.5 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {displayedManageFlights.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-300">
                          {f.departureDate}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-white tabular-nums">
                          {f.departureTime}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-sky-400">
                          {f.flightNumber}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-200">{f.destination}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-300">{f.gate}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select 
                            className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-500 font-medium"
                            value={f.status}
                            onChange={(e) => updateStatus(f.id, e.target.value as any)}
                          >
                            <option value="Scheduled">定刻 (ON TIME)</option>
                            <option value="Boarding">搭乗中 (BOARDING)</option>
                            <option value="Departed">出発済 (DEPARTED)</option>
                            <option value="Delayed">遅延 (DELAYED)</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button 
                            onClick={() => handleDeleteFlight(f.id, f.flightNumber)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                            title="この便を削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
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
                <h1 className="text-base font-bold text-white">予約者名簿・搭乗券照会</h1>
              </div>

              {tickets.length > 0 && (
                <button
                  onClick={handleClearAllTickets}
                  className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>予約データを一括削除 ({tickets.length}件)</span>
                </button>
              )}
            </div>

            <div className="bg-[#11192C] p-6 rounded-xl border border-slate-800 space-y-4">
              
              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-6">
                  <select 
                    value={filterFlightId} 
                    onChange={(e) => setFilterFlightId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Tickets Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-xs">
                  <thead>
                    <tr className="text-slate-400 font-mono text-[11px] uppercase">
                      <th className="px-4 py-2.5 text-left">搭乗日時</th>
                      <th className="px-4 py-2.5 text-left">便名</th>
                      <th className="px-4 py-2.5 text-left">座席</th>
                      <th className="px-4 py-2.5 text-left">旅客氏名</th>
                      <th className="px-4 py-2.5 text-left">発券時刻</th>
                      <th className="px-4 py-2.5 text-right">照会 / 操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredTickets.length > 0 ? (
                      [...filteredTickets]
                        .sort((a, b) => b.issuedAt - a.issuedAt)
                        .map((t) => {
                          const fl = flights.find(f => f.id === t.flightId);
                          return (
                            <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-400">
                                {fl ? `${fl.departureDate} ${fl.departureTime}` : '-'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-sky-400">
                                {fl?.flightNumber || 'STA-???'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap font-mono font-bold text-white">
                                {t.seat}席
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-200">
                                {t.passengerName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                {new Date(t.issuedAt).toLocaleTimeString('ja-JP')}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                                <button
                                  onClick={() => handleShowExistingTicket(t)}
                                  className="inline-flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>搭乗券</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteTicket(t.id, t.passengerName)}
                                  className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 print:static print:bg-transparent print:p-0 print:block">
          <div className="bg-[#11192C] text-slate-100 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl w-full max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl print:p-0 print:border-none print:shadow-none">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 print:hidden">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">搭乗券の発行照会</h2>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
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
                  className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  閉じる
                </button>
              </div>
            </div>

            {/* Smartphone QR Code Scan Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 print:hidden">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2.5 rounded-lg border border-slate-300 flex-shrink-0">
                  <QRCodeSVG 
                    value={modalTicketUrl} 
                    size={110} 
                    level="M" 
                    includeMargin={false}
                  />
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center justify-center sm:justify-start gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>スマートフォン読取用</span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {(previewFlight || selectedFlight)?.departureDate} {(previewFlight || selectedFlight)?.departureTime}発 • {(previewFlight || selectedFlight)?.flightNumber}便 • {issuedTicket.seat}席 {issuedTicket.passengerName} 様
                  </h3>
                  <p className="text-xs text-slate-400">
                    スマートフォンのカメラでQRコードを読み取ると、端末に搭乗券が保存されます。
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <button 
                  onClick={handleCopyModalUrl}
                  className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'コピー完了' : 'URLをコピー'}</span>
                </button>
                <a
                  href={modalTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
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
