import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: 'cookers' | 'utensils' | 'electronics' | 'accessories';
  subcategory?: string;
  starting_price?: number;
  payment_model: 'paygo' | 'cash';
  description?: string;
  attributes?: Record<string, string>;
  is_active: boolean;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ['cookers', 'utensils', 'electronics', 'accessories'],
      required: true,
      index: true,
    },
    subcategory: String,
    starting_price: Number,
    payment_model: {
      type: String,
      enum: ['paygo', 'cash'],
      default: 'cash',
    },
    description: String,
    attributes: { type: Map, of: String },
    is_active: { type: Boolean, default: true },
    images: [String],
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1, name: 1 }, { unique: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
