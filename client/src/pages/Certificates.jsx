import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axiosConfig';
import { 
  Award, Download, Eye, Calendar, 
  BookOpen, Trophy, ChevronRight, GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

const Certificates = () => {
    const { user } = useContext(AuthContext);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const { data } = await api.get('/api/users/enrollments');
                // Filter only completed courses (100% progress and passed quiz if required)
                const completedCourses = data.filter(enrollment => {
                    if (!enrollment.course) return false;
                    if (enrollment.progress < 100) return false;
                    // If course has quizzes, user must have passed
                    if (enrollment.course.quizzes?.length > 0 && !enrollment.passedQuiz) return false;
                    return true;
                });
                setCertificates(completedCourses);
            } catch (error) {
                console.error('Failed to load certificates:', error);
                toast.error('Failed to load certificates');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchCertificates();
        }
    }, [user]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                            <Award size={32} className="text-amber-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">
                                My Certificates
                            </h1>
                            <p className="text-slate-400 text-lg mt-1">
                                Your achievements and completed courses
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                <Trophy size={24} className="text-amber-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{certificates.length}</p>
                                <p className="text-slate-400 text-sm">Certificates Earned</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                <GraduationCap size={24} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{certificates.length}</p>
                                <p className="text-slate-400 text-sm">Courses Completed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <BookOpen size={24} className="text-blue-500" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">100%</p>
                                <p className="text-slate-400 text-sm">Completion Rate</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Certificates Grid */}
                {certificates.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Award size={48} className="text-slate-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">No certificates yet</h2>
                        <p className="text-slate-400 mb-8">
                            Complete courses to earn certificates and showcase your achievements
                        </p>
                        <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
                            Browse Courses <ChevronRight size={20} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {certificates.map((enrollment) => (
                            <div 
                                key={enrollment._id} 
                                className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700 hover:border-amber-500/50 transition-all group shadow-lg"
                            >
                                {/* Certificate Preview */}
                                <div className="relative h-48 bg-gradient-to-br from-amber-500/20 to-orange-500/20 overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Award size={80} className="text-amber-500/30" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] to-transparent"></div>
                                    
                                    {/* Certificate Badge */}
                                    <div className="absolute top-4 right-4">
                                        <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <Trophy size={12} />
                                            Verified
                                        </div>
                                    </div>

                                    {/* Course Thumbnail Overlay */}
                                    {enrollment.course.thumbnail && (
                                        <img 
                                            src={enrollment.course.thumbnail.startsWith('http') 
                                                ? enrollment.course.thumbnail 
                                                : `http://localhost:5000${enrollment.course.thumbnail}`
                                            } 
                                            alt={enrollment.course.title}
                                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
                                        />
                                    )}
                                </div>

                                {/* Certificate Info */}
                                <div className="p-6">
                                    <div className="mb-3">
                                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                                            {enrollment.course.category}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-amber-500 transition-colors">
                                        {enrollment.course.title}
                                    </h3>

                                    {/* Completion Info */}
                                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 pb-6 border-b border-slate-700">
                                        <Calendar size={16} />
                                        <span>Completed on {formatDate(enrollment.updatedAt)}</span>
                                    </div>

                                    {/* Instructor */}
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                                            {enrollment.course.instructor?.name?.charAt(0) || 'I'}
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Instructor</p>
                                            <p className="text-sm text-slate-300 font-medium">
                                                {enrollment.course.instructor?.name || 'Instructor'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Link
                                            to={`/certificate/${enrollment.course._id}`}
                                            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <Eye size={18} />
                                            View
                                        </Link>
                                        <Link
                                            to={`/certificate/${enrollment.course._id}`}
                                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center"
                                            title="Download Certificate"
                                        >
                                            <Download size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Certificates;
