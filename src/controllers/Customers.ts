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