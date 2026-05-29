import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bRes, vRes] = await Promise.all([
                    api.get('/slots/my-bookings'),
                    api.get('/vehicles/')
                ]);
                setBookings(bRes.data);
                setVehicles(vRes.data);
            } catch (e) { console.error(e); }
        };
        fetchData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Booked': return 'bg-blue-100 text-blue-700';
            case 'In Service': return 'bg-yellow-100 text-yellow-700';
            case 'Completed': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <Layout>
            {/* Welcome Banner with Wave Background */}
            <div className="relative mb-8 -mx-6 -mt-6 px-6 pt-6 pb-12 bg-gradient-to-r from-primary to-purple-700 text-white overflow-hidden">
                {/* Wave SVG Background */}
                <svg className="absolute bottom-0 left-0 w-full h-24" viewBox="0 0 1440 120" preserveAspectRatio="none">
                    <path
                        fill="rgba(255, 255, 255, 0.1)"
                        d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
                    />
                </svg>
                <div className="relative z-10">
                    <h1 className="text-3xl font-heading font-bold mb-2">Welcome, {user?.name || 'User'}!</h1>
                    <p className="text-white/90">Here's what's happening with your vehicles.</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Link to="/book-service" className="bg-primary text-white p-4 rounded-xl shadow-lg hover:bg-purple-700 transition-transform transform hover:-translate-y-1">
                    <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="font-heading font-bold">Book Service</div>
                </Link>
                <Link to="/ai-check" className="bg-white text-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-transform transform hover:-translate-y-1">
                    <svg className="w-8 h-8 mb-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    <div className="font-heading font-bold">AI Health Check</div>
                </Link>
                <Link to="/vehicles" className="bg-white text-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-transform transform hover:-translate-y-1">
                    <svg className="w-8 h-8 mb-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <div className="font-heading font-bold">Add Vehicle</div>
                </Link>
                <Link to="/track-status" className="bg-white text-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-transform transform hover:-translate-y-1">
                    <svg className="w-8 h-8 mb-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="font-heading font-bold">Track Status</div>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Bookings */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
                    {bookings.length > 0 ? (
                        bookings.map(b => (
                            <div key={b.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold mr-3 ${getStatusColor(b.status)}`}>
                                            {b.status}
                                        </span>
                                        <span className="text-gray-400 text-sm">{b.date} at {b.time}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">{b.service}</h3>
                                    <p className="text-gray-500">{b.vehicle}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-primary">₹{b.cost}</p>
                                    <button className="text-sm text-gray-400 underline hover:text-primary mt-1">View Details</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-8 rounded-xl text-center border border-dashed border-gray-300">
                            <p className="text-gray-500">No upcoming bookings.</p>
                            <Link to="/book-service" className="text-primary font-bold mt-2 inline-block">Book Now</Link>
                        </div>
                    )}
                </div>

                {/* Notifications & AI Insights */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Notifications</h2>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Booking Confirmed</p>
                                    <p className="text-xs text-gray-500">Your slot for tomorrow is confirmed.</p>
                                </div>
                            </div>
                            {/* Mock more */}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl text-white shadow-lg">
                        <h2 className="text-xl font-bold mb-2">AI Insights</h2>
                        <p className="text-gray-400 text-sm mb-4">Based on your last checkup</p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                                <span>Oil Life</span>
                                <span className="text-green-400 font-bold">Good</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg">
                                <span>Brake Pads</span>
                                <span className="text-yellow-400 font-bold">Check Soon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
