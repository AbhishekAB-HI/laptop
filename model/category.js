

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { 
    type: String,
    required: [true, "product name is required"],
    minlength: [3, "Enter minimum 3 charectors"], 
    maxlength: [20, "Enter maximum 20 charectors"],
    validate: [{
      validator: function (value) {
        return value.trim().length > 0
      },
      message: "product name cannot be consist of only space"
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
  }



});


const Category = mongoose.model("Category", categorySchema)

module.exports = Category




