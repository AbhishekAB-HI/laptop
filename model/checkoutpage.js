
const mongoose=require("mongoose");


const checkoutSchema = new mongoose.Schema({

    firstName: {
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
    lastName: {
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




})


module.exports = mongoose.model("checkout", checkoutSchema) 