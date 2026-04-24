import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch wishlist when user logs in
    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/wishlist', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setWishlist(data);
            }
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const isInWishlist = (courseId) => {
        return wishlist.some(item => item._id === courseId);
    };

    const addToWishlist = async (courseId) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/wishlist/${courseId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                await fetchWishlist(); // Refresh wishlist
                return { success: true, message: 'Added to wishlist' };
            } else {
                return { success: false, message: data.message || 'Failed to add to wishlist' };
            }
        } catch (error) {
            console.error('Add to wishlist error:', error);
            return { success: false, message: 'Failed to add to wishlist' };
        }
    };

    const removeFromWishlist = async (courseId) => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/wishlist/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                await fetchWishlist(); // Refresh wishlist
                return { success: true, message: 'Removed from wishlist' };
            } else {
                return { success: false, message: data.message || 'Failed to remove from wishlist' };
            }
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            return { success: false, message: 'Failed to remove from wishlist' };
        }
    };

    const toggleWishlist = async (courseId) => {
        if (isInWishlist(courseId)) {
            return await removeFromWishlist(courseId);
        } else {
            return await addToWishlist(courseId);
        }
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            loading,
            isInWishlist,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
