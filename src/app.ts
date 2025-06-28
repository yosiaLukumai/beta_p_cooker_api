import express from 'express';
import { userRoutes } from './routes/users';
import { storeRoutes } from './routes/stores';

import cors from "cors";
import { productRoutes } from './routes/product';
import { inventoryRoutes } from './routes/inventory';
import { transferRoutes } from './routes/Transfer';
import { salesRoutes } from './routes/sales';
import { customerRoutes } from './routes/customers';


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// enabling CORS
app.use(cors());

// testing the server
app.get("/ping", (req, res) => {
    res.send("pong 👌 positive cooker api is Live! for real");
});

userRoutes(app);
storeRoutes(app);
productRoutes(app);
transferRoutes(app);
salesRoutes(app);
customerRoutes(app);
inventoryRoutes(app);


// allow uploading files
app.use('/public', express.static('public'));



export default app;
