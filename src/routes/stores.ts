import express, { Router, Express } from 'express';
import * as storeController from '../controllers/store';

const router: Router = express.Router();

const storeRoutes = (app: Express): Express => {
    router.post('/', storeController.createStore);
    return app.use('/api/store', router);
};

export { storeRoutes };
