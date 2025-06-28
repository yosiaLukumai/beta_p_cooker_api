import express, { Router, Express } from 'express';
import * as salesController from '../controllers/Sales';

const router: Router = express.Router();

const salesRoutes = (app: Express): Express => {
    router.post('/', salesController.createNewSale);
    return app.use('/sales', router);
};

export { salesRoutes };
