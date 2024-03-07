
const mongoose = require("mongoose");
const orderShema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    data:{
        type:String,
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
            enum: ["pending", "Order placed", "shipped" ,"returnrequest","Payment Failed", "canceled", "returnApproved", "delivered"],
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
        couponDiscount:{
            type:Number,
            default:0
        }
     

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
    },
    subtotal:{
        type:Number,
        
    }



})

module.exports = mongoose.model("Order", orderShema)