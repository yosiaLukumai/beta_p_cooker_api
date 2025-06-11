import mongoose, { Schema, Document } from 'mongoose';

export interface IStockTransfer extends Document {
  product_id: mongoose.Types.ObjectId;
  from_store: mongoose.Types.ObjectId;
  to_store: mongoose.Types.ObjectId;
  quantity: number;
  transfer_status: 'pending' | 'approved' | 'rejected';
  initiated_by: mongoose.Types.ObjectId;
  approved_by?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StockTransferSchema = new Schema<IStockTransfer>(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    from_store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    to_store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    quantity: { type: Number, required: true },
    transfer_status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    initiated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<IStockTransfer>('StockTransfer', StockTransferSchema);
