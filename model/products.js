
const mongoose=require("mongoose");
  
const productSchema = new mongoose.Schema({

    productname: {
        type: String,
        required: [true, "product name is required"],
        minlength: [3, "product name must be at least 3 charecters long"],
        maxlength: [40, "product name cannot exceed 100 characters"],
        validate: [{
            validator: function (value) {
                return value.trim().length > 0
            },
            message: "Do not enter only space charecters"
        },
        {
            validator: function (value) {
                // Use a regular expression to block the "@" symbol
                return !/[!@#$%^&*(),.?":{}|<>]/.test(value);
            },
            message: 'Field cannot contain only symbol'
        }]

    },

    productprice: {
        type: Number,
        required: true,
        min: [0, "price cannote be negative"]
    },
    productsize: {
        type: String,
        required: true,
        min: [0, "price cannote be negative"]

    },
    productquantity: {
        type: Number,
        required: true,
        min:[0, "price cannote be negative"]

    },
    images: {   
        type: Array,
        required: true,
      
    },
    is_user: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    is_list: {
        type: Boolean,
        default: false
    }



})

module.exports = mongoose.model("product", productSchema);



