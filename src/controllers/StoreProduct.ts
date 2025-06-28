import { Request, Response } from 'express';
import StoreProduct from '../models/StoreProduct';
import Store from "../models/stores";
import { CreateResponse } from '../util/response';
import mongoose from 'mongoose';


export const HQaddStock = async (req: Request, res: Response): Promise<any> => {
    try {
        const { quantity, store_id, product_id } = req.body;
        const { role } = req.query;
        if (role !== 'admin') {
            return res.json(CreateResponse(false, null, "You are not allowed to add stock"));
        }

        // check valididy of store_id and product_id
        if (!store_id || !product_id || mongoose.isValidObjectId(store_id) === false || mongoose.isValidObjectId(product_id) === false) {
            return res.json(CreateResponse(false, null, "Invalid store_id or product_id"));
        }

        // check if the store_is is hq
        const store = await Store.findById(store_id);
        if (!store || store.hq === false) {
            return res.json(CreateResponse(false, null, "Invalid store"));
        }

        const product = await StoreProduct.findOneAndUpdate(
            { product_id, store_id },
            { $inc: { quantity } },
            { new: true, upsert: true }
        );

        if (!product) {
            return res.json(CreateResponse(false, null, "Product not found"));
        }


        return res.json(CreateResponse(true, "Stock added successfully"));

    }
    catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}


export const StockByStore = async (req: Request, res: Response): Promise<any> => {
    try {
        const { store_id } = req.query;

        // all store stock if it's admin
        if (req.query.role === 'admin' && store_id === 'all') {
            const products = await StoreProduct.find().populate("product_id", ["name", "category", "subcategory", "payment_model", "description", "attributes", "images"]).populate("store_id", ["name", "hq"]).select('product_id quantity store_id');
            if (!products) {
                return res.json(CreateResponse(false, null, "Failed to get products"));
            }
            return res.json(CreateResponse(true, products));
        }

        if (req.query.role != "admin" && store_id == "all") {
            return res.json(CreateResponse(false, null, "Not allowed"));
        }
        if (!store_id || mongoose.isValidObjectId(store_id) === false) {
            return res.json(CreateResponse(false, null, "Invalid store_id"));
        }
        const products = await StoreProduct.find({ store_id }).populate("product_id", ["name", "category", "subcategory", "payment_model", "description", "attributes", "images"]).select('product_id quantity');
        if (!products) {
            return res.json(CreateResponse(false, null, "Failed to get products"));
        }
        return res.json(CreateResponse(true, products));
    }
    catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}