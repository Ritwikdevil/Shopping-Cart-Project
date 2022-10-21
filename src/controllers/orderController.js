const orderModel = require("../models/orderModel")
const cartModel = require("../models/cartModel")
const validation = require("../validation/validator.js")



const createOrder = async function (req, res) {
    try {
        const data = req.body
        const userId = req.params.userId

        let { cartId, cancellable, status } = data

        if (validation.isValidBody(data)) return res.status(400).send({ status: false, message: "Please provide the input data" })

        if (!validation.isValid(cartId)) return res.status(400).send({ status: false, message: "Enter the cartId" })
        if (!validation.isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "Enter a valid cartId" })
        let findCart = await cartModel.findById(cartId)
        if (!findCart) return res.status(404).send({ status: false, message: "cartId is not found" })

        if (findCart.userId.toString() != userId) return res.status(400).send({ status: false, message: "This cart doesnot belongs to your account" })

        if (cancellable) {
            if (cancellable != true || false) return res.status(400).send({ status: false, message: "cancellable should only contain a boolean value" })
        } else {
            data.cancellable = true
        }

        if (status) {
            if (status != "pending" && status != "completed" && status != "cancelled") return res.status(400).send({ status: false, message: "status can only contain pending,completed,cancelled" })
        } else {
            data.status = "pending"
        }

        let items = findCart.items
        let totalPrice = findCart.totalPrice
        let totalItems = findCart.totalItems

        if (items.length == 0) return res.status(400).send({ status: false, message: "The cart is empty you can't place a order" })

        let totalQuantity = 0

        for (let i = 0; i < items.length; i++) {
            totalQuantity += items[i].quantity
        }

        let obj = {
            userId: userId,
            items: items,
            totalPrice: totalPrice,
            totalItems: totalItems,
            totalQuantity: totalQuantity,
            cancellable: cancellable,
            status: status
        }
        let createOrder = await orderModel.create(obj)

        await cartModel.findOneAndUpdate({ _id: cartId }, { items: [], totalPrice: 0, totalItems: 0 })
        return res.status(201).send({ status: true, message: "Success", data: createOrder })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

const updateOrder = async function (req, res) {
    try {
        let orderId = req.body.orderId
        let userId = req.params.userId
        let status = req.body.status
        if (validation.isValidBody(req.body)) return res.status(400).send({ status: false, message: "Please provide the input data" })

        if (!validation.isValid(orderId)) return res.status(400).send({ status: false, message: "Enter the orderId" })

        if (!validation.isValid(status)) return res.status(400).send({ status: false, message: "Enter the status" })

        if (!validation.isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "Please provide a valid objectId" })

        if (status != "cancelled" && status != "completed" && status != "pending") return res.status(400).send({ status: false, message: "the status could either be cancelled or completed or pending!" })

        let findOrder = await orderModel.findById(orderId)
        if (!findOrder) return res.status(404).send({ status: false, message: "No order found with the give orderId" })
        if (findOrder.isDeleted == true) return res.status(400).send({ status: false, message: "This order is already deleted you can't update" })
       

        if (findOrder.userId.toString() != userId) return res.status(400).send({ status: false, message: "This order doesnot belongs to your account" })


        if (status == "cancelled") {

            if (findOrder.cancellable == false) return res.status(400).send({ status: false, message: "You can't cancel this order" })

            if (findOrder.status == "cancelled") return res.status(400).send({ status: false, message: "This order is already cancelled" })

            let updateOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: "cancelled" }, { new: true })
            return res.status(200).send({ status: true, message: "Success", data: updateOrder })
        }
        if (status == "completed") {

            if (findOrder.status == "completed") return res.status(400).send({ status: false, message: "This order is already completed" })

            if (findOrder.status == "cancelled") return res.status(400).send({ status: false, message: "This order is already cancelled , after cancellation you can't update it to completed" })

            let updateOrder = await orderModel.findOneAndUpdate({ _id: orderId }, { status: "completed" }, { new: true })
            return res.status(200).send({ status: true, message: "Success", data: updateOrder })

        }
        if (status == "pending") {
            if (findOrder.status == "pending") return res.status(400).send({ status: false, message: "This order is already in pending" })

            if (findOrder.status == "cancelled") return res.status(400).send({ status: false, message: "This order is already cancelled , after cancellation you can't update it to pending" })

            if (findOrder.status == "completed") return res.status(400).send({ status: false, message: "This order is already completed, after completion you can't update it to pending" })

        }

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createOrder, updateOrder }