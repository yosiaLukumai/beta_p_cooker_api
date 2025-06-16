import mongoose, { Document, Schema } from 'mongoose';

export interface IStore extends Document {
    name: string;
    region: string;
    contact: string;
    hq: boolean;
    store_code?: string;
    location?: {
        address?: string;
        lat?: number;
        lng?: number;
    };
    manager_id?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
    {
        name: { type: String, required: true, index: true },
        region: { type: String, required: true },
        contact: { type: String },
        store_code: { type: String, unique: true, sparse: true },
        hq: { type: Boolean, default: false },
        location: {
            address: { type: String },
            lat: { type: Number },
            lng: { type: Number },
        },
        manager_id: { type: mongoose.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

StoreSchema.index({ name: 1, region: 1 });

export default mongoose.model<IStore>('Store', StoreSchema);
