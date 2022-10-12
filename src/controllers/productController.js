const productModel = require("../models/productModel.js")
const validation = require("../validation/validator")
const aws = require("../Aws/aws.js")


const createProduct = async function (req, res) {
    try {
        let data = req.body
        let files = req.files
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        if (validation.isValidBody(data)) return res.status(400).send({ status: false, msg: "please provide  details" })

        if (!validation.isValid(title)) return res.status(400).send({ status: false, message: "first name is required" })
        let checkTitle = await productModel.findOne({ title: title })
        if (checkTitle) return res.status(409).send({ status: false, message: "title already exist enter another title" })

        if (!validation.isValid(description)) return res.status(400).send({ status: false, message: "description is required" })

        if (!validation.isValid(price)) return res.status(400).send({ status: false, message: "price is required" })
        if (!validation.isValidPrice(price)) return res.status(400).send({ status: false, message: "price should be a number" })

        if (!validation.isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is required" })
        if (currencyId != "INR") return res.status(400).send({ status: false, message: "CurrencyId Should be INR only & in UpperCase" })

        if (!validation.isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is required" })
        if (currencyId != "INR") return res.status(400).send({ status: false, message: "CurrencyId Should be INR only & in UpperCase" })

        if (isFreeShipping) {
            if (isFreeShipping != true || false) return res.status(400).send({ status: false, message: "isFreeShipping only contain a boolean value" })
        }

        if (!validation.isValid(availableSizes)) return res.status(400).send({ status: false, message: "availableSize is required" })
        availableSizes = availableSizes.split(',').map((item) => item.trim())
        for (let i = 0; i < availableSizes.length; i++) {
            if (!validation.isValidSize(availableSizes[i])) return res.status(400).send({ status: false, message: "Please mention valid Size!" });
        }

        if (installments) {
            if (!validation.isValidNum(installments)) return res.status(400).send({ status: false, message: "please enter a valid installment number" })
        }

        if (files && files.length == 0) {
            return res.status(400).send({ msg: "No file found" })
        }
        let uploadedProductImage = await aws.uploadFile(files[0])

        data.productImage = uploadedProductImage
        data.deletedAt = null
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

        //checking for any queries
        if (validation.isValid(data)) {
            //getting the products
            let getProducts = await productModel.find(conditions).sort({ price: 1 });
            if (getProducts.length == 0) return res.status(404).send({ status: false, message: "No products found" });

            //   return res.status(200).send({ status: true, count: getProducts.length, message: "Success", data: getProducts })
        }

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

module.exports = { createProduct, getProduct }
