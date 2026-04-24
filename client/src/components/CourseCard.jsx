import { Link } from 'react-router-dom';
import { Users, Play, Heart } from 'lucide-react';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import toast from 'react-hot-toast';

const CourseCard = ({ course }) => {
    const { user } = useContext(AuthContext);
    const { isInWishlist, toggleWishlist } = useContext(WishlistContext);
    const [loading, setLoading] = useState(false);

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Please login to add to wishlist');
            return;
        }

        setLoading(true);
        const result = await toggleWishlist(course._id);
        setLoading(false);

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };
    // Determine thumbnail (handle both physical uploads and placeholders)
    const thumbnailPath = course.thumbnail 
        ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`)
        : null;

    return (
        <div className="group bg-[#1e293b] border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600 transition-all shadow-lg flex flex-col h-full">
            
            {/* Thumbnail Section */}
            <div className="relative aspect-video overflow-hidden bg-primary/20 flex items-center justify-center">
                {thumbnailPath ? (
                    <img 
                        src={thumbnailPath} 
                        alt={course.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                ) : (
                    <div className="text-white text-2xl font-bold text-center px-6">
                        {course.title}
                    </div>
                )}
                
                {/* Category Overlay */}
                <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                        {course.category || 'Tech'}
                    </span>
                </div>

                {/* Wishlist Button */}
                {user && (
                    <button 
                        onClick={handleWishlistToggle}
                        disabled={loading}
                        className="absolute top-3 right-3 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition-all border border-white/10 group/heart z-10"
                    >
                        <Heart 
                            size={20} 
                            className={`transition-all ${isInWishlist(course._id) ? 'fill-red-500 text-red-500' : 'text-white group-hover/heart:text-red-500'}`}
                        />
                    </button>
                )}

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play size={24} fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-white tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                        {course.title}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium line-clamp-2 mt-2 leading-relaxed">
                        {course.description || 'Access high-fidelity curriculum sequences designed for professional systemic mastery.'}
                    </p>
                </div>
                
                {/* Meta Stats Row */}
                <div className="mt-auto flex items-center gap-4 text-slate-500 mb-6">
                    <div className="flex items-center gap-1.5 flex-1 line-clamp-1">
                        <Users size={14} className="text-primary" />
                        <span className="text-xs font-extra-bold text-white">{course.enrolledStudents || 0} Students</span>
                    </div>
                    <div className="flex items-center gap-1.5 line-clamp-1">
                        <Play size={14} className="text-slate-400" />
                        <span className="text-xs font-bold">{course.videos?.length || 0} Lessons</span>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="text-xl font-bold text-white">
                        {course.price ? `$${course.price}` : 'FREE'}
                    </div>
                    <Link 
                        to={`/course/${course._id}`} 
                        className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-[0.98]"
                    >
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
