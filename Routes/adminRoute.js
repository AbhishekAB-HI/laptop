 
// main part
 const express=require("express");
 const admin_route=express();
 const session=require("express-session"); 
 const config=require("../config/config");
 const adminController=require("../controllers/admincontroller")
 const adminAuth=require("../middleware/adminAuth") 
// main part 
//--------------------------------------------------------------------------------
 admin_route.use(session({secret:config.sessionSecreat}))
 admin_route.use(express.json())
 admin_route.use(express.urlencoded({extended:true}))
//--------------------------------------------------------------------------------
 admin_route.set("view engine","ejs");
 admin_route.set("views","./views/admin");

  
//--------------------------------------------------------------------------------


// admin route-----------------------------------------------------------------------
 admin_route.get("/",adminAuth.isLogout,adminController.loadAdminLogin)
 admin_route.post("/",adminController.verifyLogin)
 admin_route.get("/home",adminAuth.isLogin,adminController.LoadDashboard)
 admin_route.get("/logout",adminAuth.isLogin,adminController.adminLogout)
 admin_route.get("/dashboard",adminController.adminDashboard)
 admin_route.get("/edit-user",adminController.editUserLoad)
 admin_route.post("/edit-user",adminController.updateUser)
 admin_route.get("/delete-user",adminController.deleteUser)
 admin_route.get("/delete-category",adminController.deleteCategory)
 admin_route.get("/orderlist",adminController.Orderdetails);
 admin_route.get("/deleteEditimage",adminController.deleteImage);
 admin_route.get("/deleteEditimage",adminController.deleteImage);
 admin_route.get("/game",adminController.gameSearch);
 admin_route.get("/office",adminController.officeSearch);
 admin_route.get("/tablet",adminController.tabletSearch);




 admin_route.get("/orderstatus",adminController.Orderstatus);
 admin_route.get("/confirmed",adminController.Orderconfirmed); 
 admin_route.get("/outdelivery",adminController.deliveryconfirmed); 
 admin_route.get("/returned",adminController.returnedconfirmed);
 admin_route.get("/delivered",adminController.deliveredconfirmed);  
 admin_route.get("/shipped",adminController.shippedconfirmed );  

 

 // admin route-----------------------------------------------------------------------

// category route-----------------------------------------------------------------------
 const categoryController=require("../controllers/catagerycontroller")
 admin_route.get("/addcategory",categoryController.Category)
 admin_route.post("/addcategory",categoryController.addCategory)
 admin_route.get("/categoryproduct",categoryController.Categoryproduct)
 admin_route.get("/edit-category",categoryController.editCategory)
 admin_route.post("/edit-category",categoryController.updateCategory)
 


// category route-----------------------------------------------------------------------

// product route-----------------------------------------------------------------------
const productController=require("../controllers/productcontroller"); 
const path = require('path');
 const multer=require("multer");
const storage=multer.diskStorage({
    destination:function(req,file,cb){
 
        cb(null,path.join(__dirname,"../public/productImages"))
    },
    filename:function(req,file,cb){
        const name=Date.now()+"-"+file.originalname;
        cb(null,name)    
    }
});

const upload = multer({ storage: storage })

//(admin template)--------------------------------------------------------------------------

admin_route.use("/js",express.static(path.join(__dirname,"../js"))) 

//(admin template)--------------------------------------------------------------------------


     
     
// product  route-----------------------------------------------------------------------
  
 admin_route.get("/addproduct",productController.loadProduct);
 admin_route.post("/addproduct",upload.array("images",5),productController.insertProduct)
 admin_route.get("/productpage",productController.ProductPage);
 admin_route.get("/edit-product",productController.editProduct);
 admin_route.post("/edit-product",upload.array("images",5),productController.updateProduct); 
 admin_route.get("/list-product",productController.listProduct);
 admin_route.post("/list-product",productController.updatelistProduct);
 
 
// product route-----------------------------------------------------------------------

//  admin_route.get("*",function(req,res){
//    res.redirect("/admin")
// })


module.exports=admin_route
































  



















