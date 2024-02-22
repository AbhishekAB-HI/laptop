

const mongoose=require("mongoose");

const wishlist = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    wishlist:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'
        }
})

module.exports = mongoose.model("wishlist", wishlist);



