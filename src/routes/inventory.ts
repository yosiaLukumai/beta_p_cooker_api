import express, { Router, Express } from 'express';
import * as inventoryController from '../controllers/StoreProduct';

const router: Router = express.Router();

const inventoryRoutes = (app: Express): Express => {
    router.post('/', inventoryController.HQaddStock);
    router.get('', inventoryController.StockByStore);
    return app.use('/inventory', router);
};

export { inventoryRoutes };
