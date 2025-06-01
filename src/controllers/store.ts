import { Request, Response } from 'express';
import Stores from '../models/stores';
import { CreateResponse } from '../util/response';

export const createStore = async (req: Request, res: Response): Promise<any> => {
    const { name, region, contact, store_code, location } = req.body;
    try {
        let saved = await Stores.create({
            name,
            region,
            contact,
            store_code,
            location: {
                address: location?.address || "",
                lat: location?.lat || 0,
                lng: location?.lng || 0
            },
        })
        if (saved) {
            return res.json(CreateResponse(true, "Store created.."))
        } else {
            return res.json(CreateResponse(false, null, "Failed to create store"));
        }
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}

export const getStoresIds = async (req: Request, res: Response): Promise<any> => {
    try {
        const stores = await Stores.find().select('_id name region');
        if (!stores) {
            return res.json(CreateResponse(false, null, "Failed to get stores"));
        }
        return res.json(CreateResponse(true, stores));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}



export const getStores = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20, q, region, manager_id } = req.query;

    const query: any = {};

    // Full-text search
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { region: { $regex: q, $options: 'i' } },
      ];
    }

    if (region) query.region = region;
    if (manager_id) query.manager_id = manager_id;

    const skip = (Number(page) - 1) * Number(limit);

    const stores = await Stores.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Stores.countDocuments(query);

    return res.status(200).json(
      CreateResponse(true, {
        stores,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        total,
      })
    );
  } catch (error) {
    console.error('[getStores] Error:', error);
    return res.status(500).json(
      CreateResponse(false, null, 'Something went wrong while fetching stores')
    );
  }
};

export const searchStorebyName = async (req: Request, res: Response): Promise<any> => {
    try {
        const name = req.query.name as string;
        if (!name || name.trim() === "") {
            return res.json(CreateResponse(false, null, "Store name is required"));
        }
        const stores = await Stores.find({ name: new RegExp(name, 'i') });
        if (stores.length === 0) {
            return res.json(CreateResponse(false, null, "No stores found"));
        } else if (!stores) {
            return res.json(CreateResponse(false, null, "Failed to get stores"));
        }
        return res.json(CreateResponse(true, stores));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}