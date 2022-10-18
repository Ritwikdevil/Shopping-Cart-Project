const express = require("express")
const router = express.Router();
const userController = require("../controllers/userController.js")
const productController = require("../controllers/productController.js")
const cartController = require("../controllers/cartController.js")
const { authentication, authorization } = require('../middlewares/auth.js');


router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile",authentication,authorization,userController.getUser)
router.put("/user/:userId/profile",authentication,authorization,userController.updateUser)

router.post("/products",productController.createProduct)
router.get("/products",productController.getProduct)
router.get('/products/:productId',productController.getProductsById);
router.put('/products/:productId',productController.updateProduct);
router.delete('/products/:productId',productController.deleteProduct);

router.post("/users/:userId/cart",authentication,authorization,cartController.createCart)
router.put("/users/:userId/cart",authentication,authorization,cartController.updateCart)






module.exports = router;