import express, { Router, Express } from 'express';
import * as userController from '../controllers/users';

const router: Router = express.Router();

const userRoutes = (app: Express): Express => {
    router.post('/create', userController.addUser);
    router.post('/login', userController.loginUser);
    router.post('/set-password', userController.setPassword);
    router.get('/all', userController.getUsers);
    router.delete('/delete/:id', userController.deleteUser);
    router.put('/update/password', userController.updatePassword);
    return app.use('/users', router);
};

export { userRoutes };
