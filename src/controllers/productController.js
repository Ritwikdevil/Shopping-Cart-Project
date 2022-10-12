const productModel = require("../models/productModel.js")
const validation = require("../validation/validator")
const aws = require("../Aws/aws.js")


const createProduct = async function (req, res) {
    try {
        let data = req.body
        let files = req.files
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data

        if (validation.isValidBody(data)) return res.status(400).send({ status: false, msg: "please provide  details" })

        if (!validation.isValid(title)) return res.status(400).send({ status: false, message: "first name is required or not valid" })
        let checkTitle = await productModel.findOne({ title: title })
        if (checkTitle) return res.status(409).send({ status: false, message: "title already exist enter another title" })

        if (!validation.isValid(description)) return res.status(400).send({ status: false, message: "description is required" })

        if (!validation.isValid(price)) return res.status(400).send({ status: false, message: "price is required" })
        if (!validation.isValidPrice(price)) return res.status(400).send({ status: false, message: "price should be a number" })

        if (!validation.isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is required" })
        if (currencyId != "INR") return res.status(400).send({ status: false, message: "CurrencyId Should be INR only & in UpperCase" })

        if (!validation.isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is required" })
        if (currencyId != "INR") return res.status(400).send({ status: false, message: "CurrencyId Should be INR only & in UpperCase" })

        // if (!validation.isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat is required" })
        // if (currencyFormat != "₹") return res.status(400).send({ status: false, message: "CurrencyFormat Should be ₹ only" })

        if (isFreeShipping) {
            if (isFreeShipping != true || false) return res.status(400).send({ status: false, message: "isFreeShipping only contain a boolean value" })
        }

        if (!validation.isValid(availableSizes)) return res.status(400).send({ status: false, message: "availableSize is required" })
        if (!validation.isValidSize(availableSizes)) return res.status(400).send({ status: false, message: "please enter a valid size" })

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
        data = req.params
        const findProduct = await productModel.find({ isdeleted: false, data }).sort({ price: 1 })
        res.status(200).send({ status: true,message:"Success", data: findProduct })

    } catch (err) {
        res.status(500).send({ msg: "Error", error: err.message })
    }
}

module.exports = { createProduct, getProduct }
