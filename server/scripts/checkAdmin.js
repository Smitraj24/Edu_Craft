const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(' Connected to MongoDB\n');

        const admin = await User.findOne({ email: 'admin@educraft.com' });
        
        if (!admin) {
            console.log(' Admin user not found!');
            process.exit(1);
        }

        console.log('📋 Admin User Details:');
        console.log('─────────────────────────────');
        console.log('Name:', admin.name);
        console.log('Email:', admin.email);
        console.log('Role:', admin.role);
        console.log('Is Active:', admin.isActive);
        console.log('Is Email Verified:', admin.isEmailVerified);
        console.log('Password Hash:', admin.password.substring(0, 20) + '...');
        console.log('Created At:', admin.createdAt);
        console.log('─────────────────────────────\n');

        // Test password
        const bcrypt = require('bcryptjs');
        const isMatch = await bcrypt.compare('Admin@123', admin.password);
        console.log('🔐 Password Test:');
        console.log('Password "Admin@123" matches:', isMatch ? ' YES' : ' NO');
        
        if (!isMatch) {
            console.log('\n Password does not match! Resetting password...');
            admin.password = 'Admin@123';
            await admin.save();
            console.log(' Password reset successfully!');
        }

        if (!admin.isEmailVerified) {
            console.log('\n  Email not verified! Fixing...');
            admin.isEmailVerified = true;
            await admin.save();
            console.log(' Email verified!');
        }

        console.log('\n Admin user is ready to login!');
        console.log('Email: admin@educraft.com');
        console.log('Password: Admin@123');

        process.exit(0);
    } catch (error) {
        console.error(' Error:', error.message);
        process.exit(1);
    }
};

checkAdmin();
