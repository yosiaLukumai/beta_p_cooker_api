import { Request, Response } from 'express';
import User from '../models/Users';
import { CreateResponse } from '../util/response';
import { comparePassword, hashPassword } from '../util/passwords';



export const createUser = async (req: Request, res: Response): Promise<any> => {
    const { email, name, password, role } = req.body;
    try {


        let hashedPassword = await hashPassword(password);
        if (!hashedPassword) {
            return res.json(CreateResponse(false, null, "Failed to hash password"));
        }
        let saved = await User.create({
            email,
            name,
            password: hashedPassword,
            role
        });
        if (saved) {
            return res.json(CreateResponse(true, "User created.."))
        } else {
            return res.json(CreateResponse(false, null, "Failed to create user"));
        }
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }

}


export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json(CreateResponse(false, null, "User not found"));
        }
        const isPasswordCorrect = await hashPassword(password);
        const comparison = await comparePassword(password, isPasswordCorrect);
        if (comparison) {
            console.log(user);
            
            return res.json(CreateResponse(true, user));
        } else {
            return res.json(CreateResponse(false, null, "Incorrect password"));
        }
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}


export const getUsers = async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await User.find();
        if (!users) {
            return res.json(CreateResponse(false, null, "Failed to get users"));
        }
        return res.json(CreateResponse(true, users));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}


export const deleteUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            return res.json(CreateResponse(false, null, "Failed to delete user"));
        }
        return res.json(CreateResponse(true, "User deleted successfully"));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}


export const updatePassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { password, previousPassword } = req.body;
        if (previousPassword) {
            const isPasswordCorrect = await hashPassword(previousPassword);
            if (!isPasswordCorrect) {
                return res.json(CreateResponse(false, null, "Incorrect password"));
            }
        }
        // hash password
        let hashedPassword = await hashPassword(password);
        if (!hashedPassword) {
            return res.json(CreateResponse(false, null, "Failed to hash password"));
        }
        const updated = await User.findByIdAndUpdate(id, { hashedPassword });
        if (!updated) {
            return res.json(CreateResponse(false, null, "Failed to update password"));
        }
        return res.json(CreateResponse(true, "Password updated successfully"));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}