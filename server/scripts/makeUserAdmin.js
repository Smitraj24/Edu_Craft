const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// CHANGE THIS TO YOUR EMAIL
const YOUR_EMAIL = 'smitrajsinhmakvana22@gnu.ac.in';  // ← PUT YOUR EMAIL HERE

const makeUserAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(' Connected to MongoDB\n');

        // Find user by email
        const user = await User.findOne({ email: YOUR_EMAIL });
        
        if (!user) {
            console.log(' User not found with email:', YOUR_EMAIL);
            console.log('\n Available users:');
            const allUsers = await User.find({}).select('name email role');
            allUsers.forEach(u => {
                console.log(`  - ${u.email} (${u.name}) - Role: ${u.role}`);
            });
            console.log('\n Update YOUR_EMAIL in this script with one of the emails above');
            process.exit(1);
        }

        console.log(' Current User Details:');
        console.log('─────────────────────────────');
        console.log('Name:', user.name);
        console.log('Email:', user.email);
        console.log('Current Role:', user.role);
        console.log('Is Active:', user.isActive);
        console.log('Is Email Verified:', user.isEmailVerified);
        console.log('─────────────────────────────\n');

        // Update to admin
        user.role = 'admin';
        user.isEmailVerified = true;
        user.isActive = true;
        await user.save({ validateModifiedOnly: true });

        console.log(' User updated successfully!\n');
        console.log(' New User Details:');
        console.log('─────────────────────────────');
        console.log('Name:', user.name);
        console.log('Email:', user.email);
        console.log('New Role:', user.role);
        console.log('─────────────────────────────\n');

        console.log(' You can now login as admin with:');
        console.log('Email:', user.email);
        console.log('Password: (your existing password)');
        console.log('\n🔗 Login URL: http://localhost:5173/login');
        console.log('🔗 Admin Dashboard: http://localhost:5173/admin/dashboard');
        console.log('\n You need to LOGOUT and LOGIN AGAIN for changes to take effect!');

        process.exit(0);
    } catch (error) {
        console.error(' Error:', error.message);
        process.exit(1);
    }
};

makeUserAdmin();
