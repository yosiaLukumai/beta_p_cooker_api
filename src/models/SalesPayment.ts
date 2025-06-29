import mongoose, { Schema, Document } from 'mongoose';

export interface ISaleProduct {
    product_id: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    serial_number?: string;
}

export interface ISalePayment {
    method: 'cash' | 'mobile' | 'bank';
    amount: number;
    reference?: string;
    description?: string;
    bank_name?: 'NMB' | 'CRDB';
    channel?: 'lipa_namba' | 'mpesa';
    paid_at: Date;
}

export interface ISale extends Document {
    customer_id: mongoose.Types.ObjectId;
    store_id: mongoose.Types.ObjectId;
    servedBy: mongoose.Types.ObjectId;
    products: ISaleProduct[];
    payments: ISalePayment[];
    total_amount: number;
    payment_reference?: string; // Optional payment reference field
    total_paid: number;
    payment_status: 'paid' | 'partial' | 'unpaid';
    discount?: number; // Optional discount field
    createdAt: Date;
    updatedAt: Date;
}


const { ObjectId } = Schema.Types;

const SaleProductSchema = new Schema<ISaleProduct>(
    {
        product_id: {
            type: ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        serial_number: String,
    },
    { _id: false }
);

const SalePaymentSchema = new Schema<ISalePayment>(
    {
        method: {
            type: String,
            enum: ['cash', 'mobile', 'bank'],
            required: true,
        },
        amount: { type: Number, required: true },
        reference: String,
        bank_name: {
            type: String,
            enum: ['NMB', 'CRDB'],
            required: function (this: ISalePayment) {
                return this.method === 'bank';
            },
        },
        description: String,
        channel: {
            type: String,
            enum: ['lipa_namba', 'mpesa'],
            required: function (this: ISalePayment) {
                return this.method === 'mobile';
            },
        },

        paid_at: { type: Date, default: Date.now },
    },
    { _id: false }
);

const SaleSchema = new Schema<ISale>(
    {
        customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
        store_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
        servedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        products: { type: [SaleProductSchema], required: true },
        payments: { type: [SalePaymentSchema], default: [] },
        total_amount: { type: Number, required: true },
        total_paid: { type: Number, default: 0 },
        payment_reference: { type: String, default: '' },
        discount: { type: Number, default: 0 }, // Optional discount field
        payment_status: {
            type: String,
            enum: ['paid', 'partial', 'unpaid'],
            default: 'unpaid',
        },
    },
    { timestamps: true }
);

export default mongoose.model<ISale>('Sale', SaleSchema);
