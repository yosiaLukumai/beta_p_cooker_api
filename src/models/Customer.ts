import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    phone: string;
    region: string;
    district?: string;
    password?: string;
    ward?: string;
    street?: string; // village
    servedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        region: { type: String, required: true },
        district: { type: String },
        ward: { type: String },
        street: { type: String },
        password: { type: String, default: null }, // Optional password field
        servedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
