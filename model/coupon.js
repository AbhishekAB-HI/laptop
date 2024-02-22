
const mongoose=require("mongoose");
  
const CouponShema = new mongoose.Schema({


    couponcode: {
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
    usagelimit: {
        type: Number,
        required: true,
        min: [1, "Minimum value is 1"]

    },
    minamount: {
        type: Number,
        required: true,
        min:[1, "Minimum value is 1"]

    },
    maxamount: {   
        type: Number,
        required: true,
        min:[1, "Minimum value is 1"]
      
    },
    user:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }]



})

module.exports = mongoose.model("coupon", CouponShema);



