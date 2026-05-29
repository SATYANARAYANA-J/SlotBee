import { useState } from 'react';
import api from '../api/axios';
import Layout from '../components/Layout';

const AICheck = () => {
    const [formData, setFormData] = useState({
        kms_driven: '',
        last_service_kms: '',
        oil_level: 'Normal',
        engine_temp: '',
        battery_voltage: '',
        brake_condition: 10
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/slots/analyze', formData);
            setResult(res.data);
        } catch (err) {
            alert('Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Health Predictor</h1>
                <p className="text-gray-500 mb-8">Enter your vehicle's current diagnostics for an instant health report.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Odometer (km)</label>
                                <input type="number" className="w-full p-3 border rounded-lg" value={formData.kms_driven} onChange={e => setFormData({ ...formData, kms_driven: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Service Odometer (km)</label>
                                <input type="number" className="w-full p-3 border rounded-lg" value={formData.last_service_kms} onChange={e => setFormData({ ...formData, last_service_kms: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Engine Oil Level</label>
                                <select className="w-full p-3 border rounded-lg" value={formData.oil_level} onChange={e => setFormData({ ...formData, oil_level: e.target.value })}>
                                    <option value="Normal">Normal</option>
                                    <option value="Low">Low</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Engine Temp (°C)</label>
                                    <input type="number" className="w-full p-3 border rounded-lg" value={formData.engine_temp} onChange={e => setFormData({ ...formData, engine_temp: e.target.value })} placeholder="90" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Battery (V)</label>
                                    <input type="number" step="0.1" className="w-full p-3 border rounded-lg" value={formData.battery_voltage} onChange={e => setFormData({ ...formData, battery_voltage: e.target.value })} placeholder="12.6" required />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brake Condition (0-10)</label>
                                <input type="range" min="0" max="10" className="w-full" value={formData.brake_condition} onChange={e => setFormData({ ...formData, brake_condition: e.target.value })} />
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Worn Out (0)</span>
                                    <span>Brand New (10)</span>
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
                                {loading ? 'Analyzing...' : 'Run Diagnostics'}
                            </button>
                        </form>
                    </div>

                    {result && (
                        <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-primary">
                            <div className="text-center mb-6">
                                <div className="text-5xl font-bold text-gray-800 mb-2">{result.health_score}<span className="text-2xl text-gray-400">/100</span></div>
                                <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${result.health_status === 'Good' ? 'bg-green-100 text-green-700' :
                                        result.health_status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {result.health_status}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">Issues Detected</h3>
                                    {result.issues_detected.length > 0 ? (
                                        <ul className="space-y-2">
                                            {result.issues_detected.map((issue, i) => (
                                                <li key={i} className="flex items-center text-red-600 bg-red-50 p-2 rounded">
                                                    <span className="mr-2">⚠️</span> {issue}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-green-600 flex items-center"><span className="mr-2">✅</span> No major issues found.</p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">Recommended Actions</h3>
                                    {result.recommendations.length > 0 ? (
                                        <div className="grid gap-2">
                                            {result.recommendations.map((rec, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                                                    <span className="font-medium text-gray-700">{rec}</span>
                                                    <button className="text-sm text-primary font-bold">Book Now</button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">Routine maintenance is all you need.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AICheck;
