import express, { Router, Express } from 'express';
import * as productController from '../controllers/Product';
import multer from 'multer';
import path from 'path';

const router: Router = express.Router();





const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });




const productRoutes = (app: Express): Express => {
    router.post('/', upload.array('images', 3), productController.CreateProduct);
    router.get('/', productController.getProducts);
    router.delete('/:id', productController.DeleteProduct);
    router.patch('/:id', productController.UpdateProduct);
    router.get("/deactivate/:id/:flag", productController.deactivateProduct);
    router.get('/name', productController.getProductNameAndIds);
    router.get('/name/id', productController.productIdandName);
    return app.use('/products', router);
};

export { productRoutes };
