import express, { Router, Express } from 'express';
import * as salesController from '../controllers/Sales';

const router: Router = express.Router();

const salesRoutes = (app: Express): Express => {
    router.post('/', salesController.createNewSale);
    router.get('/daily-report', salesController.dailySalesReport);
    router.get("/kpi", salesController.SalesKPI);
    return app.use('/sales', router);
};

export { salesRoutes };
