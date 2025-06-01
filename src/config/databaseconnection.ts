import mongoose from 'mongoose';
import { exit } from 'process';


export async function ConnectToDatabase() {
    try {
        let databaseConnection = process.env.DATABASE_CONNECTION_STR;
        if (!databaseConnection) {
            console.log("No database connection string found");
            exit(1);
        }
        const connection = await mongoose.connect(databaseConnection);
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.log(error);
    }
}