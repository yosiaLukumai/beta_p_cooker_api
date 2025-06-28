import { Request, Response } from 'express';
import Product from '../models/Products';
import { CreateResponse } from '../util/response';

import fs from 'fs';
import path from 'path';

export const CreateProduct = async (req: Request, res: Response): Promise<any> => {
  const imagePaths = (req.files as Express.Multer.File[])?.map(file =>
    file.path.replace('', '')
  );

  try {
    const {
      name,
      category,
      subcategory,
      starting_price,
      payment_model,
      description,
      attributes,
    } = req.body;

    const saved = await Product.create({
      name,
      category,
      subcategory,
      starting_price,
      payment_model,
      description,
      attributes,
      images: imagePaths,
    });

    if (saved) {
      return res.json(CreateResponse(true, "Product created successfully"));
    } else {
      throw new Error('Failed to create product');
    }

  } catch (error: any) {
    if (imagePaths && imagePaths.length > 0) {
      for (const img of imagePaths) {
        const filePath = path.join('', img);
        fs.unlink(filePath, err => {
          if (err) console.error(`❌ Failed to delete file ${filePath}:`, err.message);
          else console.warn(`🗑️ Deleted file: ${filePath}`);
        });
      }
    }

    return res.json(
      CreateResponse(false, null, error?.code === 11000 ? "Duplicate entry" : error.message || error)
    );
  }
};



export const getProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const { q, category, subcategory, payment_model, is_active } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (q) query.name = { $regex: q, $options: 'i' };
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (payment_model) query.payment_model = payment_model;
    if (is_active !== undefined) query.is_active = is_active === 'true';

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    if (products.length === 0) {
      return res.json(CreateResponse(true, [], ""));
    }

    if (!products.length) {
      return res.json(CreateResponse(false, null, "No products found"));
    }


    const totalPages = Math.ceil(total / limit);

    return res.json(
      CreateResponse(true, {
        data: products,
        page,
        totalPages,
        total,
      })
    );
  } catch (error) {
    return res
      .json(CreateResponse(false, null, 'Failed to fetch products'));
  }
};



export const getProductNameAndIds = async (req: Request, res: Response): Promise<any> => {
  try {
    const product = await Product.find({ is_active: true }).select("_id starting_price payment_model name category subcategory description attributes");
    if (!product) {
      return res.json(CreateResponse(false, null, "Product not found"));
    }
    return res.json(CreateResponse(true, product));
  } catch (error) {
    return res.json(CreateResponse(false, null, error));
  }
};


export const DeleteProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.json(CreateResponse(false, null, "Product not found"));
    }
    return res.json(CreateResponse(true, "Product deleted successfully"));
  } catch (error) {
    return res.json(CreateResponse(false, null, error));
  }
};



export const UpdateProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, category, subcategory, starting_price, payment_model, description, attributes, images } = req.body;

    const product = await Product.findByIdAndUpdate(id, {
      name,
      category,
      subcategory,
      starting_price,
      payment_model,
      description,
      attributes,
      images,
    });
    if (!product) {
      return res.json(CreateResponse(false, null, "Product not found"));
    }
    return res.json(CreateResponse(true, "Product updated successfully"));
  } catch (error) {
    return res.json(CreateResponse(false, null, error));
  }
};


export const deactivateProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id, flag } = req.params;

    const product = await Product.findByIdAndUpdate(id, { is_active: flag == "true" ? false : true });
    if (!product) {
      return res.json(CreateResponse(false, null, "Product not found"));
    }
    return res.json(CreateResponse(true, flag=="true" ? "Product deactivated successfully" : "Product activated successfully"));
  } catch (error) {
    return res.json(CreateResponse(false, null, error));
  }
};