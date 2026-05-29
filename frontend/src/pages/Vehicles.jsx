import { useState, useEffect } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        make: '', model: '', year: '', reg_no: '', fuel_type: '', kms_driven: ''
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const res = await api.get('/vehicles/');
            setVehicles(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/vehicles/', formData);
            setShowForm(false);
            fetchVehicles();
            setFormData({ make: '', model: '', year: '', reg_no: '', fuel_type: '', kms_driven: '' });
        } catch (err) {
            alert('Failed to add vehicle');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await api.delete(`/vehicles/${id}`);
                fetchVehicles();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Vehicles</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-md transition-all"
                >
                    {showForm ? 'Cancel' : '+ Add Vehicle'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Vehicle</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input placeholder="Make (e.g. Hyundai)" className="p-3 border rounded-lg" value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} required />
                        <input placeholder="Model (e.g. i20)" className="p-3 border rounded-lg" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} required />
                        <input placeholder="Year" type="number" className="p-3 border rounded-lg" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required />
                        <input placeholder="Reg No (AP 31 BM 9281)" className="p-3 border rounded-lg" value={formData.reg_no} onChange={e => setFormData({ ...formData, reg_no: e.target.value })} required />
                        <select className="p-3 border rounded-lg" value={formData.fuel_type} onChange={e => setFormData({ ...formData, fuel_type: e.target.value })} required>
                            <option value="">Select Fuel Type</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="CNG">CNG</option>
                        </select>
                        <input placeholder="KMs Driven" type="number" className="p-3 border rounded-lg" value={formData.kms_driven} onChange={e => setFormData({ ...formData, kms_driven: e.target.value })} required />
                        <button type="submit" className="col-span-2 bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900">Save Vehicle</button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map(v => (
                    <div key={v.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{v.make} {v.model}</h3>
                                <p className="text-sm text-gray-500">{v.reg_no}</p>
                            </div>
                            <span className="bg-purple-50 text-primary px-3 py-1 rounded-full text-xs font-medium">{v.fuel_type}</span>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>📅 Year: {v.year}</p>
                            <p>🛣️ Driven: {v.kms_driven} km</p>
                            <p>🔧 Last Service: {v.last_service_date || 'N/A'}</p>
                        </div>
                        <div className="mt-6 flex space-x-3">
                            <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">Edit</button>
                            <button onClick={() => handleDelete(v.id)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 text-sm font-medium">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default Vehicles;
