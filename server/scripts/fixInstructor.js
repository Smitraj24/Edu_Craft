const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const fixInstructor = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const instructor = await User.findOne({ email: 'instructor@educraft.com' });
        
        if (!instructor) {
            console.log(' Instructor not found!');
            process.exit(1);
        }

        console.log('📋 Current Instructor Details:');
        console.log('─────────────────────────────');
        console.log('Name:', instructor.name);
        console.log('Email:', instructor.email);
        console.log('Role:', instructor.role);
        console.log('Is Active:', instructor.isActive);
        console.log('Is Email Verified:', instructor.isEmailVerified);
        console.log('─────────────────────────────\n');

        instructor.isEmailVerified = true;
        instructor.isActive = true;
        await instructor.save({ validateModifiedOnly: true });

        console.log(' Instructor fixed!\n');
        console.log(' Updated Details:');
        console.log('─────────────────────────────');
        console.log('Name:', instructor.name);
        console.log('Email:', instructor.email);
        console.log('Role:', instructor.role);
        console.log('Is Active:', instructor.isActive);
        console.log('Is Email Verified:', instructor.isEmailVerified);
        console.log('─────────────────────────────\n');

        process.exit(0);
    } catch (error) {
        console.error(' Error:', error.message);
        process.exit(1);
    }
};

fixInstructor();
