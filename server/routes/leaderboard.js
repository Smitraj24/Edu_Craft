const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/leaderboard
// @desc    Get top students by course completion
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Aggregate enrollments to calculate student scores
        const leaderboard = await Enrollment.aggregate([
            {
                $match: {
                    progress: { $gte: 0 }
                }
            },
            {
                $group: {
                    _id: '$student',
                    totalCourses: { $sum: 1 },
                    completedCourses: {
                        $sum: { $cond: [{ $eq: ['$progress', 100] }, 1, 0] }
                    },
                    averageProgress: { $avg: '$progress' },
                    passedQuizzes: {
                        $sum: { $cond: ['$passedQuiz', 1, 0] }
                    }
                }
            },
            {
                $addFields: {
                    score: {
                        $add: [
                            { $multiply: ['$completedCourses', 100] }, // 100 points per completed course
                            { $multiply: ['$passedQuizzes', 50] },     // 50 points per passed quiz
                            { $multiply: ['$averageProgress', 0.5] }   // 0.5 points per % progress
                        ]
                    }
                }
            },
            {
                $sort: { score: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        // Populate student details
        const leaderboardWithUsers = await User.populate(leaderboard, {
            path: '_id',
            select: 'name email profilePicture'
        });

        // Format response - flatten structure for easier frontend consumption
        const formattedLeaderboard = leaderboardWithUsers.map((entry, index) => ({
            rank: index + 1,
            _id: entry._id._id,
            name: entry._id.name,
            email: entry._id.email,
            profilePicture: entry._id.profilePicture,
            totalCourses: entry.totalCourses,
            completedCourses: entry.completedCourses,
            averageProgress: Math.round(entry.averageProgress),
            passedQuizzes: entry.passedQuizzes,
            score: Math.round(entry.score)
        }));

        res.json(formattedLeaderboard);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
    }
});

// @route   GET /api/leaderboard/my-rank
// @desc    Get current user's rank
// @access  Protected
router.get('/my-rank', protect, async (req, res) => {
    try {
        // Get all students ranked
        const allStudents = await Enrollment.aggregate([
            {
                $match: {
                    progress: { $gte: 0 }
                }
            },
            {
                $group: {
                    _id: '$student',
                    totalCourses: { $sum: 1 },
                    completedCourses: {
                        $sum: { $cond: [{ $eq: ['$progress', 100] }, 1, 0] }
                    },
                    averageProgress: { $avg: '$progress' },
                    passedQuizzes: {
                        $sum: { $cond: ['$passedQuiz', 1, 0] }
                    }
                }
            },
            {
                $addFields: {
                    score: {
                        $add: [
                            { $multiply: ['$completedCourses', 100] },
                            { $multiply: ['$passedQuizzes', 50] },
                            { $multiply: ['$averageProgress', 0.5] }
                        ]
                    }
                }
            },
            {
                $sort: { score: -1 }
            }
        ]);

        // Find user's rank
        const userRank = allStudents.findIndex(
            entry => entry._id.toString() === req.user._id.toString()
        );

        if (userRank === -1) {
            return res.json({
                rank: null,
                totalStudents: allStudents.length,
                message: 'Not ranked yet. Enroll in courses to get started!'
            });
        }

        const userStats = allStudents[userRank];

        res.json({
            rank: userRank + 1,
            totalStudents: allStudents.length,
            stats: {
                totalCourses: userStats.totalCourses,
                completedCourses: userStats.completedCourses,
                averageProgress: Math.round(userStats.averageProgress),
                passedQuizzes: userStats.passedQuizzes,
                score: Math.round(userStats.score)
            }
        });
    } catch (error) {
        console.error('My rank error:', error);
        res.status(500).json({ message: 'Failed to fetch rank', error: error.message });
    }
});

module.exports = router;
