import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fname: string;
  lname: string;
  email: string;
  phone: string;
  role: 'admin' | 'sales' | 'accountant' | 'technician';
  is_active: boolean;
  otp?: string;
  otp_expires_at?: Date;
  password?: string | null;
  store_id?: mongoose.Types.ObjectId;
  created_by?: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    fname: { type: String, required: true, index: true },
    lname: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    password: { type: String, default: null }, 
    role: {
      type: String,
      enum: ['admin', 'sales', 'accountant', "technician"],
      required: true,
      index: true,
    },
    otp: { type: String, sparse: true },
    otp_expires_at: { type: Date },
    is_active: { type: Boolean, default: true },
    store_id: { type: mongoose.Types.ObjectId, ref: 'Store', index: true },
    created_by: { type: mongoose.Types.ObjectId, ref: 'User' },
    updated_by: { type: mongoose.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

UserSchema.index({ store_id: 1, role: 1 });

export default mongoose.model<IUser>('User', UserSchema);
