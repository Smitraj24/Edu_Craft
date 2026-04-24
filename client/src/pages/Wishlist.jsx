import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { Heart, X, BookOpen, Clock } from 'lucide-react';

const Wishlist = () => {
    const { wishlist, loading, removeFromWishlist } = useContext(WishlistContext);

    const handleRemove = async (courseId) => {
        const result = await removeFromWishlist(courseId);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <Heart size={32} className="text-primary" fill="currentColor" />
                        <h1 className="text-4xl font-extrabold text-white">My Wishlist</h1>
                    </div>
                    <p className="text-slate-400 text-lg">
                        Courses you've saved for later ({wishlist.length})
                    </p>
                </div>

                {/* Wishlist Grid */}
                {wishlist.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart size={48} className="text-slate-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Your wishlist is empty</h2>
                        <p className="text-slate-400 mb-8">Start adding courses you're interested in!</p>
                        <Link to="/courses" className="btn-primary">
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {wishlist.map((course) => (
                            <div key={course._id} className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700 hover:border-primary/50 transition-all group">
                                {/* Course Image */}
                                <div className="relative h-48 bg-slate-800 overflow-hidden">
                                    {course.thumbnail ? (
                                        <img 
                                            src={course.thumbnail} 
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen size={48} className="text-slate-600" />
                                        </div>
                                    )}
                                    
                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemove(course._id)}
                                        className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all shadow-lg"
                                        title="Remove from wishlist"
                                    >
                                        <X size={18} className="text-white" />
                                    </button>

                                    {/* Price Badge */}
                                    <div className="absolute bottom-4 left-4">
                                        <span className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                                            {course.price === 0 ? 'FREE' : `$${course.price}`}
                                        </span>
                                    </div>
                                </div>

                                {/* Course Info */}
                                <div className="p-6">
                                    <div className="mb-3">
                                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                            {course.category}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>

                                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                                        {course.description}
                                    </p>

                                    {/* Course Meta */}
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                                        <div className="flex items-center gap-1">
                                            <BookOpen size={14} />
                                            <span>{course.videos?.length || 0} lessons</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            <span>Beginner</span>
                                        </div>
                                    </div>

                                    {/* Instructor */}
                                    <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-700">
                                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-bold">
                                            {course.instructor?.name?.charAt(0) || 'I'}
                                        </div>
                                        <span className="text-sm text-slate-400">
                                            {course.instructor?.name || 'Instructor'}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    <Link
                                        to={`/course/${course._id}`}
                                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                                    >
                                        View Course
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
