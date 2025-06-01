import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import User from '../models/Users';
import { hashPassword } from '../util/passwords';

const MONGO_URI = process.env.DATABASE_CONNECTION_STR;
const adminPassword = process.env.ADMIN_PASSWORD;
const admingEmail = process.env.ADMIN_EMAIL
const admingPhone = process.env.ADMIN_PHONE;






(async () => {
    
    if (!MONGO_URI || !adminPassword || !admingEmail || !admingPhone) {
        console.error('Required environment variables are not set. for Super Admin creation');
        process.exit(1);
    }
    await mongoose.connect(MONGO_URI);

    const existing = await User.findOne({ email: 'admin@positivecooker.com' });
    if (existing) {
        console.log('Super admin already exists.');
        process.exit(0);
    }

    const hashed = await hashPassword(adminPassword);
    if (!hashed) {
        console.error('Failed to hash password');
        process.exit(1);
    }

    const superAdmin = new User({
        fname: 'Super',
        lname: 'Admin',
        email: admingEmail,
        phone: admingPhone,
        password: hashed,
        role: 'admin',
        is_active: true,
        store_id: null,
    });

    await superAdmin.save();
    console.log('Super Admin created.');
    process.exit(0);
})();
