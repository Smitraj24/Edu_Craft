import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axiosConfig';
import { Trophy, Medal, Award, TrendingUp, Crown, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const Leaderboard = () => {
    const { user } = useContext(AuthContext);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myRank, setMyRank] = useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const { data } = await api.get('/api/leaderboard');
                setLeaderboard(data);
                
                // Find current user's rank
                const userIndex = data.findIndex(entry => entry._id === user?._id);
                if (userIndex !== -1) {
                    setMyRank(userIndex + 1);
                }
            } catch (error) {
                toast.error('Failed to load leaderboard');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [user]);

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="text-yellow-400" size={24} />;
        if (rank === 2) return <Medal className="text-gray-400" size={24} />;
        if (rank === 3) return <Medal className="text-amber-600" size={24} />;
        return <span className="text-slate-400 font-bold text-lg">#{rank}</span>;
    };

    const getRankBadge = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
        if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500';
        if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700';
        return 'bg-slate-800';
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in pt-8 md:pt-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Trophy className="text-primary" size={40} />
                        <h1 className="text-4xl font-extrabold text-white tracking-tight uppercase">
                            Leaderboard
                        </h1>
                    </div>
                    <p className="text-slate-400 text-lg">Top learners ranked by course completions</p>
                </div>

                {/* My Rank Card */}
                {myRank && (
                    <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-2xl p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xl font-bold border border-primary/20">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">Your Rank</p>
                                    <p className="text-slate-300 text-sm">{user?.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 justify-end mb-1">
                                    {getRankIcon(myRank)}
                                </div>
                                <p className="text-slate-300 text-sm">
                                    {leaderboard[myRank - 1]?.completedCourses || 0} courses completed
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Leaderboard List */}
                <div className="space-y-4">
                    {leaderboard.length === 0 ? (
                        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-16 text-center">
                            <p className="text-slate-400 text-lg">No leaderboard data available yet.</p>
                        </div>
                    ) : (
                        leaderboard.map((entry, index) => {
                            const rank = index + 1;
                            const isCurrentUser = entry._id === user?._id;
                            
                            return (
                                <div 
                                    key={entry._id}
                                    className={`${getRankBadge(rank)} ${isCurrentUser ? 'border-2 border-primary' : 'border border-slate-700/50'} rounded-2xl p-6 transition-all hover:scale-[1.02]`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 flex items-center justify-center">
                                                {getRankIcon(rank)}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 ${rank <= 3 ? 'bg-white/20' : 'bg-primary/20'} rounded-full flex items-center justify-center text-xl font-bold ${rank <= 3 ? 'text-white' : 'text-primary'} border ${rank <= 3 ? 'border-white/20' : 'border-primary/20'}`}>
                                                    {entry.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-lg ${rank <= 3 ? 'text-white' : 'text-white'}`}>
                                                        {entry.name}
                                                        {isCurrentUser && <span className="ml-2 text-primary text-sm">(You)</span>}
                                                    </p>
                                                    <p className={`text-sm ${rank <= 3 ? 'text-white/70' : 'text-slate-400'}`}>
                                                        {entry.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2 justify-end mb-1">
                                                <Star className={rank <= 3 ? 'text-white' : 'text-primary'} size={20} />
                                                <p className={`text-2xl font-bold ${rank <= 3 ? 'text-white' : 'text-white'}`}>
                                                    {entry.completedCourses}
                                                </p>
                                            </div>
                                            <p className={`text-sm ${rank <= 3 ? 'text-white/70' : 'text-slate-400'}`}>
                                                courses completed
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
