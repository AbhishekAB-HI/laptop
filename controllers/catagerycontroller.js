
const catagory=require("../model/products");
const categoryproduct=require("../model/category")




const Category=async(req,res)=>{
    try {

        res.render("addcategory")
        
    } catch (error) {
        console.log(error.message)
        
    }
}    
                const addCategory=async(req,res)=>{
                    try {
                           const productpart=new categoryproduct({
                            name:req.body.name,
                            description:req.body.description
                          })
                    const products=await productpart.save();
                    console.log(products)
                    res.redirect("/admin/categoryproduct")
                 

                    if(products){
                        res.render("addcategory",{message:"category is added"})
                    }else{
                        res.render("addcategory",{message:"category is not added"})  
                    }
                        
                    } catch (error) {
                        console.log(error.message)
                        
                    }
                }

           const  Categoryproduct =async (req,res)=>{
            try {

              const cataproduct=await categoryproduct.find()
              res.render("categoryproduct",{category:cataproduct})
                
            } catch (error) {
                console.log(error)
            }
           }
   






    module.exports={
        Category,
        addCategory,
        Categoryproduct 
    }