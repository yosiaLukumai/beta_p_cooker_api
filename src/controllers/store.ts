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

export const getStores = async (req: Request, res: Response): Promise<any> => {
    try {
        const stores = await Stores.find();
        if (!stores) {
            return res.json(CreateResponse(false, null, "Failed to get stores"));
        }
        return res.json(CreateResponse(true, stores));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}


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