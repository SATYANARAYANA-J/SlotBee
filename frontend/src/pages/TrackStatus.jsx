import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

const TrackStatus = () => {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/slots/my-bookings');
                setBookings(res.data.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled'));
            } catch (e) { console.error(e); }
        };
        fetchBookings();
    }, []);

    const steps = ['Booked', 'Assigned', 'In Service', 'Wash & Clean', 'Ready'];

    const getProgress = (status) => {
        const idx = steps.indexOf(status);
        return idx === -1 ? 0 : ((idx + 1) / steps.length) * 100;
    };

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Live Service Tracking</h1>

            {bookings.length > 0 ? (
                bookings.map(b => (
                    <div key={b.id} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{b.service}</h2>
                                <p className="text-gray-500">{b.vehicle}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Estimated Completion</p>
                                <p className="text-xl font-bold text-primary">04:30 PM</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative mb-8">
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                                <div style={{ width: `${getProgress(b.status)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"></div>
                            </div>
                            <div className="flex justify-between text-xs font-medium text-gray-500">
                                {steps.map((step, i) => (
                                    <div key={step} className={`text-center ${b.status === step ? 'text-primary font-bold' : ''}`}>
                                        {step}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl mr-4">
                                👨‍🔧
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Technician Assigned</p>
                                <p className="text-sm text-gray-500">Rajesh Kumar is working on your vehicle.</p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500">No active services to track.</p>
                </div>
            )}
        </Layout>
    );
};

export default TrackStatus;
