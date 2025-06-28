import express, { Router, Express } from 'express';
import * as generalController from '../controllers/General';

const router: Router = express.Router();

const generalRoutes = (app: Express): Express => {
    router.get('/pictures', generalController.getProductImages);
    return app.use('/data', router);
};

export { generalRoutes };
