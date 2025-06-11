import express, { Router, Express } from 'express';
import * as productController from '../controllers/Product';

const router: Router = express.Router();

const productRoutes = (app: Express): Express => {
    router.post('/', productController.CreateProduct);
    router.get('/', productController.getProducts);
    return app.use('/products', router);
};

export { productRoutes };
