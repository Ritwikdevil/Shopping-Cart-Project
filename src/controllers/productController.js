const productModel = require("../models/productModel.js")
const validation = require("../validation/validator")
const aws = require("../Aws/aws.js")


const createProduct = async function (req, res) {
    try {
        let data = req.body
        let files = req.files
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        if (validation.isValidBody(data)) return res.status(400).send({ status: false, msg: "please provide  details" })

        if (!validation.isValid(title)) return res.status(400).send({ status: false, message: "title is required" })
        let checkTitle = await productModel.findOne({ title: title })
        if (checkTitle) return res.status(409).send({ status: false, message: "title already exist enter another title" })

        if (!validation.isValid(description)) return res.status(400).send({ status: false, message: "description is required" })

        if (!validation.isValid(price)) return res.status(400).send({ status: false, message: "price is required" })
        if (!validation.isValidPrice(price)) return res.status(400).send({ status: false, message: "price should be a number" })

        if (!validation.isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is required" })
        if (currencyId != "INR") return res.status(400).send({ status: false, message: "CurrencyId Should be INR only & in UpperCase" })

        if (isFreeShipping) {
            if (isFreeShipping != true || false) return res.status(400).send({ status: false, message: "isFreeShipping only contain a boolean value" })
        }

        if (!validation.isValid(availableSizes)) return res.status(400).send({ status: false, message: "availableSize is required" })

        availableSizes = availableSizes.toUpperCase().split(',').map((item) => item.trim())
        for (let i = 0; i < availableSizes.length; i++) {
            if (!validation.isValidSize(availableSizes[i])) return res.status(400).send({ status: false, message: `Please mention valid Size between ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` });
        }
        data.availableSizes = availableSizes

        if (installments) {
            if (!validation.isValidNum(installments)) return res.status(400).send({ status: false, message: "please enter a valid installment number" })
        }

        if (files && files.length == 0) {
            return res.status(400).send({ msg: "No productImage found" })
        }
        let uploadedProductImage = await aws.uploadFile(files[0])

        data.productImage = uploadedProductImage
        data.currencyFormat = "₹"

        let createProduct = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Success", data: createProduct })


    } catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
}

const getProduct = async function (req, res) {

    try {
        let data = req.query;
        let conditions = { isDeleted: false };


        //validating the filter - SIZE
        if (data?.size || typeof data.size == 'string') {
            data.size = data.size.toUpperCase();
            if (!validation.isValid(data.size)) return res.status(400).send({ status: false, message: "Enter a valid value for size and remove spaces" })

            conditions.availableSizes = {}
            conditions.availableSizes['$in'] = [data.size]
        }

        //validating the filter - NAME
        if (data?.name || typeof data.name == 'string') {
            if (!validation.isValid(data.name)) return res.status(400).send({ status: false, message: "Enter a valid value for product name and remove spaces" })

            //using $regex to match the names of products & "i" for case insensitive.
            conditions.title = {};
            conditions.title['$regex'] = data.name
            conditions.title['$options'] = 'i'
        }

        //validating the filter - PRICEGREATERTHAN
        if (data?.priceGreaterThan || typeof data.priceGreaterThan == 'string') {
            if (!validation.isValidString(data.priceGreaterThan)) return res.status(400).send({ status: false, message: "Price of product should be in numbers" });

            data.priceGreaterThan = JSON.parse(data.priceGreaterThan);
            if (!validation.isValidNum(data.priceGreaterThan)) return res.status(400).send({ status: false, message: "Price of product should be valid" });

            if (!conditions?.price) {
                conditions.price = {}
            }
            conditions.price['$gte'] = data.priceGreaterThan;
        }

        //validating the filter - PRICELESSTHAN
        if (data?.priceLessThan || typeof data.priceLessThan == 'string') {
            if (!validation.isValidString(data.priceLessThan)) return res.status(400).send({ status: false, message: "Price of product should be in numbers" });

            data.priceLessThan = JSON.parse(data.priceLessThan);
            if (!validation.isValidNum(data.priceLessThan)) return res.status(400).send({ status: false, message: "Price of product should be valid" });

            if (!conditions?.price) {
                conditions.price = {}
            }
            conditions.price['$lte'] = data.priceLessThan
        }

        //get the products with the condition provided
        let getFilterData = await productModel.find(conditions).sort({ price: 1 })
        if (getFilterData.length == 0) return res.status(404).send({ status: false, message: "No products found" });

        res.status(200).send({ status: true, count: getFilterData.length, message: "Success", data: getFilterData })

    } catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
}


const getProductsById = async (req, res) => {
    try {
        let productId = req.params.productId;

        //checking is product id is valid or not
        if (!validation.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: 'Please provide valid productId' })
        }

        //getting the product by it's ID
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return res.status(404).send({ status: false, message: "No product found" })

        return res.status(200).send({ status: true, message: 'Success', data: product })
    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

const updateProduct = async function (req, res) {

    try {
        let data = req.body
        let files = req.files
        let productId = req.params.productId
        let { title, price, isFreeShipping, availableSizes, installments } = data

        if (validation.isValidBody(data)) return res.status(400).send({ status: false, message: "please put required input to update" })
        
        if (!validation.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "provide a valid productId" })
        let findProduct = await productModel.findOne({ _id: productId })
        if (!findProduct) return res.status(404).send({ status: false, message: "Product is not found" })

        if (title) {
            if (checkTitle) return res.status(409).send({ status: false, message: "title already exist enter another title" })
        }
        if (price) {
            if (!validation.isValidPrice(price)) return res.status(400).send({ status: false, message: "price should be a number" })
        }
        if (isFreeShipping) {
            isFreeShipping = JSON.parse(isFreeShipping)
            if (isFreeShipping != true && isFreeShipping != false) return res.status(400).send({ status: false, message: "isFreeShipping only contain a boolean value" })
        }
        if (availableSizes) {
            availableSizes = availableSizes.toUpperCase().split(',').map((item) => item.trim())
            for (let i = 0; i < availableSizes.length; i++) {
                if (!validation.isValidSize(availableSizes[i])) return res.status(400).send({ status: false, message: "Please mention valid Size!" });
            }
        }
        if (installments) {
            if (!validation.isValidNum(installments)) return res.status(400).send({ status: false, message: "please enter a valid installment number" })
        }
        if (availableSizes) {
            
            let sizeArray = findProduct.availableSizes
            for (let i = 0; i < sizeArray.length; i++) {
                availableSizes.push(sizeArray[i])
            }
            let result = [... new Set(availableSizes)]
            data.availableSizes = result
            
        }

        if (files.length != 0) {
            if (files && files.length == 0) {
                return res.status(400).send({ msg: "No file found" })
            }
            let uploadedFileURL = await aws.uploadFile(files[0])
            data.productImage = uploadedFileURL
        }



        let updateProduct = await productModel.findOneAndUpdate({ _id: productId }, { $set: data }, { new: true })
        res.status(200).send({ status: false, message: "Success", data: updateProduct })
    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }

}

const deleteProduct = async function (req, res) {
    try {

        let productId = req.params.productId

        if (!validation.isValidObjectId(productId)) {
            return res.status(404).send({ status: false, message: "Product id is not valid" })
        }

        let findProduct = await productModel.findById({ _id: productId })

        if (!findProduct) return res.status(404).send({ status: false, message: "Product is not found" })
        if (findProduct.isDeleted == true) return res.status(404).send({ status: false, message: "Product is already delted" })
        await productModel.findOneAndUpdate({ _id: productId },
            { $set: { isDeleted: true, deletedAt: new Date() } })

        return res.status(200).send({ status: true, message: "Product has been deleted successfully" })

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}


module.exports = { createProduct, getProduct, getProductsById, updateProduct, deleteProduct }
