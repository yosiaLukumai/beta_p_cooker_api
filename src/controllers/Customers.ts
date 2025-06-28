import { Request, Response } from "express";
import Customer from "../models/Customer";
import { CreateResponse } from "../util/response";

export const searchCustomer = async (req: Request, res: Response): Promise<any> => {
    try {
        const phone = req.params.phone;
        if (!phone || phone.trim() === "") {
            return res.json(CreateResponse(false, null, "Customer phone is required"));
        }
        const customer = await Customer.findOne({ phone })
        if (!customer) {
            return res.json(CreateResponse(false, null, "Customer not found"));
        }
        return res.json(CreateResponse(true, customer));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
};


export const createCustomer = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, phone, email } = req.body;
        if (!name || !phone) {
            return res.json(CreateResponse(false, null, "Name and phone are required"));
        }
        const existingCustomer = await Customer.findOne({ phone });
        if (existingCustomer) {
            return res.json(CreateResponse(false, null, "Customer already exists"));
        }
        const customer = await Customer.create({ name, phone, email });
        if (customer) {
            return res.json(CreateResponse(true, customer));
        } else {
            return res.json(CreateResponse(false, null, "Failed to create customer"));
        }
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}


export const tabularCustomer = async (req: Request, res: Response): Promise<any> => {
    try {
        const { page = 1, limit = 10, q, region, district, ward, street } = req.query;
        const query: any = {};
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } },
            ];
        }

        if (region) query.region = region;
        if (district) query.district = district;
        if (ward) query.ward = ward;
        if (street) query.street = street;

        const skip = (Number(page) - 1) * Number(limit);

        const customers = await Customer.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Customer.countDocuments(query);

        return res.json(
            CreateResponse(true, {
                customers,
                page: Number(page),
                totalPages: Math.ceil(total / Number(limit)),
                total,
            })
        );
    } catch (error) {
        console.error('[tabularCustomer] Error:', error);
        return res.json(
            CreateResponse(false, null, 'Something went wrong while fetching customers')
        );
    }   
}