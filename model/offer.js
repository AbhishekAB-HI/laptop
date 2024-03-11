
const mongoose=require("mongoose");
  
const OfferShema = new mongoose.Schema({
    
    offername: {
        type: String,
        required: [true, "coupon name is required"],
        minlength: [3, "coupon name must be at least 3 charecters long"],
        maxlength: [40, "coupon name cannot exceed 100 characters"],
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

    percentage: {
        type: Number,
        required: true,
        min: [1, "percentage Required"]
    },
   
    startdate:{
        type:Date,
        required: true,

    },
    enddate:{
        type:Date,
        required: true,

    },

    user:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }]


})

module.exports = mongoose.model("offer", OfferShema);



