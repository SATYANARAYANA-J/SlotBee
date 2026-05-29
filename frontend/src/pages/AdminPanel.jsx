import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

const AdminPanel = () => {
    const [stats, setStats] = useState({ total_bookings_today: 0, serviced_total: 0, pending_active: 0 });
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchStats();
        fetchBookings();
    }, [filter]);

    const fetchStats = async () => {
        try { const res = await api.get('/admin/stats'); setStats(res.data); } catch (e) { }
    };

    const fetchBookings = async () => {
        try {
            const url = filter ? `/admin/bookings?status=${filter}` : '/admin/bookings';
            const res = await api.get(url);
            setBookings(res.data);
        } catch (e) { }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/admin/bookings/${id}/status`, { status: newStatus });
            fetchBookings();
            fetchStats();
        } catch (e) { alert('Update failed'); }
    };

    const handleSeed = async () => {
        try { await api.post('/admin/seed-slots'); alert('Slots seeded'); } catch (e) { }
    };

    const handleSeedServices = async () => {
        try { await api.post('/services/seed'); alert('Services seeded'); } catch (e) { }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <div className="space-x-2">
                    <button onClick={handleSeed} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">Seed Slots</button>
                    <button onClick={handleSeedServices} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm">Seed Services</button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Bookings Today</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.total_bookings_today}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Active / Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending_active}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-sm">Completed Services</p>
                    <p className="text-3xl font-bold text-green-600">{stats.serviced_total}</p>
                </div>
            </div>

            {/* Booking Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Manage Bookings</h2>
                    <select
                        className="p-2 border rounded-lg"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Booked">Booked</option>
                        <option value="In Service">In Service</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Vehicle</th>
                                <th className="p-4">Service</th>
                                <th className="p-4">Date/Time</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.map(b => (
                                <tr key={b.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">#{b.id}</td>
                                    <td className="p-4">{b.user}</td>
                                    <td className="p-4 text-sm">{b.vehicle}</td>
                                    <td className="p-4">{b.service}</td>
                                    <td className="p-4 text-sm">{b.date} {b.time}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${b.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                b.status === 'In Service' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            className="text-sm border rounded p-1"
                                            value={b.status}
                                            onChange={(e) => updateStatus(b.id, e.target.value)}
                                        >
                                            <option value="Booked">Booked</option>
                                            <option value="Assigned">Assigned</option>
                                            <option value="In Service">In Service</option>
                                            <option value="Wash & Clean">Wash & Clean</option>
                                            <option value="Ready">Ready</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default AdminPanel;
