import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { 
  Users, BookOpen, CheckSquare, 
  Layers, BarChart3, DollarSign,
  TrendingUp, ShieldCheck, Mail,
  Activity, Zap, Settings, 
  ChevronRight, LayoutDashboard,
  ShieldAlert, Database, Server
} from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalInstructors: 0,
        totalCourses: 0,
        totalRevenue: 0,
        recentEnrollments: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/api/admin/dashboard');
                setStats(data);
            } catch (err) {
                console.error('Failed to load admin data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchStats();
        
        // Polling for real-time updates every 30 seconds
        const intervalId = setInterval(fetchStats, 30000);
        
        return () => clearInterval(intervalId);
    }, []);

    const adminModules = [
        { 
            title: 'Manage Users', 
            icon: <Users size={28} />, 
            link: '/admin/users', 
            desc: 'View and manage all user accounts and roles.', 
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        { 
            title: 'Course Approval', 
            icon: <CheckSquare size={28} />, 
            link: '/admin/courses', 
            desc: 'Review and approve pending course submissions.', 
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        { 
            title: 'Categories', 
            icon: <Layers size={28} />, 
            link: '/admin/categories', 
            desc: 'Manage course categories and organization.', 
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        { 
            title: 'Platform Reports', 
            icon: <BarChart3 size={28} />, 
            link: '/admin/reports', 
            desc: 'View detailed financial and growth analytics.', 
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        }
    ];

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <header className="mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                                Global Administrator Hub
                            </span>
                        </div>
                        <h1 className="text-5xl font-extrabold text-white tracking-tight leading-none mb-4 uppercase">
                            Platform Control
                        </h1>
                        <p className="text-slate-400 text-xl font-medium max-w-2xl">
                            Monitoring <span className="text-white font-bold">{stats.totalStudents + stats.totalInstructors} users</span> across the entire learning ecosystem.
                        </p>
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate('/admin/courses/create')}
                            className="bg-primary text-white h-16 px-8 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-3"
                        >
                            <BookOpen size={20} /> Create Course
                        </button>
                        <button className="bg-[#1e293b] border border-slate-700 text-white h-16 px-8 rounded-2xl font-bold text-sm shadow-xl hover:bg-slate-700 transition-all flex items-center gap-3">
                            <Database size={20} className="text-primary" /> Backup Database
                        </button>
                    </div>
                </header>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {[
                        { label: 'Total Users', value: stats.totalStudents + stats.totalInstructors, icon: Users, color: 'text-primary' },
                        { label: 'Live Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-emerald-500' },
                        { label: 'Platform Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-500' },
                        { label: 'System Health', value: '100%', icon: Activity, color: 'text-purple-500' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-700/50 shadow-lg group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 bg-[#0f172a] rounded-2xl border border-slate-700 ${stat.color} shadow-inner`}>
                                    <stat.icon size={24} />
                                </div>
                                <TrendingUp size={20} className="text-slate-700 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-white mb-1">{stat.value}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Management Modules */}
                <section className="mb-20">
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-700/50">
                        <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight">Administrative Tools</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {adminModules.map((module, idx) => (
                            <Link 
                                key={idx} 
                                to={module.link}
                                className="bg-[#1e293b] p-10 rounded-[3rem] group border border-slate-700/50 hover:bg-[#243147] hover:border-slate-600 transition-all relative overflow-hidden shadow-xl"
                            >
                                <div className={`p-5 rounded-2xl w-fit mb-8 ${module.bg} ${module.color} group-hover:scale-110 transition-transform shadow-lg`}>
                                    {module.icon}
                                </div>
                                <h4 className="font-bold text-2xl text-white tracking-tight mb-4 flex items-center justify-between">
                                    {module.title}
                                    <ChevronRight size={24} className="text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </h4>
                                <p className="text-slate-400 text-sm leading-relaxed font-medium">{module.desc}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Recent Activity Table */}
                <section>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-6 border-b border-slate-700/50 gap-6">
                        <h2 className="text-2xl font-extrabold text-white uppercase tracking-tight flex items-center gap-3">
                            <Activity className="text-primary" /> Global Activity Log
                        </h2>
                        <Link to="/admin/reports" className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
                            View Full Audit Log <ChevronRight size={16} />
                        </Link>
                    </div>

                    <div className="bg-[#1e293b] rounded-[3rem] overflow-hidden border border-slate-700/50 shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#0f172a] border-b border-slate-700">
                                        <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500">Student Info</th>
                                        <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500">Enrolled In</th>
                                        <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {stats.recentEnrollments.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-10 py-32 text-center">
                                                <div className="flex flex-col items-center gap-8 text-slate-700">
                                                    <ShieldAlert size={64} />
                                                    <p className="text-xs font-bold uppercase tracking-widest">No recent enrollment activity detected.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : stats.recentEnrollments.map((enrollment) => (
                                        <tr key={enrollment._id} className="hover:bg-[#243147] transition-all group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                                                        {enrollment.student?.name?.substring(0, 1) || '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-lg group-hover:text-primary transition-colors">{enrollment.student?.name || 'Unknown User'}</div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                            <Mail size={12} /> {enrollment.student?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-white font-bold text-base mb-1">{enrollment.course?.title || 'Deleted Course'}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Transaction ID: {enrollment._id.substring(0, 8).toUpperCase()}</div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="text-white font-bold text-sm mb-1">
                                                    {new Date(enrollment.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                    {new Date(enrollment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;
