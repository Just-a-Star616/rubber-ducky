import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { MapPinIcon, XIcon } from '../../components/icons/Icon';
import { logAction } from '../../lib/logging';

interface Booking {
  id: string;
  time: string;
  pta: string;
  status: 'PRE-BOOKED' | 'BOOKED' | 'BIDDING' | 'COMPLETED' | 'CANCELLED' | 'NOSHOW' | 'NETWORK';
  priority: string;
  pickup: string;
  destination: string;
  passenger: string;
  fare: number;
  zone: string;
  driver?: string;
  vehicle?: string;
  distance?: string;
  eta?: string;
  notes?: string;
  notes2?: string;
  notes3?: string;
}

const mockBookings: Booking[] = [
  {
    id: '0110',
    time: '01:10',
    pta: '0110',
    status: 'BIDDING',
    priority: '9',
    pickup: 'Leicester City Centre',
    destination: '£8.10F',
    passenger: 'SWig LE',
    fare: 8.10,
    zone: 'LE',
    driver: 'IVR',
    distance: 'R4',
    notes: 'BIDDING',
    notes2: '',
    notes3: '',
  },
  {
    id: '0120',
    time: '01:20',
    pta: '0120',
    status: 'BOOKED',
    priority: '1',
    pickup: '123 Main Street',
    destination: 'Town Hall',
    passenger: 'John Smith',
    fare: 12.50,
    zone: 'M1',
    driver: 'D-001',
    vehicle: 'MB E-Class',
    distance: 'R5',
  },
  {
    id: '0125',
    time: '01:25',
    pta: '0125',
    status: 'PRE-BOOKED',
    priority: '5',
    pickup: 'Manchester Airport',
    destination: 'City Centre',
    passenger: 'Jane Doe',
    fare: 45.00,
    zone: 'M15',
    distance: 'R6',
  },
];

const statusColors = {
  'PRE-BOOKED': 'bg-yellow-200 text-yellow-900',
  'BOOKED': 'bg-green-200 text-green-900',
  'BIDDING': 'bg-cyan-200 text-cyan-900',
  'COMPLETED': 'bg-emerald-200 text-emerald-900',
  'CANCELLED': 'bg-red-200 text-red-900',
  'NOSHOW': 'bg-orange-200 text-orange-900',
  'NETWORK': 'bg-slate-200 text-slate-900',
};

const DispatchPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(bookings[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateBooking = () => {
    const newBookingId = String(Math.floor(Math.random() * 9000) + 1000);
    const newBooking: Booking = {
      id: newBookingId,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      pta: newBookingId,
      status: 'PRE-BOOKED',
      priority: '5',
      pickup: '',
      destination: '',
      passenger: '',
      fare: 0,
      zone: '',
      notes: '',
      notes2: '',
      notes3: '',
    };
    setBookings([...bookings, newBooking]);
    
    logAction('CREATE', 'BOOKING', 'Booking', newBookingId, `New booking created: ${newBookingId}`, {
      entityName: `Booking ${newBookingId}`,
      description: 'New booking created from dispatch screen',
      level: 'success',
      metadata: { bookingId: newBookingId }
    });
  };

  const statusCounts = {
    prebooked: bookings.filter(b => b.status === 'PRE-BOOKED').length,
    booked: bookings.filter(b => b.status === 'BOOKED').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
    noshow: bookings.filter(b => b.status === 'NOSHOW').length,
    network: bookings.filter(b => b.status === 'NETWORK').length,
    flights: 2,
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 overflow-hidden">
      {/* Top Navigation Bar - Matching iCABBi */}
      <div className="bg-gray-700 border-b border-gray-600 px-3 py-2 flex items-center gap-3 text-xs font-bold text-white h-10">
        <button className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-bold hover:bg-gray-500">DISPATCH</button>
        <button className="px-3 py-1 text-gray-300 text-xs hover:bg-gray-600 rounded">BOOKINGS</button>
        <button className="px-3 py-1 text-gray-300 text-xs hover:bg-gray-600 rounded">DRIVERS</button>
        <button className="px-3 py-1 text-gray-300 text-xs hover:bg-gray-600 rounded">LOGS</button>
        
        <div className="ml-auto flex items-center gap-2 text-xs">
          <span className="text-gray-300">01:19</span>
          <span className="text-gray-300">STAFF MESSAGES</span>
          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded font-bold">CLEAR ZONES (0)</span>
          <span className="px-2 py-0.5 bg-purple-700 text-white text-xs rounded font-bold">DRIVER INACTIVE (0)</span>
          <span className="px-2 py-0.5 bg-gray-600 text-white text-xs rounded font-bold">DRIVER CHAT(0)</span>
          <span className="text-gray-300">MESSAGES</span>
          <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-bold">ALERTS (1)</span>
          <span className="text-gray-300">FLIGHT ALERTS</span>
          <span className="px-2 py-0.5 bg-yellow-500 text-gray-900 text-xs rounded font-bold">1</span>
          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded font-bold">1</span>
          <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-bold">0</span>
        </div>
      </div>

      <div className="flex gap-0 flex-1 overflow-hidden">
        {/* Left Sidebar - Booking Form */}
        <div className="w-96 bg-gray-100 border-r border-gray-400 flex flex-col overflow-hidden">
          <div className="bg-gray-300 px-3 py-1.5 border-b border-gray-400">
            <h3 className="font-bold text-gray-900 text-xs">BOOKING FORM</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 py-1">
            <div className="space-y-1 text-xs">
              <div className="grid grid-cols-3 gap-1">
                <div>
                  <label className="font-bold text-gray-700 block text-xs">DATE:</label>
                  <div className="bg-yellow-300 border border-yellow-600 rounded px-1.5 py-1 text-xs font-bold text-gray-900">
                    MON 03rd
                  </div>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block text-xs">NOW</label>
                  <Input type="time" className="h-6 text-xs bg-white border-gray-400 rounded" defaultValue="01:19" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block text-xs">PRIORITY</label>
                  <Input type="text" placeholder="5" className="h-6 text-xs bg-white border-gray-400 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="font-bold text-gray-700 block text-xs">PH: ⊞</label>
                  <Input placeholder="PHONE [DOUBLE F4]" className="h-6 text-xs bg-white border-gray-400 rounded" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block text-xs">PRIORITY</label>
                  <Input placeholder="" className="h-6 text-xs bg-white border-gray-400 rounded" />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block text-xs">ADDR:</label>
                <Input placeholder="STREET [F2]" className="h-6 text-xs bg-white border-gray-400 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="font-bold text-gray-700 block text-xs">AREA:</label>
                  <Input placeholder="PRICING ZONE" className="h-6 text-xs bg-white border-gray-400 rounded" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block text-xs">ZONE</label>
                  <Input placeholder="" className="h-6 text-xs bg-white border-gray-400 rounded" />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block text-xs">DEST:</label>
                <div className="flex gap-0.5">
                  <Input placeholder="[DOUBLE F2]" className="h-6 text-xs bg-white border-gray-400 rounded flex-1" />
                  <Button className="px-1.5 h-6 text-xs bg-gray-500 text-white border-0 font-bold hover:bg-gray-600 rounded">
                    VIA [F10]
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="font-bold text-gray-700 block text-xs">NAME:</label>
                  <Input placeholder="NAME [F4]" className="h-6 text-xs bg-white border-gray-400 rounded" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block text-xs">EMAIL</label>
                  <Input placeholder="" className="h-6 text-xs bg-white border-gray-400 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="font-bold text-gray-700 block text-xs">INST:</label>
                  <Input placeholder="" className="h-6 text-xs bg-white border-gray-400 rounded" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block text-xs">DRIVER ID</label>
                  <Input placeholder="" className="h-6 text-xs bg-white border-gray-400 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div>
                  <label className="font-bold text-gray-700 block text-xs">ACC:</label>
                  <Input placeholder="ACC" className="h-6 text-xs bg-white border-gray-400 rounded" />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block text-xs">PIN</label>
                  <Input placeholder="PIN" className="h-6 text-xs bg-white border-gray-400 rounded" />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block text-xs">PPL:</label>
                <div className="flex gap-0.5">
                  <Input placeholder="#PPL" className="h-6 text-xs bg-white border-gray-400 rounded flex-1" />
                  <Input placeholder="#TAXI" className="h-6 text-xs bg-white border-gray-400 rounded w-12" />
                  <Input placeholder="VT" className="h-6 text-xs bg-white border-gray-400 rounded w-8" />
                  <Input placeholder="EXTRA" className="h-6 text-xs bg-white border-gray-400 rounded w-12" />
                  <Button className="px-0.5 h-6 text-xs bg-gray-500 text-white border-0 font-bold hover:bg-gray-600 rounded">
                    LEAD [ALT+L]
                  </Button>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block text-xs">SITE:</label>
                <Input placeholder="SITE" className="h-6 text-xs bg-white border-gray-400 rounded" />
              </div>

              <div className="flex gap-0.5 mt-2">
                <Button className="flex-1 h-6 bg-gray-500 hover:bg-gray-600 text-white font-bold text-xs rounded">[F8]</Button>
                <Button className="h-6 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded w-6">●</Button>
                <Button className="flex-1 h-6 bg-gray-500 hover:bg-gray-600 text-white font-bold text-xs rounded">≡</Button>
                <Button className="flex-1 h-6 bg-gray-500 hover:bg-gray-600 text-white font-bold text-xs rounded">⟳</Button>
                <Button className="flex-1 h-6 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded">👥</Button>
              </div>
              <Button className="w-full h-6 bg-gray-600 hover:bg-gray-700 text-white font-bold text-xs rounded">Save Job [F1]</Button>
            </div>
          </div>
        </div>

        {/* Center - Map & ETAs */}
        <div className="flex-1 flex flex-col overflow-hidden bg-emerald-100 relative">
          {/* Map placeholder with Google Maps style */}
          <div className="flex-1 bg-gradient-to-br from-emerald-200 via-green-100 to-cyan-100 relative overflow-hidden">
            {/* Dummy Google Maps style background */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
              {/* Water/Parks */}
              <path d="M 0 200 Q 200 150, 400 200 T 800 200 L 800 500 L 0 500 Z" fill="#9ecae1" opacity="0.5"/>
              <circle cx="150" cy="250" r="35" fill="#6baed6" opacity="0.4"/>
              <circle cx="650" cy="300" r="25" fill="#6baed6" opacity="0.4"/>
              
              {/* Main Roads (highways) */}
              <line x1="50" y1="100" x2="750" y2="100" stroke="#e8b71d" strokeWidth="10" strokeLinecap="round"/>
              <line x1="200" y1="0" x2="200" y2="500" stroke="#e8b71d" strokeWidth="8" strokeLinecap="round"/>
              <line x1="500" y1="50" x2="500" y2="450" stroke="#e8b71d" strokeWidth="8" strokeLinecap="round"/>
              
              {/* Secondary roads */}
              <line x1="0" y1="300" x2="800" y2="300" stroke="#f7f1d3" strokeWidth="4" opacity="0.8"/>
              <line x1="300" y1="0" x2="350" y2="500" stroke="#f7f1d3" strokeWidth="3" opacity="0.8"/>
              
              {/* Green areas/Parks */}
              <rect x="100" y="350" width="150" height="120" fill="#7fb069" opacity="0.6" rx="10"/>
              <circle cx="100" cy="380" r="8" fill="#5a8c3a" opacity="0.5"/>
              <circle cx="140" cy="395" r="6" fill="#5a8c3a" opacity="0.5"/>
              <circle cx="170" cy="420" r="7" fill="#5a8c3a" opacity="0.5"/>
              
              <rect x="600" y="50" width="180" height="150" fill="#7fb069" opacity="0.6" rx="10"/>
              <circle cx="620" cy="80" r="7" fill="#5a8c3a" opacity="0.5"/>
              <circle cx="670" cy="100" r="8" fill="#5a8c3a" opacity="0.5"/>
              <circle cx="740" cy="140" r="6" fill="#5a8c3a" opacity="0.5"/>
              
              {/* Building/POI markers */}
              <rect x="180" y="130" width="12" height="12" fill="#f03b20" opacity="0.8"/>
              <rect x="680" y="70" width="12" height="12" fill="#f03b20" opacity="0.8"/>
              <rect x="420" y="280" width="12" height="12" fill="#f03b20" opacity="0.7"/>
            </svg>
            
            {/* Map controls */}
            <div className="absolute right-3 top-3 flex flex-col gap-1">
              <button className="w-7 h-7 bg-white border border-gray-400 rounded flex items-center justify-center text-sm font-bold hover:bg-gray-50 shadow">+</button>
              <button className="w-7 h-7 bg-white border border-gray-400 rounded flex items-center justify-center text-sm font-bold hover:bg-gray-50 shadow">−</button>
              <button className="w-7 h-7 bg-white border border-gray-400 rounded flex items-center justify-center hover:bg-gray-50 shadow">
                <div className="w-3 h-3 border-2 border-gray-500 rounded-full"></div>
              </button>
            </div>
            
            {/* Map attribution */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-600 bg-white/90 px-2 py-1 rounded shadow text-left">
              <a href="#" className="text-blue-600 hover:underline">Keyboard shortcuts</a><br/>
              Map data ©2025 Google <a href="#" className="text-blue-600 hover:underline">Terms</a> <a href="#" className="text-blue-600 hover:underline">Report error</a>
            </div>
          </div>

          {/* Bottom control panel */}
          <div className="bg-gray-400 border-t border-gray-500 px-2 py-1 flex gap-2 items-center h-9">
            <div className="flex items-center gap-1">
              <button className="px-2 py-0.5 bg-gray-100 border border-gray-500 text-gray-900 rounded text-xs font-bold hover:bg-gray-50 shadow">CLEAR</button>
              <button className="px-2 py-0.5 bg-gray-100 border border-gray-500 text-gray-900 rounded text-xs font-bold hover:bg-gray-50 shadow">OPTIONS</button>
              <button className="px-2 py-0.5 bg-gray-100 border border-gray-500 text-gray-900 rounded text-xs font-bold hover:bg-gray-50 shadow">ZONES</button>
            </div>
            <div className="text-xs text-gray-700 font-bold">ETAs</div>
            <div className="h-5 w-16 bg-yellow-300 rounded border border-yellow-600"></div>
            <div className="text-xs text-gray-700 font-bold ml-2">Parked</div>
            <div className="h-5 w-16 bg-blue-200 rounded border border-blue-400"></div>
            <div className="text-xs text-gray-700 font-bold ml-2">Dropping</div>
            <div className="h-5 w-16 bg-gray-300 rounded border border-gray-500"></div>
            <button className="ml-auto px-1.5 py-0.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 shadow">⬇</button>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-gray-700 border-t border-gray-600 px-2 py-1 flex items-center gap-1 text-xs font-bold text-white h-8">
        <span>DISPATCH 1</span>
        <span className="px-1.5 py-0.5 bg-yellow-400 text-gray-900 rounded">PRE-BOOKED {statusCounts.prebooked}</span>
        <span className="px-1.5 py-0.5 bg-green-400 text-gray-900 rounded">BOOKED {statusCounts.booked}</span>
        <span className="px-1.5 py-0.5 bg-emerald-400 text-gray-900 rounded">COMPLETED {statusCounts.completed}</span>
        <span className="px-1.5 py-0.5 bg-red-400 text-white rounded">CANCELLED {statusCounts.cancelled}</span>
        <span className="px-1.5 py-0.5 bg-orange-400 text-white rounded">NOSHOW {statusCounts.noshow}</span>
        <span className="px-1.5 py-0.5 bg-gray-600 text-white rounded">NETWORK {statusCounts.network}</span>
        <span className="px-1.5 py-0.5 bg-gray-600 text-white rounded">FLIGHTS {statusCounts.flights}</span>
        
        {/* Quick filters */}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-gray-300">DEFAULT</span>
          <button className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs font-bold hover:bg-gray-500">NOW</button>
          <button className="px-1.5 py-0.5 bg-yellow-400 text-gray-900 rounded text-xs font-bold hover:bg-yellow-300">MON</button>
          <button className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs font-bold hover:bg-gray-500">{'>>'} TOMORROW</button>
          <button className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs font-bold hover:bg-gray-500">TUE</button>
          <span className="px-1.5 py-0.5 bg-red-600 text-white rounded text-xs font-bold">🚫 REC JOBS</span>
          <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-xs font-bold">🎫 TKT JOBS</span>
          <span className="px-1.5 py-0.5 bg-red-600 text-white rounded text-xs font-bold">❌ GROUPS</span>
          <button className="px-1.5 py-0.5 bg-gray-600 text-white rounded text-xs font-bold hover:bg-gray-500">⟳</button>
        </div>
      </div>

      {/* Job Queue Table at Bottom */}
      <div className="bg-white border-t border-gray-400 overflow-x-auto h-20 shadow-md">
        <table className="w-full text-xs font-semibold border-collapse">
          <thead>
            <tr className="bg-gray-300 border-b-2 border-gray-500">
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">Time</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">PTA</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">P</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">✓</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">N</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">Update</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">Drv</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">Info</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">Pickup</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">V</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">Dest</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">Acc</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">Name</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">Phone</th>
              <th className="px-1.5 py-0.5 text-left border-r border-gray-400 text-gray-900">Zone</th>
              <th className="px-1.5 py-0.5 text-left text-gray-900">Z...</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                onClick={() => setSelectedBooking(booking)}
                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer text-gray-700"
              >
                <td className={`px-1.5 py-0.5 border-r border-gray-300 font-bold ${booking.status === 'BIDDING' ? 'bg-red-400 text-white' : 'text-gray-900'}`}>
                  {booking.time}
                </td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 text-gray-700">{booking.pta}</td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 text-gray-700">{booking.priority}</td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 text-center">
                  {booking.status === 'BIDDING' ? '🟢' : ''}
                </td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 text-gray-600">-</td>
                <td className="px-1.5 py-0.5 border-r border-gray-300">
                  <span className={`px-1 rounded text-xs font-bold ${statusColors[booking.status]}`}>
                    {booking.status === 'PRE-BOOKED' ? '📋' : booking.status === 'BIDDING' ? '🎯' : booking.status === 'BOOKED' ? '✓' : booking.status}
                  </span>
                </td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 text-gray-700">{booking.driver || ''}</td>
                <td className="px-1.5 py-0.5 border-r border-gray-300">
                  <button className="text-blue-600 hover:underline text-xs font-bold">ℹ</button>
                </td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 bg-red-300 font-bold text-red-900 truncate max-w-xs text-xs">
                  {booking.pickup}
                </td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 text-gray-700 text-xs">{booking.distance || ''}</td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 bg-red-300 font-bold text-red-900 truncate max-w-xs text-xs">
                  {booking.destination}
                </td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 text-gray-700">-</td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 text-red-600 font-bold">-</td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 text-gray-700 text-xs">{booking.passenger}</td>
                <td className="px-1.5 py-0.5 border-r border-gray-300 text-gray-700 text-xs">{booking.zone}</td>
                <td className="px-1.5 py-0.5 font-bold text-gray-900">£{booking.fare.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DispatchPage;
