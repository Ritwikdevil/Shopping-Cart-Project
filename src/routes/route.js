const express = require("express")
const router = express.Router();
const userController = require("../controllers/userController.js")
const productController = require("../controllers/productController.js")
const cartController = require("../controllers/cartController.js")
const orderController = require("../controllers/orderController.js")
const { authentication, authorization } = require('../middlewares/auth.js');

//-------------------------------USER API---------------------------------//

router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile", authentication, authorization, userController.getUser)
router.put("/user/:userId/profile", authentication, authorization, userController.updateUser)

//-------------------------------PRODUCT API---------------------------------//

router.post("/products", productController.createProduct)
router.get("/products", productController.getProduct)
router.get('/products/:productId', productController.getProductsById);
router.put('/products/:productId', productController.updateProduct);
router.delete('/products/:productId', productController.deleteProduct);

//-------------------------------CART API---------------------------------//

router.post("/users/:userId/cart", authentication, authorization, cartController.createCart)
router.put("/users/:userId/cart", authentication, authorization, cartController.updateCart)
router.get("/users/:userId/cart", authentication, authorization, cartController.getCart)
router.delete("/users/:userId/cart", authentication, authorization, cartController.deleteCart)

//-------------------------------ORDER API---------------------------------//

router.post("/users/:userId/orders", authentication, authorization, orderController.createOrder)
router.put("/users/:userId/orders", authentication, authorization, orderController.updateOrder)



router.all("/*/", async function (req, res){

    res.status(404).send({status:false, msg: "Wrong url"})
})





module.exports = router;