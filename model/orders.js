
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
            enum: ["pending", "confirmed", "shipped" ,"returnrequest","out for deliver", "canceled", "returnApproved", "delivered"],
            default: "pending"
        },
        address: {
            type: String,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true 
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
            enum: ["pending", "shipped", "canceled","returnrequest","returnApproved", "delivered"],
            default: "pending"
        },


    }],

    rayzorpayId:{
        type:String,
        required:false
    }



})

module.exports = mongoose.model("Order", orderShema)