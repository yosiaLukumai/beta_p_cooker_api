import express, { Router, Express } from 'express';
import * as transferController from '../controllers/Transfer';

const router: Router = express.Router();

const transferRoutes = (app: Express): Express => {
    router.get('/approve/:id/:approver_id', transferController.ApproveProductTransfer);
    router.get('/reject/:id', transferController.RejectProductTransfer);
    router.post('/', transferController.TransferrStock);
    router.get("", transferController.allTransfers);
    router.get('/kpi', transferController.TransferKPI);
    return app.use('/stock/transfer', router);
};

export { transferRoutes };
