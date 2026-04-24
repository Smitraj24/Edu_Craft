const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(' Connected to MongoDB');

        // Admin details - CHANGE THESE!
        const adminData = {
            name: 'Admin User',
            email: 'admin@educraft.com',
            password: 'Admin@123',
            role: 'admin',
            isEmailVerified: true,
            isActive: true
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        
        if (existingAdmin) {
            console.log('  Admin user already exists with this email!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            
            // Update to admin if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                existingAdmin.isEmailVerified = true;
                await existingAdmin.save();
                console.log(' Updated existing user to admin role');
            }
        } else {
            // Create new admin user
            const admin = await User.create(adminData);
            console.log(' Admin user created successfully!');
            console.log('Email:', admin.email);
            console.log('Password:', adminData.password);
            console.log('Role:', admin.role);
        }

        console.log('\n You can now login with these credentials:');
        console.log('Email:', adminData.email);
        console.log('Password:', adminData.password);
        console.log('\n🔗 Login URL: http://localhost:5173/login');
        console.log('🔗 Admin Dashboard: http://localhost:5173/admin/dashboard');

        process.exit(0);
    } catch (error) {
        console.error(' Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
