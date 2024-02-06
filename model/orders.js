
const mongoose = require("mongoose");
const orderShema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    products: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
        },
        qty: {
            type: Number,
            default: 1
        },
        price: {
            type: Number,
            default: 1
        },
        totalPrice: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "shipped", "out for deliver", "canceled", "returned", "delivered"],
            default: "pending"
        },
     

    }],

    createdAt:{
        type:Date,
        default:Date.now()
    },
    cart:[{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        },
        qty: {
            type: Number,
            default: 1
        },
        price: {
            type: Number,
            default: 1
        },
        totalPrice: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["pending", "shipped", "canceled", "returned", "delivered"],
            default: "pending"
        },


    }]



})

module.exports = mongoose.model("Order", orderShema)