import { Request, Response } from 'express';
import ProductTransfer from '../models/ProductTransfer';
import StoreProduct from '../models/StoreProduct';
import { CreateResponse } from '../util/response';
import mongoose from 'mongoose';


export const TransferrStock = async (req: Request, res: Response): Promise<any> => {
    try {
        const { product_id, from_store, to_store, quantity, initiated_by } = req.body;
        if (!mongoose.Types.ObjectId.isValid(product_id) || !mongoose.Types.ObjectId.isValid(from_store) || !mongoose.Types.ObjectId.isValid(to_store) || !mongoose.Types.ObjectId.isValid(initiated_by)) {
            throw new Error('Invalid product id or store id');
        }
        // save the product transfer
        const productTransfer = await ProductTransfer.create({
            product_id,
            from_store,
            to_store,
            quantity,
            initiated_by,
            transfer_status: 'pending',
        });

        if (!productTransfer) {
            return res.json(CreateResponse(false, null, "Failed to add product transfer"));
        }

        return res.json(CreateResponse(true, "Product transfer added successfully"));

    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
};

export const ApproveProductTransfer = async (req: Request, res: Response): Promise<any> => {
    // transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id, approver_id } = req.params;

        // check the id is valid mongodb object id
        if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(approver_id)) {
            throw new Error('Invalid transfer id or approver id');
        }

        const transfer = await ProductTransfer.findById(id).session(session);
        if (!transfer || transfer.transfer_status !== 'pending') throw new Error('Invalid transfer');

        const fromStoreProduct = await StoreProduct.findOne({
            product_id: transfer.product_id,
            store_id: transfer.from_store,
        }).session(session);

        if (!fromStoreProduct || fromStoreProduct.quantity < transfer.quantity) {
            throw new Error('Insufficient stock at source');
        }

        fromStoreProduct.quantity -= transfer.quantity;
        await fromStoreProduct.save({ session });

        const toStoreProduct = await StoreProduct.findOneAndUpdate(
            { product_id: transfer.product_id, store_id: transfer.to_store },
            { $inc: { quantity: transfer.quantity } },
            { upsert: true, new: true, session }
        );


        transfer.transfer_status = 'approved';
        transfer.approved_by = new mongoose.Types.ObjectId(approver_id);
        await transfer.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.json(CreateResponse(true, toStoreProduct));

    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        return res.json(CreateResponse(false, null, error.message || 'An error occurred during approval'));

    }
}

export const RejectProductTransfer = async (req: Request, res: Response): Promise<any> => {
    try {
        // just mark the transfer as rejected
        const { id } = req.params;
        const transfer = await ProductTransfer.findById(id);
        if (!transfer) {
            return res.json(CreateResponse(false, null, "Product transfer not found"));
        }
        if (transfer.transfer_status !== 'pending') {
            return res.json(CreateResponse(false, null, "Product transfer is not pending"));
        }
        const updated = await ProductTransfer.findByIdAndUpdate(id, { transfer_status: 'rejected' });
        if (!updated) {
            return res.json(CreateResponse(false, null, "Failed to reject product transfer"));
        }
        return res.json(CreateResponse(true, "Product transfer rejected successfully"));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
};


export const allTransfers = async (req: Request, res: Response): Promise<any> => {
    try {
        const { store_id, incoming, outgoing, transfer_status } = req.query;
        // transfer_status can be pending, approved, rejected or all by default result pending
        if (incoming && outgoing) {
            return res.json(CreateResponse(false, null, "Incoming and outgoing cannot be true at the same time"));
        }

        if (!store_id || mongoose.isValidObjectId(store_id) === false) {
            return res.json(CreateResponse(false, null, "Invalid store_id"));
        }



        // by default incoming is true
        if(incoming && !outgoing) { 
        const incomingTransfers = await ProductTransfer.find({ to_store: store_id, transfer_status: transfer_status || 'pending' })
        .populate("product_id", ["name", "category", "subcategory", "payment_model", "description", "attributes", "images"])
        .populate("from_store", ["name", "hq"])
        .select('product_id quantity to_store from_store quantity transfer_status')
        .sort({ createdAt: -1 })
        .limit(10);
        if (!incomingTransfers) {
            return res.json(CreateResponse(false, null, "Failed to get incoming transfers"));
        }
        return res.json(CreateResponse(true, incomingTransfers));
        }
        if(outgoing && !incoming) { 
                    const outgoingTransfers = await ProductTransfer.find({ from_store: store_id, transfer_status: transfer_status || 'pending' })
        .populate("product_id", ["name", "category", "subcategory", "payment_model", "description", "attributes", "images"])
        .populate("to_store", ["name", "hq"]).select('product_id quantity from_store')
        .populate('from_store', 'name hq')
        .select('product_id quantity to_store quantity from_store transfer_status')
        .sort({ createdAt: -1 })
        .limit(10);
        if (!outgoingTransfers) {
            return res.json(CreateResponse(false, null, "Failed to get outgoing transfers"));
        }
        return res.json(CreateResponse(true, outgoingTransfers));
        }

        return res.json(CreateResponse(false, null, "Please specify incoming or outgoing transfers"));


    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}



// export const TransferKPI = async (req: Request, res: Response): Promise<any> => {
//     try {
//         const { store_id  } = req.query;
//         if (!store_id || mongoose.isValidObjectId(store_id) === false) {
//             return res.json(CreateResponse(false, null, "Invalid store_id"));
//         }

//         const transfers = await ProductTransfer.aggregate([
//             {
//                 $match: {
//                     $or: [
//                         { from_store: new mongoose.Types.ObjectId(store_id as string) },
//                         { to_store: new mongoose.Types.ObjectId(store_id as string) }
//                     ]
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$transfer_status",
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);

//         return res.json(CreateResponse(true, transfers));

//     } catch (error) {
//         return res.json(CreateResponse(false, null, error));
//     }
// }   



export const TransferKPI = async (req: Request, res: Response): Promise<any> => {
  try {
    const { store_id } = req.query;
    if (!store_id || !mongoose.isValidObjectId(store_id)) {
      return res.json(CreateResponse(false, null, "Invalid store_id"));
    }

    const objectId = new mongoose.Types.ObjectId(store_id as string);

    const [incoming, outgoing] = await Promise.all([
      ProductTransfer.countDocuments({
        to_store: objectId,
        transfer_status: 'pending',
      }),
      ProductTransfer.countDocuments({
        from_store: objectId,
        transfer_status: 'pending',
      }),
    ]);

    return res.json(CreateResponse(true, {
      incoming,
      outgoing,
    }));
  } catch (error) {
    return res.json(CreateResponse(false, null, error));
  }
};
