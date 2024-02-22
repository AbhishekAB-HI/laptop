
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "product name is required"],
        minlength: [3, "Enter minimum 3 charectors"],
        maxlength: [20, "Enter maximum 20 charectors"],
        validate: [{
            validator: function (value) {
                return value.trim().length > 0
            },
            message: "name cannot be consist of only space"
        },
        {
            validator: function (value) {
                // Use a regular expression to block the "@" symbol
                return !/[!@#$%^&*(),.?":{}|<>]/.test(value);
            },
            message: 'Field cannot contain only symbol'
        }]
    },
    images: {   
        type: Array,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,

    },
    password: {
        type: String,
        minlength: [6, "Password should be atleast 6 charectors"],
        required: true,
        validate: {
            validator: function (value) {
                console.log(value, "lolololol");
                // Password should be at least 8 characters long and contain at least one special character
                return value.length >= 8;
            },
            message: "This is not a valid password. It should be at least 8 characters long and contain at least one special character",
        },


    },
    number: {
        type: Number,
        minlength: [10, "Number must be 10 digit"],
        required: true,

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
        required: false,
    },
    wallet:{
        type:Number,
        default:0,
    },
    walletHistory:[{
        amount:{
            type:Number,
            default:0
        },
        direction:{
            type:String
        }
    }],

    cart: {
        items: [{
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

        }
        ],

    },
    totalAmount: {
        type: Number,
        default: 0
    },
    totalQty: {
        type: Number,
        default: 0
    },
    address: {
        type: String,
        default: "address",
    },

    address1: [{
        firstName: {
            type: String,
            required: [true, "product name is required"],
            minlength: [3, "Enter minimum 3 charectors"],
            maxlength: [20, "Enter maximum 20 charectors"],
            validate: [{
                validator: function (value) {
                    return value.trim().length > 0
                },
                message: "product name cannot be consist of only space"
            }, {
                validator: function (value) {
                    // Use a regular expression to block the "@" symbol
                    return !/[!@#$%^&*(),.?":{}|<>]/.test(value);
                },
                message: 'Field cannot contain only symbol'
            }]
        },
        lastName: {
            type: String,
            required: [true, "product name is required"],
            minlength: [3, "Enter minimum 3 charectors"],
            maxlength: [20, "Enter maximum 20 charectors"],
            validate: [{
                validator: function (value) {
                    return value.trim().length > 0
                },
                message: "product name cannot be consist of only space"
            }, {
                validator: function (value) {
                    // Use a regular expression to block the "@" symbol
                    return !/[!@#$%^&*(),.?":{}|<>]/.test(value);
                },
                message: 'Field cannot contain only symbol'
            }]

        },
        city: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
        },
        address: {
            type: String,
            required: true

        },
        state: {
            type: String,
            required: true
        },

    }],
    payment: [{
        address: {
            type: String,
            required: false
        },
        paymentMethod: {
            type: String,
            required: false 
        },
        status: {
            type: String,
            enum: ["pending", "shipped", "canceled", "returned", "delivered"],
            default: "pending"
        },


    }],

    orderlist: [{
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


module.exports = mongoose.model("users", userSchema);





