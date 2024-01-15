
const mongoose=require("mongoose");


const checkoutSchema=new mongoose.Schema({

    firstName:{
        type:String,
        required:[true,"product name is required"],
        minlength:[3,"Enter minimum 3 charectors"],
        maxlength:[20,"Enter maximum 20 charectors"],
        validate:{
            validator:function(value){
                return value.trim().length>0
            },
            message:"product name cannot be consist of only space"
        }
    },
    lastName:{
        type:String,
        required:[true,"product name is required"],
        minlength:[3,"Enter minimum 3 charectors"],
        maxlength:[20,"Enter maximum 20 charectors"],
        validate:{
            validator:function(value){
                return value.trim().length>0
            },
            message:"product name cannot be consist of only space"
        }

    },
    userName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
    },
    address:{
        type:String,
        required:true
    },
    address2:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    }, 
    nameoncard:{
        type:String,
        required:true
    },
    creditcardnumber:{
        type:Number,
        required:true
    },
    expiration:{
        type:String,
        required:true
    },
    cvv:{
        type:Number,
        required:true

    }




})


         module.exports=mongoose.model("checkout",checkoutSchema)