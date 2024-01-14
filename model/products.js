
   const mongoose=require("mongoose");
  


      const productSchema =new mongoose.Schema({

        productname:{
            type:String,
            required:[true,"product name is required"],
            minlength:[3,"product name must be at least 3 charecters long"],
            maxlength:[40,"product name cannot exceed 100 characters"],
            validate:{
                validator:function(value){
                    return value.trim().length>0
                },
                message:"Do not enter only space charecters"
            }
        },
        
        productprice:{
            type:Number,
            required:true,
            min:[0,"price cannote be negative"]
        },
        productsize:{
            type:String,
            required:true

        },
        productquantity:{
            type:Number,
            required:true

        },
        images:{
            type:Array,
            required:true
        },
        is_user:{
            type:Number,
            default:0
        },
       category:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Category',
            required:true
        }
        
        

     })

     module.exports=mongoose.model("product",productSchema);

      

