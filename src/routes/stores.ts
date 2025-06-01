import express, { Router, Express } from 'express';
import * as storeController from '../controllers/store';

const router: Router = express.Router();

const storeRoutes = (app: Express): Express => {
    router.post('/', storeController.createStore);
    router.get('/ids', storeController.getStoresIds);
    router.get('/all', storeController.getStores);
    router.get('/search/:name', storeController.searchStorebyName);
    return app.use('/api/store', router);
};

export { storeRoutes };
