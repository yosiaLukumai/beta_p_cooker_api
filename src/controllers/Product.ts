import { Request, Response } from 'express';
import Product from '../models/Products';
import { CreateResponse } from '../util/response';

export const CreateProduct = async (req: Request, res: Response): Promise<any>  => {
  try {
    const {
      name,
      category,
      subcategory,
      starting_price,
      payment_model,
      description,
      attributes,
      images,
    } = req.body;

    const saved = await Product.create({
      name,
      category,
      subcategory,
      starting_price,
      payment_model,
      description,
      attributes,
      images,
    });

    if(saved) {
        return res.json(CreateResponse(true, "Product created successfully"));
    }else {
        return res.status(400).json(CreateResponse(false, null, 'Failed to create product'));
    }

  } catch (error) {
    console.error('[createProduct]', error);
    
    return res.status(500).json(CreateResponse(false, null, 'Failed to create product'));
  }
};

export const getProducts = async (req: Request, res: Response): Promise<any>  => {
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

    if (!products.length) {
      return res.status(404).json(CreateResponse(false, null, 'No products found'));
    }

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json(
      CreateResponse(true, {
        data: products,
        page,
        totalPages,
        total,
      })
    );
  } catch (error) {
    console.error('[getProducts]', error);
    return res
      .status(500)
      .json(CreateResponse(false, null, 'Failed to fetch products'));
  }
};
