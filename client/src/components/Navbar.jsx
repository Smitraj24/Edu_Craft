import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import { 
  Menu, X, LogOut, User, Layout, 
  BookOpen, GraduationCap, 
  ChevronDown, Bell, Search, Box, Heart
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { wishlist } = useContext(WishlistContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const wishlistCount = wishlist.length;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => { 
        setIsMenuOpen(false); 
        setIsProfileOpen(false); 
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Explore', path: '/courses', icon: Search },
    ];

    if (user) {
        navLinks.push({ 
            name: 'Dashboard', 
            path: user.role === 'admin' ? '/admin/dashboard' : user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard', 
            icon: Layout 
        });
    }

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-[#1e293b]/90 backdrop-blur-md border-b border-slate-700 shadow-lg h-20' : 'bg-transparent h-24'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-glow transition-transform group-hover:scale-110">
                        <GraduationCap size={24} />
                    </div>
                    <span className="text-2xl font-extrabold text-white tracking-tight uppercase">EDUCRAFT</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path} 
                                to={link.path} 
                                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all hover:text-white ${location.pathname === link.path ? 'text-primary' : 'text-slate-400'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="h-6 w-px bg-slate-700 mx-2"></div>

                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link to="/wishlist" className="relative p-2 text-slate-400 hover:text-white transition-all">
                                <Heart size={22} />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                            <div className="relative">
                                <button 
                                    className="flex items-center gap-3 p-1.5 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition-all group"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-white pr-1">{user.name.split(' ')[0]}</span>
                                    <ChevronDown size={14} className={`text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute top-[calc(100%+12px)] right-0 w-64 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in duration-200">
                                        <div className="p-4 border-b border-slate-700/50 mb-2">
                                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                            <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
                                        </div>
                                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                                            <User size={18} /> My Profile
                                        </Link>
                                        <button 
                                            onClick={handleLogout} 
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all mt-1"
                                        >
                                            <LogOut size={18} /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-all px-4">Sign In</Link>
                            <Link to="/login?register=true" className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                Join EduCraft
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Trigger */}
                <button 
                    className="md:hidden p-2 text-white bg-slate-800 border border-slate-700 rounded-xl"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 top-24 z-[110] bg-[#0f172a] p-6 flex flex-col md:hidden">
                    <div className="space-y-4">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path} 
                                to={link.path} 
                                className="flex items-center gap-4 p-5 bg-[#1e293b] border border-slate-700 rounded-2xl text-lg font-bold text-white"
                            >
                                <link.icon size={24} className="text-primary" />
                                {link.name}
                            </Link>
                        ))}
                        {user && (
                            <Link to="/wishlist" className="flex items-center gap-4 p-5 bg-[#1e293b] border border-slate-700 rounded-2xl text-lg font-bold text-white">
                                <Heart size={24} className="text-primary" />
                                Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                            </Link>
                        )}
                    </div>

                    <div className="mt-auto pb-10 space-y-4">
                        {user ? (
                            <>
                                <Link to="/profile" className="flex items-center gap-4 p-5 bg-[#1e293b] border border-slate-700 rounded-2xl text-lg font-bold text-white">
                                    <User size={24} /> Profile
                                </Link>
                                <button 
                                    onClick={handleLogout} 
                                    className="w-full flex items-center gap-4 p-5 bg-red-400/10 border border-red-400/20 rounded-2xl text-lg font-bold text-red-400"
                                >
                                    <LogOut size={24} /> Sign Out
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="w-full bg-primary py-5 rounded-2xl text-center text-lg font-bold text-white shadow-xl">
                                Join EduCraft
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
