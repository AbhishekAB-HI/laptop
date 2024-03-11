
const mongoose=require("mongoose");
  
const bannerSchema = new mongoose.Schema({

    bannername: {
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

    bannertitle: {
        type: String,
        required: true,
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
    description: {
        type: String,
        required: true,
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

    images: {   
        type: Array,
        required: true,
      
    },
  
 
})

module.exports = mongoose.model("banner", bannerSchema);



