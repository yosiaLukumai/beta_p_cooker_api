import { Request, Response } from 'express';
import User, { IUser } from '../models/Users';
import { CreateResponse } from '../util/response';
import { comparePassword, hashPassword } from '../util/passwords';
import mongoose from 'mongoose';
import { send_sms } from '../services/sendsms';



interface PopulatedUser extends Omit<IUser, 'store_id'> {
    store_id: {
        _id: string;
        name: string;
    } | null;
}




export const addUser = async (req: Request, res: Response): Promise<any> => {
    try {
        // sys_user_role this will be in the query params
        const { sys_user_role } = req.query;
        const { store_id, fname, lname, email, phone, role } = req.body;

        if (sys_user_role !== 'admin') {
            return res.json(CreateResponse(false, null, "You are not allowed to create user"));
        }

        console.log("Store id", store_id.name);
        // check if the id's are valid mongodb object ids
        if (!mongoose.Types.ObjectId.isValid(store_id)) {
            return res.json(CreateResponse(false, null, "Invalid store id"));
        }

        // create an otp then save it 
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_expires_at = new Date(Date.now() + 50 * 60 * 1000);
        console.log(otp, otp_expires_at);
        let saved = await User.create({
            email,
            fname,
            lname,
            phone,
            role,
            // password: "", // password will be set later
            store_id: store_id,
            is_active: false, // until when the password is set
            otp,
            otp_expires_at,
        });



        if (saved) {
            // fire and immediate sms sending service to send the otp to the user
            setImmediate(async () => {
                send_sms(`Hello ${fname}, Welcome to Positive Cooker Family your OTP for account setting is ${otp}. It is valid for 10 minutes.`, [{ phone: phone }]);
            });
            return res.json(CreateResponse(true, "User created.."))
        } else {
            return res.json(CreateResponse(false, null, "Failed to create user"));
        }
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }

}


export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { phone, password } = req.body;
    try {
        const user = await User.findOne({ phone })
        .populate('store_id', 'name hq') // populate only the 'name' and 'hq' fields
        .select('-otp -otp_expires_at -__v');
        if (!user) {
            return res.json(CreateResponse(false, null, "User not found"));
        }

        const comparison = await comparePassword(password, user.password || "");

        if (comparison) {
            return res.json(CreateResponse(true, user));
        } else {
            return res.json(CreateResponse(false, null, "Incorrect password"));
        }
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}



export const setPassword = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, otp, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.otp_expires_at === undefined) {
            return res.json(CreateResponse(false, null, "User not found"));
        }

        let now = new Date();
        if (now.getTime() > user.otp_expires_at.getTime()) {
            return res.json(CreateResponse(false, null, "OTP expired"));
        }
        // compare now the otp with the user otp
        if (user.otp !== otp) {
            return res.json(CreateResponse(false, null, "Incorrect OTP"));
        }

        // hash password
        let hashedPassword = await hashPassword(password);
        if (!hashedPassword) {
            return res.json(CreateResponse(false, null, "Failed to hash password"));
        }
        const updated = await User.findByIdAndUpdate(user.id, { password: hashedPassword });
        if (!updated) {
            return res.json(CreateResponse(false, null, "Failed to update password"));
        }
        return res.json(CreateResponse(true, "Password updated successfully"));


    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}



export const deleteUser = async (req: Request, res: Response): Promise<any> => {
    try {
        // only admin can delete user
        const { sys_user_role } = req.query;
        if (sys_user_role !== 'admin') {
            return res.json(CreateResponse(false, null, "You are not allowed to delete user"));
        }
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
        const { password, previousPassword, id } = req.body;
        const user = await User.findById(id);
        if (!user) {
            return res.json(CreateResponse(false, null, "User not found"));
        }
        // check the matching of the previous password

        const comparison = await comparePassword(previousPassword, user.password || "");
        if (!comparison) {
            return res.json(CreateResponse(false, null, "Incorrect previous password"));
        }

        // hash password
        let hashedPassword = await hashPassword(password);
        if (!hashedPassword) {
            return res.json(CreateResponse(false, null, "Failed to hash password"));
        }
        const updated = await User.findByIdAndUpdate(id, { password: hashedPassword });
        if (!updated) {
            return res.json(CreateResponse(false, null, "Failed to update password"));
        }
        return res.json(CreateResponse(true, "Password updated successfully"));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}




export const getUsers = async (req: Request, res: Response): Promise<any> => {
    try {
        const { page = 1, limit = 10, q } = req.query;
        const query: any = {};
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
            ];
        }
        const skip = (Number(page) - 1) * Number(limit);
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("store_id", "name") // only populate 'name'
            .lean<PopulatedUser[]>(); // return plain JS objects

        const transformedUsers = users.map((user) => {
            const storeName = (user.store_id as { name: string } | null)?.name || null;

            return {
                ...user,
                store_id: storeName,
            };
        });



        if (!transformedUsers) {
            return res.json(CreateResponse(false, null, "Failed to get users"));
        }
        const total = await User.countDocuments(query);
        return res.json(CreateResponse(true, {
            users: transformedUsers,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            total,
        }));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}


export const pauseUser = async (req: Request, res: Response): Promise<any> => {
    // this need to be done by admin only
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.json(CreateResponse(false, null, "User not found"));
        }
        user.is_active = false;
        const updated = await user.save();
        if (!updated) {
            return res.json(CreateResponse(false, null, "Failed to pause user"));
        }
        return res.json(CreateResponse(true, "User paused successfully"));
    } catch (error) {
        return res.json(CreateResponse(false, null, error));
    }
}