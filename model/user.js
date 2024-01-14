
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "product name is required"],
        minlength: [3, "Enter minimum 3 charectors"],
        maxlength: [20, "Enter maximum 20 charectors"],
        validate: {
            validator: function (value) {
                return value.trim().length > 0
            },
            message: "product name cannot be consist of only space"
        }
    },
    email: {
        type: String,
        required: true,
        lowercase: true,

    },
    password: {
        type: String,
        required: true,
        minlength: [6, "Password should be atleast 6 charectors"],


    },
    number: {
        type: Number,
        required: true,
        minlength: [10, "Number must be 10 digit"],

    },

    is_admin: {
        type: Number,
        required: true
    },
    is_verified: {
        type: Number,
        default: 0
    },
    is_Blocked: {
        type: Boolean,
        default: false

    },
    checkoutInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'checkout'
    },
    
    otp: {
        type: Number,
        required:false,
    },
 
    cart: {
        items: [{
            product_id: {
                type: String,
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
        }
        ],
        totalPrice: Number,
    },


})




module.exports = mongoose.model("users", userSchema)
