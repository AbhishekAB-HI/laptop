

const express=require("express");
const user_route=express();
const userController=require("../controllers/usercontroller")
const session=require("express-session");
const config=require("../config/config");
const userAuth=require("../middleware/userAuth")
user_route.use(session({secret:config.sessionSecreat}))
const blockchecking=require("../middleware/blockUser")

user_route.use(express.json())
user_route.use(express.urlencoded({extended:true}))

 
user_route.set("view engine","ejs");
user_route.set("views","./views/users")

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



 user_route.get("/register",userAuth.isLogout,userController.loadRegister);
 user_route.get("/login",userAuth.isLogout,userController.loadLogin)
 user_route.get("/",userAuth.isLogout,userController.loadLogin)
 user_route.get("/home",userAuth.isLogout,userController.loadHome);
 user_route.get("/dashboard",userAuth.isLogin,userController.HomeLogined)
 user_route.get("/verification",userController.verificationLoad)
 
        
 user_route.post("/verification",userController.sendverificationLink)
 user_route.get("/verify",userController.verify)
 user_route.get("/logout",blockchecking,userController.userLogout)
 user_route.get("/aboutus",blockchecking,userController.AboutUs)
 user_route.get("/detailview",userController.detailpage);
 user_route.get("/gamming",blockchecking,userController.gammingpart)
 user_route.get("/office",blockchecking,userController.officepart)
 user_route.get("/tablet",blockchecking,userController.tabletpart) 
 user_route.get("/productdetail",blockchecking,userController.productpage)
 user_route.get("/wishlist",blockchecking,userController.wishlistpage)
 user_route.get("/cartpage",userController.cartpage) 
 user_route.get("/deletecartitem",userController.deletecartitem)
 user_route.get("/checkout",userController.checkoutpage)
 user_route.post("/checkout",userController.addcheckoutpage)
 user_route.get("/addadress",userController.addaddress) 
 user_route.post("/addadress",userController.addaddresspost)
 user_route.get("/checkadress",userController.checkaddress) 
 user_route.post("/checkadress",userController.updatecheckaddress)             
 user_route.get("/getProduct",userAuth.isLogin,userController.getProduct);
 user_route.post("/quantityup/:product_id/:_id",userController.quatityup); 
 user_route.post("/quantitydown/:product_id/:_id",userController.quatitydown);
 user_route.get("/usercart",userController.user_cart);
 user_route.get("/cartsum",userController.totalprice);  
 user_route.get("/quantity",userController.totalquantity);  
 user_route.get("/deleteorderproduct",userController.deleteOrderList);  
 user_route.get("/editprofile",userController.editUserProfile);    
 user_route.post("/editprofile",upload.array("images",5),userController.UpdateUserProfile);            
 user_route.get("/forgotpassword",userController.forgotPassword); 
 user_route.post("/forgotpassword",userController. updateforgotpassword);    
 user_route.get("/verifypassword",userController.verifypassword);      
 user_route.post("/verifypassword",userController.updateverifypassword);   
 user_route.get("/changepassword",userController.changepassword);       
 user_route.post("/changepassword",userController.updatechangepassword);  


 user_route.get("/game",userController.gamminghome)
 user_route.get("/officetype",userController.officehome)
 user_route.get("/tablettype",userController.tablethome)
 user_route.get("/highprice",userController.highprice)
 user_route.get("/lowprice",userController.lowprice)

 
  
 

 user_route.post("/login",userController.verifyLogin);
 user_route.post("/register",userController.insertuser);








 module.exports=user_route



 