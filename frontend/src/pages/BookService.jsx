import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';

const BookService = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data
    const [vehicles, setVehicles] = useState([]);
    const [services, setServices] = useState([]);
    const [centers, setCenters] = useState([]);
    const [slots, setSlots] = useState([]);

    // Selection
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedCenter, setSelectedCenter] = useState(null);

    // Geolocation & Search
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVehicles();
        fetchServices();
        fetchCenters();

        // Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    const fetchVehicles = async () => {
        try { const res = await api.get('/vehicles/'); setVehicles(res.data); } catch (e) { }
    };
    const fetchServices = async () => {
        try { const res = await api.get('/services/'); setServices(res.data); } catch (e) { }
    };
    const fetchCenters = async () => {
        try { const res = await api.get('/services/centers'); setCenters(res.data); } catch (e) { }
    };
    const fetchSlots = async (date) => {
        try {
            const res = await api.get(`/slots/available?date=${date}`);
            setSlots(res.data);
        } catch (e) { }
    };

    const handleServiceToggle = (service) => {
        if (selectedServices.find(s => s.id === service.id)) {
            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();

        if (date === today && now.getHours() >= 21) {
            alert("Bookings for today are closed after 9 PM. Please select a future date.");
            return;
        }

        setSelectedDate(date);
        fetchSlots(date);
        setSelectedSlot(null);
    };

    const getTotalCost = () => {
        return selectedServices.reduce((sum, s) => sum + s.base_cost, 0);
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await api.post('/slots/book', {
                vehicle_id: selectedVehicle.id,
                service_type_ids: selectedServices.map(s => s.id),
                slot_id: selectedSlot.id
            });
            alert('Booking Confirmed!');
            navigate('/dashboard');
        } catch (err) {
            alert('Booking Failed');
        } finally {
            setLoading(false);
        }
    };

    // Distance calculation using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    // Filter and Sort Centers
    const getProcessedCenters = () => {
        let processed = centers.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.location.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (userLocation) {
            processed = processed.map(c => ({
                ...c,
                distance: calculateDistance(userLocation.lat, userLocation.lng, c.latitude, c.longitude)
            }));

            // Sort by distance
            processed.sort((a, b) => a.distance - b.distance);
        }

        return processed;
    };

    const processedCenters = getProcessedCenters();
    const nearbyCenters = userLocation ? processedCenters.filter(c => c.distance < 7) : [];
    const otherCenters = userLocation ? processedCenters.filter(c => c.distance >= 7) : processedCenters;

    const today = new Date().toISOString().split('T')[0];

    const renderCenterCard = (center) => (
        <div
            key={center.id}
            onClick={() => setSelectedCenter(center)}
            className={`p-4 border-2 rounded-xl cursor-pointer flex items-start transition-all ${selectedCenter?.id === center.id ? 'border-primary bg-purple-50' : 'border-gray-100 hover:border-purple-200'
                }`}
        >
            <div className="mr-4 text-2xl">🏢</div>
            <div className="flex-1">
                <h3 className="font-bold">{center.name}</h3>
                <p className="text-sm text-gray-500">{center.location}</p>
                {center.distance !== undefined && (
                    <p className="text-xs text-primary font-medium mt-1">
                        📍 {center.distance.toFixed(1)} km away
                    </p>
                )}
                <p className="text-xs text-green-600 mt-1">Available</p>
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                {/* Progress Bar */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10"></div>
                    {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-white text-gray-400 border-2 border-gray-200'
                            }`}>
                            {s}
                        </div>
                    ))}
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 min-h-[400px]">
                    {step === 1 && (
                        <div>
                            <h2 className="text-2xl font-heading font-bold mb-6">Select Vehicle</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {vehicles.map(v => (
                                    <div
                                        key={v.id}
                                        onClick={() => setSelectedVehicle(v)}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedVehicle?.id === v.id ? 'border-primary bg-purple-50' : 'border-gray-100 hover:border-purple-200'
                                            }`}
                                    >
                                        <h3 className="font-bold">{v.make} {v.model}</h3>
                                        <p className="text-sm text-gray-500">{v.reg_no}</p>
                                    </div>
                                ))}
                                <div
                                    onClick={() => navigate('/vehicles')}
                                    className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-primary hover:text-primary transition-colors"
                                >
                                    + Add New Vehicle
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 className="text-2xl font-heading font-bold mb-6">Select Services</h2>
                            <p className="text-sm text-gray-500 mb-4">Select one or more services for your vehicle.</p>
                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {services.map(s => {
                                    const isSelected = selectedServices.find(sel => sel.id === s.id);
                                    return (
                                        <div
                                            key={s.id}
                                            onClick={() => handleServiceToggle(s)}
                                            className={`p-4 border-2 rounded-xl cursor-pointer flex justify-between items-center transition-all ${isSelected ? 'border-primary bg-purple-50' : 'border-gray-100 hover:border-purple-200'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                                    {isSelected && <span className="text-white text-xs">✓</span>}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold">{s.name}</h3>
                                                    <p className="text-sm text-gray-500">{s.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-primary">₹{s.base_cost}</p>
                                                <p className="text-xs text-gray-400">{s.duration_mins} mins</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 text-right">
                                <p className="text-lg font-bold">Total: <span className="text-primary">₹{getTotalCost()}</span></p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h2 className="text-2xl font-heading font-bold mb-6">Choose Date & Time</h2>
                            <input
                                type="date"
                                min={today}
                                className="w-full p-3 border rounded-lg mb-6"
                                value={selectedDate}
                                onChange={handleDateChange}
                            />
                            {selectedDate && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {slots.length > 0 ? slots.map(slot => (
                                        <button
                                            key={slot.id}
                                            disabled={slot.available === 0}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`p-3 rounded-lg text-sm font-medium transition-all ${selectedSlot?.id === slot.id
                                                ? 'bg-primary text-white shadow-lg'
                                                : slot.available === 0
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white border border-gray-200 hover:border-primary text-gray-700'
                                                }`}
                                        >
                                            {slot.time}
                                            <span className="block text-xs font-normal opacity-75">{slot.available} left</span>
                                        </button>
                                    )) : <p className="text-gray-500 col-span-4 text-center">No slots available.</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <h2 className="text-2xl font-heading font-bold mb-4">Select Service Center</h2>

                            {/* Search Bar */}
                            <div className="mb-6">
                                <input
                                    type="text"
                                    placeholder="🔍 Search service centers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            <div className="space-y-6 max-h-[500px] overflow-y-auto">
                                {/* Nearby Centers (< 7km) */}
                                {userLocation && nearbyCenters.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-primary mb-3 flex items-center">
                                            <span className="mr-2">📍</span>
                                            Nearby Service Centers (Within 7 km)
                                        </h3>
                                        <div className="space-y-3">
                                            {nearbyCenters.map(renderCenterCard)}
                                        </div>
                                    </div>
                                )}

                                {/* Other Centers */}
                                {otherCenters.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-700 mb-3 mt-6">
                                            {userLocation && nearbyCenters.length > 0
                                                ? "Other Service Centers"
                                                : "All Service Centers"}
                                        </h3>
                                        <div className="space-y-3">
                                            {otherCenters.map(renderCenterCard)}
                                        </div>
                                    </div>
                                )}

                                {/* No Results */}
                                {processedCenters.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No service centers found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div>
                            <h2 className="text-2xl font-heading font-bold mb-6">Confirm Booking</h2>
                            <div className="bg-gray-50 p-6 rounded-xl space-y-4 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Vehicle</span>
                                    <span className="font-medium">{selectedVehicle?.make} {selectedVehicle?.model}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-500">Services</span>
                                    <div className="text-right">
                                        {selectedServices.map(s => (
                                            <div key={s.id} className="font-medium">{s.name}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date & Time</span>
                                    <span className="font-medium">{selectedDate} at {selectedSlot?.time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Center</span>
                                    <span className="font-medium">{selectedCenter?.name}</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between items-center">
                                    <span className="text-lg font-bold">Total Estimate</span>
                                    <span className="text-2xl font-bold text-primary">₹{getTotalCost()}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-purple-700 shadow-lg transition-transform transform hover:scale-[1.02]"
                            >
                                {loading ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className={`px-6 py-2 rounded-lg font-medium ${step === 1 ? 'invisible' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        Back
                    </button>
                    <button
                        onClick={() => setStep(s => Math.min(5, s + 1))}
                        disabled={step === 5 ||
                            (step === 1 && !selectedVehicle) ||
                            (step === 2 && selectedServices.length === 0) ||
                            (step === 3 && !selectedSlot) ||
                            (step === 4 && !selectedCenter)
                        }
                        className={`px-6 py-2 rounded-lg font-medium ${step === 5 ? 'invisible' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default BookService;
