const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Course = require('../models/Course');

const router = express.Router();

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Protected
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'wishlist',
            populate: { path: 'instructor', select: 'name' }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return empty array if wishlist is undefined or null
        res.json(user.wishlist || []);
    } catch (error) {
        console.error('Fetch wishlist error:', error);
        res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
    }
});

// @route   POST /api/wishlist/:courseId
// @desc    Add course to wishlist
// @access  Protected
router.post('/:courseId', protect, async (req, res) => {
    try {
        const { courseId } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid course ID format' });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize wishlist if it doesn't exist
        if (!user.wishlist) {
            user.wishlist = [];
        }

        // Check if already in wishlist (convert to string for comparison)
        const isAlreadyInWishlist = user.wishlist.some(
            id => id.toString() === courseId.toString()
        );

        if (isAlreadyInWishlist) {
            return res.status(400).json({ message: 'Course already in wishlist' });
        }

        // Add to wishlist
        user.wishlist.push(courseId);
        await user.save({ validateModifiedOnly: true });

        res.json({ message: 'Course added to wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ message: 'Failed to add to wishlist', error: error.message });
    }
});

// @route   DELETE /api/wishlist/:courseId
// @desc    Remove course from wishlist
// @access  Protected
router.delete('/:courseId', protect, async (req, res) => {
    try {
        const { courseId } = req.params;

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid course ID format' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize wishlist if it doesn't exist
        if (!user.wishlist) {
            user.wishlist = [];
        }

        // Check if course is in wishlist
        const isInWishlist = user.wishlist.some(
            id => id.toString() === courseId.toString()
        );

        if (!isInWishlist) {
            return res.status(400).json({ message: 'Course not in wishlist' });
        }

        // Remove from wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== courseId.toString());
        await user.save({ validateModifiedOnly: true });

        res.json({ message: 'Course removed from wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ message: 'Failed to remove from wishlist', error: error.message });
    }
});

module.exports = router;
