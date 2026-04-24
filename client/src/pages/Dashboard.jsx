import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { 
  BookOpen, Clock, Award, 
  ChevronRight, Play, CheckCircle, ArrowRight, Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const [myRank, setMyRank] = useState(null);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const { data } = await api.get('/api/users/enrollments');
                setEnrollments(data.filter(e => e.course != null));
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                const { data } = await api.get('/api/leaderboard');
                setLeaderboard(data.slice(0, 5)); // Top 5
                const userIndex = data.findIndex(entry => entry._id === user?._id);
                if (userIndex !== -1) {
                    setMyRank(userIndex + 1);
                }
            } catch (error) {
                console.error('Failed to load leaderboard');
            }
        };

        if (user) {
            fetchEnrollments();
            fetchLeaderboard();
        }
    }, [user]);

    // Calculate Stats
    const activeCourses = enrollments.filter(e => e.progress < 100).length;
    const certificates = enrollments.filter(e => e.progress === 100).length;
    
    // Simulate/Calculate Hours (sum of completed video durations in minutes / 60)
    const totalMinutes = enrollments.reduce((acc, enrollment) => {
        const completedIds = enrollment.completedVideos || [];
        const videos = (enrollment.course && enrollment.course.videos) || [];
        // Use actual video duration if available, otherwise assume 5 minutes as a more conservative estimate
        return acc + videos.filter(v => completedIds.includes(v._id)).reduce((a, v) => a + (Number(v.duration) || 5), 0);
    }, 0);
    const hoursWatched = (totalMinutes / 60).toFixed(1);

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in pt-8 md:pt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="flex items-center gap-6 mb-12">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary text-3xl font-bold border border-primary/20 shadow-glow">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                            Welcome back, {user?.name || 'Student'}!
                        </h1>
                        <p className="text-slate-400 text-lg">Ready to continue your learning journey?</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                    {[
                        { label: 'Active Courses', value: activeCourses, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/my-courses' },
                        { label: 'Hours Watched', value: `${hoursWatched}h`, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10', link: null },
                        { label: 'Certificates', value: certificates, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10', link: '/certificates' },
                        { label: 'My Rank', value: myRank ? `#${myRank}` : '-', icon: Trophy, color: 'text-purple-500', bg: 'bg-purple-500/10', link: '/leaderboard' },
                    ].map((stat, i) => {
                        const CardContent = (
                            <div className="bg-[#1e293b] border border-slate-700/50 p-8 rounded-3xl flex items-center gap-6 group hover:border-slate-600 transition-all shadow-sm">
                                <div className={`${stat.bg} ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    <stat.icon size={32} />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-bold text-white mb-0.5">{stat.value}</h3>
                                    <p className="text-slate-400 font-medium">{stat.label}</p>
                                </div>
                            </div>
                        );

                        return stat.link ? (
                            <Link key={i} to={stat.link} className="block">
                                {CardContent}
                            </Link>
                        ) : (
                            <div key={i}>
                                {CardContent}
                            </div>
                        );
                    })}
                </div>

                {/* My Learning Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            My Learning
                        </h2>
                        
                        {enrollments.length === 0 ? (
                            <div className="bg-[#1e293b] border border-slate-700/50 border-dashed rounded-[2.5rem] p-16 text-center">
                                <p className="text-slate-400 text-lg mb-6">You haven't enrolled in any courses yet.</p>
                                <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
                                    Browse Courses <ArrowRight size={20} />
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8">
                                {enrollments.slice(0, 3).map((enrollment) => (
                                    <div key={enrollment._id} className="bg-[#1e293b] border border-slate-700/50 rounded-2xl overflow-hidden group hover:border-slate-600 transition-all flex shadow-lg">
                                        <div className="w-48 bg-primary relative overflow-hidden flex items-center justify-center flex-shrink-0">
                                           {enrollment.course.thumbnail ? (
                                               <img 
                                                   src={enrollment.course.thumbnail.startsWith('http') ? enrollment.course.thumbnail : `http://localhost:5000${enrollment.course.thumbnail}`} 
                                                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                   alt={enrollment.course.title}
                                               />
                                           ) : (
                                               <div className="text-white text-xl font-bold text-center px-4">
                                                   {enrollment.course.title}
                                               </div>
                                           )}
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="mb-4">
                                                <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">{enrollment.course.category}</span>
                                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{enrollment.course.title}</h3>
                                            </div>
                                            
                                            <div className="mt-auto">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-slate-400">Progress</span>
                                                    <span className="text-sm font-bold text-white">{enrollment.progress}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                                                    <div 
                                                        className="h-full bg-primary transition-all duration-1000 ease-out"
                                                        style={{ width: `${enrollment.progress}%` }}
                                                    ></div>
                                                </div>
                                                <Link 
                                                    to={`/course/${enrollment.course._id}`}
                                                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all text-sm"
                                                >
                                                    Resume Course <ChevronRight size={16} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Widget */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Trophy className="text-primary" size={28} />
                                Top Learners
                            </h2>
                        </div>
                        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 space-y-4">
                            {leaderboard.length === 0 ? (
                                <p className="text-slate-400 text-center py-8">No data available</p>
                            ) : (
                                <>
                                    {leaderboard.map((entry, index) => (
                                        <div key={entry._id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all">
                                            <div className="w-8 text-center">
                                                <span className="text-slate-400 font-bold">#{index + 1}</span>
                                            </div>
                                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold border border-primary/20">
                                                {entry.name?.charAt(0) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-bold text-sm truncate">{entry.name}</p>
                                                <p className="text-slate-400 text-xs">{entry.completedCourses} courses</p>
                                            </div>
                                        </div>
                                    ))}
                                    <Link 
                                        to="/leaderboard"
                                        className="block w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-center transition-all mt-4"
                                    >
                                        View Full Leaderboard
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



export default Dashboard;
