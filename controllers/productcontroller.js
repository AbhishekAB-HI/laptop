 
       const products=require("../model/products");
       const category=require("../model/category")

 
 
       const loadProduct=async(req,res)=>{
        try {
            res.render("productadd")
            
        } catch (error) {
            console.log(error.message)
        }


        
       }

       const insertProduct=async(req,res)=>{

        const images = req.files.map(file => file.filename)
                  try {
                    const product= new products({
                        productname:req.body.productname,
                        productprice:req.body.productprice,
                        category:req.body.category,
                        productsize:req.body.productsize,
                        productquantity:req.body.productquantity,
                        images:images
                     })

                    const productData=await product.save();
                    
                    if(productData){
                        res.render("productadd",{message:"Your product is successfuly added"})
                    }else{
                        res.render("productadd",{message:"Your product is not added"})
                    }                
                  } catch (error) {
                   

                    if (error.errors) {
                      const message = Object.values(error.errors).map(err => err.message);
                     
              
                   return   res.render('addProduct', { message }); // Pass errors to the view
                  }




                  }
               
       }

         const ProductPage=async(req,res)=>{
            try {
            const productData=await products.find()
                
            res.render("productpage",{products:productData});
                
            } catch (error) {

            




                console.log(error.message)
                
            }
         }

         const editProduct=async(req,res)=>{
          try {
             
            const id=req.query.id;
            const productData=await products.findById({_id:id})
            if(productData){
              res.render("productedit",{product:productData})
            }else{
              res.redirect("/admin/productpage")
            }


          
            
          } catch (error) {
            if (error.errors) {
              const message = Object.values(error.errors).map(err => err.message);
             
      
           return   res.render('productedit', { message }); // Pass errors to the view
          }
           
            
         
            
          }
         }

           const updateProduct=async(req,res)=>{
            try {

            const productData=await products.findByIdAndUpdate({_id:req.body.id},{$set:{productname:req.body.productname,productprice:req.body.productprice,productsize:req.body.productsize,productquantity:req.body.productquantity,category:req.body.category}});
            res.redirect("/admin/productpage")
              
            } catch (error) {
              

              if (error.errors) {
                const message = Object.values(error.errors).map(err => err.message);
               
        
             return   res.render('productedit', { message }); // Pass errors to the view
            }

               
            }
           } 

             const deleteProduct=async (req,res)=>{
              try {
                const id=req.query.id
               await products.deleteOne({_id:id})
               res.redirect("/admin/productpage")
                
              } catch (error) {
                console.log(error.message)  
              }
             }
         



       module.exports={
        loadProduct,
        insertProduct,
        ProductPage,
        editProduct,
        updateProduct,
        deleteProduct
       }




