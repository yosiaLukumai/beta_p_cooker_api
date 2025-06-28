import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
    name: string;
    phone: string;
    region: string;
    address?: string;
    servedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true, unique: true },
        region: { type: String, required: true },
        address: String,
        servedBy: { type: mongoose.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
