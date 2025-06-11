import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreProduct extends Document {
  product_id: mongoose.Types.ObjectId;
  store_id: mongoose.Types.ObjectId;
  quantity: number;
  cost_price?: number;
  serial_numbers?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const StoreProductSchema = new Schema<IStoreProduct>(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    quantity: { type: Number, default: 0 },
    cost_price: Number,
    serial_numbers: [String],
  },
  { timestamps: true }
);

// Fast lookup
StoreProductSchema.index({ store_id: 1, product_id: 1 }, { unique: true });

export default mongoose.model<IStoreProduct>('StoreProduct', StoreProductSchema);
