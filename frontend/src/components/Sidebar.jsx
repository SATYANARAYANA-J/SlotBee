import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Book Service', path: '/book-service' },
        { name: 'My Bookings', path: '/my-bookings' },
        { name: 'My Vehicles', path: '/vehicles' },
        { name: 'AI Health Check', path: '/ai-check' },
        { name: 'Track Status', path: '/track-status' },
        { name: 'Notifications', path: '/notifications' },
    ];

    if (user?.isAdmin) {
        navItems.push({ name: 'Admin Panel', path: '/admin' });
    }

    return (
        <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-heading font-bold text-primary">SlotBee</h1>
                <p className="text-xs text-gray-500 mt-1">Premium Car Care</p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.path)
                            ? 'bg-primary text-white shadow-lg shadow-red-200'
                            : 'text-gray-600 hover:bg-red-50 hover:text-primary'
                            }`}
                    >
                        <span className="font-medium">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-primary font-bold">
                        {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-bold text-gray-800">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user?.isAdmin ? 'Admin' : 'Customer'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
