import { Request, Response } from "express";
import Product from "../models/Products";
import { CreateResponse } from "../util/response";

export const getProductImages = async (req: Request, res: Response): Promise<any> => {
    try {
        const productpics = await Product.find().select("images");
        if (!productpics) {
            return res.json(CreateResponse(false, null, "Product not found"));
        }
        return res.json(CreateResponse(true, productpics));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
};
