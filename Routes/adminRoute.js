 
// main part
 const express=require("express");
 const admin_route=express();
 const session=require("express-session"); 
//  const config=require("../config/config");
 const configure=require("../config/adminconfig");

 const adminController=require("../controllers/admincontroller")
 const adminAuth=require("../middleware/adminAuth") 
// main part 
//--------------------------------------------------------------------------------
 admin_route.use(session({secret:configure.sessionSecreatkey}))
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
 admin_route.get("/dashboard",adminAuth.isLogin,adminController.adminDashboard)
 admin_route.get("/edit-user",adminAuth.isLogin,adminController.editUserLoad)
 admin_route.post("/edit-user",adminAuth.isLogin,adminController.updateUser)
 admin_route.get("/delete-user",adminAuth.isLogin,adminController.deleteUser)
 admin_route.get("/delete-category",adminAuth.isLogin,adminController.deleteCategory)
 admin_route.get("/orderlist",adminAuth.isLogin,adminController.Orderdetails);
 admin_route.get("/deleteEditimage",adminAuth.isLogin,adminController.deleteImage);

 admin_route.get("/game",adminAuth.isLogin,adminController.gameSearch);
 admin_route.get("/office",adminAuth.isLogin,adminController.officeSearch);
 admin_route.get("/tablet",adminAuth.isLogin,adminController.tabletSearch);




 admin_route.get("/orderstatus",adminAuth.isLogin,adminController.Orderstatus);
 admin_route.get("/confirmed",adminAuth.isLogin,adminController.Orderconfirmed); 
 admin_route.get("/outdelivery",adminAuth.isLogin,adminController.deliveryconfirmed); 
 admin_route.get("/returned",adminAuth.isLogin,adminController.returnedconfirmed);
 admin_route.get("/delivered",adminAuth.isLogin,adminController.deliveredconfirmed);  
 admin_route.get("/shipped",adminAuth.isLogin,adminController.shippedconfirmed );  

 

 // admin route-----------------------------------------------------------------------



// category route-----------------------------------------------------------------------
 const categoryController=require("../controllers/catagerycontroller")
 admin_route.get("/addcategory",adminAuth.isLogin,categoryController.Category)
 admin_route.post("/addcategory",adminAuth.isLogin,categoryController.addCategory)
 admin_route.get("/categoryproduct",adminAuth.isLogin,categoryController.Categoryproduct)
 admin_route.get("/edit-category",adminAuth.isLogin,categoryController.editCategory)
 admin_route.post("/edit-category",adminAuth.isLogin,categoryController.updateCategory)

// category route-----------------------------------------------------------------------
// Addcoupon-----------------------------------------------------------------------

admin_route.get("/addCoupont",adminAuth.isLogin,adminController.Addcoupon );  
admin_route.post("/addCoupont",adminAuth.isLogin,adminController.UpdateAddcoupon ); 
admin_route.get("/listCoupon",adminAuth.isLogin,adminController.ListCoupon );
admin_route.get("/delete-coupon",adminAuth.isLogin,adminController.deleteCoupon );

// Salesreport------------------------------------------------------------------------

admin_route.get("/sales",adminAuth.isLogin,adminController.Salesreport);
admin_route.get("/monthreport",adminAuth.isLogin,adminController.adminMonthReport);







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
 
const upload = multer({ storage: storage})


//(admin template)--------------------------------------------------------------------------

admin_route.use("/js",express.static(path.join(__dirname,"../js"))) 

//(admin template)--------------------------------------------------------------------------


     
     
// product  route-----------------------------------------------------------------------
  
 admin_route.get("/addproduct",adminAuth.isLogin,productController.loadProduct);
 admin_route.post("/addproduct",adminAuth.isLogin,upload.array("images",4),productController.insertProduct)
//  admin_route.get("/addcatagory",productController.Addcatagory);
 
 admin_route.get("/productpage",adminAuth.isLogin,productController.ProductPage);
 admin_route.get("/edit-product",adminAuth.isLogin,productController.editProduct);
 admin_route.post("/edit-product",adminAuth.isLogin,upload.array("images",4) ,productController.updateProduct); 
 admin_route.get("/list-product",adminAuth.isLogin,productController.listProduct);
 admin_route.post("/list-product",adminAuth.isLogin,productController.updatelistProduct);

 admin_route.post("/admin/imagepreview",adminAuth.isLogin,productController.imagePreviewing);
 
 
// product route-----------------------------------------------------------------------

//  admin_route.get("*",function(req,res){
//    res.redirect("/admin")
// })


module.exports=admin_route
































  



















