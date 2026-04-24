const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(' Connected to MongoDB\n');

        const users = await User.find({}).select('name email role isActive isEmailVerified').sort({ createdAt: -1 });
        
        if (users.length === 0) {
            console.log(' No users found in database!');
            console.log('\n Register a user first at: http://localhost:5173/login');
            process.exit(1);
        }

        console.log('📋 All Users in Database:');
        console.log('═══════════════════════════════════════════════════════════════\n');
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role.toUpperCase()}`);
            console.log(`   Active: ${user.isActive ? '✅' : '❌'}`);
            console.log(`   Email Verified: ${user.isEmailVerified ? '✅' : '❌'}`);
            console.log('───────────────────────────────────────────────────────────────');
        });

        console.log('\n💡 To make a user admin:');
        console.log('1. Copy the email address from above');
        console.log('2. Edit server/scripts/makeUserAdmin.js');
        console.log('3. Replace YOUR_EMAIL with the copied email');
        console.log('4. Run: node server/scripts/makeUserAdmin.js');
        
        console.log('\n📊 Summary:');
        console.log(`Total Users: ${users.length}`);
        console.log(`Admins: ${users.filter(u => u.role === 'admin').length}`);
        console.log(`Instructors: ${users.filter(u => u.role === 'instructor').length}`);
        console.log(`Students: ${users.filter(u => u.role === 'student').length}`);

        process.exit(0);
    } catch (error) {
        console.error(' Error:', error.message);
        process.exit(1);
    }
};

listUsers();
