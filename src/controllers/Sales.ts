import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Sale, { ISalePayment, ISaleProduct } from '../models/SalesPayment';
import Customer from '../models/Customer';
import StoreProduct from '../models/StoreProduct';
import { CreateResponse } from '../util/response';

// export const createNewSale = async (req: Request, res: Response): Promise<any> => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const { customer, store_id, servedBy, products, payments } = req.body;

//         if (!store_id || !servedBy || !products?.length || !payments?.length) {
//             throw new Error('Missing required sale data.');
//         }

//         // Step 1: Check or Create Customer
//         // let existingCustomer = await Customer.findOne({ phone: customer.phone }).session(session);
//         let existingCustomer = await Customer.findOne({ phone: customer.phone }).session(session);

//         if (!existingCustomer) {
//             existingCustomer = await Customer.create(
//                 [
//                     {
//                         name: customer.name,
//                         phone: customer.phone,
//                         region: customer.region,
//                         address: customer.address,
//                         servedBy,
//                     },
//                 ],
//                 { session }
//             ).then(res => res[0]);
//         }

//         const total_amount: number = products.reduce((sum: number, p) => sum + p.price * p.quantity, 0);
// const total_paid: number = payments.reduce((sum: number, p) => sum + p.amount, 0);

//         const payment_status =
//             total_paid >= total_amount ? 'paid' : total_paid > 0 ? 'partial' : 'unpaid';

//         // Step 3: Create Sale
//         const sale = await Sale.create(
//             [
//                 {
//                     customer_id: existingCustomer._id,

//                     store_id,
//                     servedBy,
//                     products,
//                     payments,
//                     total_amount,
//                     total_paid,
//                     payment_status,
//                 },
//             ],
//             { session }
//         ).then(res => res[0]);

//         await session.commitTransaction();
//         session.endSession();

//         return res
//             .status(201)
//             .json(CreateResponse(true, sale, 'Sale created successfully.'));
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         console.error('[createNewSale]', error);
//         return res.status(500).json(CreateResponse(false, null, 'Failed to create sale.'));
//     }
// };



export const createNewSale = async (req: Request, res: Response): Promise<any> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            customer,
            store_id,
            servedBy,
            products,
            payments,
            discount = 0, // Default to 0 if not provided
        }: {
            customer: {
                name: string;
                phone: string;
                region: string;
                address?: string;
                district?: string;
                ward?: string;
                street?: string; 
            };
            store_id: string;
            servedBy: string;
            products: ISaleProduct[];
            payments: ISalePayment[];
            discount?: number; // Optional discount field
        } = req.body;

        if (!store_id || !servedBy || !products?.length || !payments?.length) {
            throw new Error('Missing required sale data.');
        }

        // Step 1: Check or create customer
        let customerDoc = await Customer.findOne({ phone: customer.phone }).session(session);

        if (!customerDoc) {
            const created = await Customer.create(
                [
                    {
                        name: customer.name,
                        phone: customer.phone,
                        region: customer.region,
                        address: customer.address,
                        district: customer.district,
                        ward: customer.ward,
                        street: customer.street, // village
                        servedBy,
                    },
                ],
                { session }
            );
            customerDoc = created[0];
        }

        // Step 2: Calculate totals
        const total_amount: number = products.reduce(
            (sum: number, p) => sum + p.price * p.quantity,
            0
        );
        const total_paid: number = payments.reduce((sum: number, p) => sum + p.amount, 0);
        const payment_status: 'paid' | 'partial' | 'unpaid' =
            total_paid >= total_amount ? 'paid' : total_paid > 0 ? 'partial' : 'unpaid';

        // Step 3: Create the sale
        const saleDoc = await Sale.create(
            [
                {
                    customer_id: customerDoc._id,
                    store_id,
                    servedBy,
                    products,
                    payments,
                    total_amount,
                    total_paid,
                    payment_status,
                    discount: discount, // Optional discount field
                },
            ],
            { session }
        );



        for (const item of products) {
            const { product_id, quantity } = item;

            const storeStock = await StoreProduct.findOne({
                store_id,
                product_id,
            }).session(session);

            

            if (!storeStock || storeStock.quantity < quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.json(
                    CreateResponse(
                        false,
                        null,
                        `Insufficient stock for product ${product_id}. Available: ${storeStock?.quantity || 0}`
                    )
                );
            }


            // Deduct stock
            storeStock.quantity -= quantity;
            await storeStock.save({ session });
        }

        await session.commitTransaction();
        session.endSession();



        return res
            .json(CreateResponse(true, saleDoc[0], 'Sale created successfully.'));
    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        console.error('[createNewSale]', error);
        return res.status(500).json(CreateResponse(false, null, error.message || 'Failed to create sale.'));
    }
};