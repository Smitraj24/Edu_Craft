import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { 
  CheckCircle, XCircle, Clock, 
  Search, Filter, ArrowLeft,
  BookOpen, User, Tag, 
  Eye, MoreVertical,
  ShieldCheck, ShieldAlert, 
  ChevronRight, Layers, Trash2
} from 'lucide-react';

const CourseApproval = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/courses/admin/all?limit=50`);
            setCourses(data.courses);
        } catch (err) {
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleStatusChange = async (courseId, newStatus) => {
        const action = newStatus === 'approved' ? 'Approve' : 'Reject';
        if (window.confirm(`Are you sure you want to ${action} this course?`)) {
            try {
                await api.put(`/api/courses/${courseId}/status`, { status: newStatus });
                toast.success(`Course ${newStatus} successfully`);
                fetchCourses();
            } catch (err) {
                toast.error('Failed to update course status');
            }
        }
    };

    const filteredCourses = courses.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <header className="mb-12">
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/20">
                                    Quality Control
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">Course Approvals</h1>
                            <p className="text-slate-400 text-lg mt-2">Review and manage course submissions across the platform.</p>
                        </div>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by course title or instructor..."
                            className="w-full bg-[#1e293b] border border-slate-700 h-16 pl-16 pr-8 rounded-2xl text-white font-bold placeholder:text-slate-600 focus:border-primary outline-none transition-all shadow-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate('/admin/courses/create')}
                            className="bg-primary text-white h-16 px-8 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-3"
                        >
                            <BookOpen size={20} /> Create Course
                        </button>
                        <button className="bg-[#1e293b] border border-slate-700 text-white h-16 px-8 rounded-2xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center gap-3 shadow-xl">
                            <Filter size={20} className="text-primary" /> Filter
                        </button>
                    </div>
                </div>

                {/* Courses Table */}
                <div className="bg-[#1e293b] rounded-[3rem] border border-slate-700/50 shadow-2xl overflow-hidden">
                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center gap-6">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Scanning Courses...</p>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="py-32 text-center">
                            <div className="flex flex-col items-center gap-6 text-slate-700 max-w-xs mx-auto">
                                <Layers size={64} />
                                <p className="text-xs font-bold uppercase tracking-widest text-center">No pending courses found in the current queue.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#0f172a] border-b border-slate-700">
                                        <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500">Course Details</th>
                                        <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500">Instructor</th>
                                        <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                                        <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {filteredCourses.map((course) => (
                                        <tr key={course._id} className="hover:bg-[#243147] transition-all group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-[#0f172a] border border-slate-700 overflow-hidden shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                                                        {course.thumbnail ? (
                                                            <img src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-primary font-extrabold uppercase bg-primary/10 tracking-widest text-lg">
                                                                {course.title.substring(0, 2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-lg group-hover:text-primary transition-colors line-clamp-1">{course.title}</div>
                                                        <div className="text-[10px] text-slate-500 flex items-center gap-2 font-bold uppercase tracking-widest mt-1">
                                                            Category: <span className="text-secondary">{course.category}</span> • ID: {course._id.substring(0, 8).toUpperCase()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center text-[10px] font-bold border border-slate-700 text-white">
                                                        {course.instructor?.name?.charAt(0) || '?'}
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-300 uppercase tracking-tight">{course.instructor?.name || 'Unknown Instructor'}</div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="w-fit">
                                                    {course.status === 'approved' ? (
                                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                            <CheckCircle size={12} /> Approved
                                                        </span>
                                                    ) : course.status === 'rejected' ? (
                                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                            <XCircle size={12} /> Rejected
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                            <Clock size={12} className="animate-pulse" /> Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {course.status !== 'approved' && (
                                                            <button 
                                                                onClick={() => handleStatusChange(course._id, 'approved')}
                                                                className="h-10 px-5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        {course.status !== 'rejected' && (
                                                            <button 
                                                                onClick={() => handleStatusChange(course._id, 'rejected')}
                                                                className="h-10 px-5 rounded-xl bg-red-500 text-white hover:bg-red-600 text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-red-500/10"
                                                            >
                                                                Reject
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Link 
                                                            to={`/course/${course._id}`} 
                                                            className="w-10 h-10 flex items-center justify-center bg-[#0f172a] border border-slate-700 rounded-xl text-slate-500 hover:text-primary transition-all"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>
                                                        <button className="w-10 h-10 flex items-center justify-center bg-[#0f172a] border border-slate-700 rounded-xl text-slate-500 hover:text-white transition-all">
                                                            <MoreVertical size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseApproval;
