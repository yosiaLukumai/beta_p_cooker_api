import express, { Router, Express } from 'express';
import * as customerController from '../controllers/Customers';

const router: Router = express.Router();

const customerRoutes = (app: Express): Express => {
    router.get('/:phone', customerController.searchCustomer);
    router.get('/', customerController.tabularCustomer);
    router.post('/', customerController.createCustomer);
    return app.use('/customers', router);
};

export { customerRoutes };
