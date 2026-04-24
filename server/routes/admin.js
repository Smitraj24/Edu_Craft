const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/admin/courses
// @desc    Create a course as admin (on behalf of instructor)
// @access  Private/Admin
router.post('/courses', protect, admin, async (req, res) => {
    const { title, description, price, category, videos, thumbnail, previewVideo, instructorId, status } = req.body;

    try {
        if (!instructorId) {
            return res.status(400).json({ message: 'Instructor ID is required' });
        }

        const instructor = await User.findById(instructorId);
        if (!instructor || instructor.role !== 'instructor') {
            return res.status(400).json({ message: 'Invalid instructor' });
        }

        const course = new Course({
            title,
            description,
            price,
            category,
            videos: videos || [],
            thumbnail,
            previewVideo,
            instructor: instructorId,
            status: status || 'approved', // Admin can auto-approve
            quizzes: [],
            assignments: []
        });

        const createdCourse = await course.save();
        res.status(201).json(createdCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/dashboard
// @desc    Get system-wide statistics
// @access  Private/Admin
router.get('/dashboard', protect, admin, async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalInstructors = await User.countDocuments({ role: 'instructor' });
        const totalCourses = await Course.countDocuments();
        
        // Calculate total revenue from enrollments directly
        // Currently, price is in Course model, so we need to populate
        const enrollments = await Enrollment.find({}).populate('course', 'price');
        
        let totalRevenue = 0;
        enrollments.forEach(enrollment => {
            if (enrollment.course && enrollment.course.price) {
                totalRevenue += enrollment.course.price;
            }
        });

        // Get recent enrollments
        const recentEnrollments = await Enrollment.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('student', 'name email')
            .populate('course', 'title');

        res.json({
            totalStudents,
            totalInstructors,
            totalCourses,
            totalRevenue,
            recentEnrollments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/reports
// @desc    Get detailed analytical reports
// @access  Private/Admin
router.get('/reports', protect, admin, async (req, res) => {
    try {
        // 1. Category Distribution
        const categories = await Course.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // 2. Enrollment Trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const enrollmentTrends = await Enrollment.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { 
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 3. Top Mentors (by student count)
        const topMentors = await Course.aggregate([
            { $group: { 
                _id: "$instructor", 
                courseCount: { $sum: 1 },
                totalStudents: { $sum: "$enrolledStudents" } 
            }},
            { $sort: { totalStudents: -1 } },
            { $limit: 5 },
            { $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "instructorDetails"
            }},
            { $unwind: "$instructorDetails" },
            { $project: {
                name: "$instructorDetails.name",
                email: "$instructorDetails.email",
                courseCount: 1,
                totalStudents: 1
            }}
        ]);

        res.json({
            categories,
            enrollmentTrends,
            topMentors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
