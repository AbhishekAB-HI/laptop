

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


 user_route.get("/register",userAuth.isLogout,userController.loadRegister);
 user_route.get("/login",userAuth.isLogout,userController.loadLogin)
 user_route.get("/",userAuth.isLogout,userController.loadLogin)
 user_route.get("/home",userAuth.isLogout,userController.loadHome);
 user_route.get("/dashboard",userController.HomeLogined)
 user_route.get("/verification",userController.verificationLoad)
 
       
 user_route.post("/verification",userController.sendverificationLink)
 user_route.get("/verify",userController.verify)
 user_route.get("/logout",blockchecking,userController.userLogout)
 user_route.get("/aboutus",blockchecking,userController.AboutUs)
 user_route.get("/gamming",blockchecking,userController.gammingpart)
 user_route.get("/office",blockchecking,userController.officepart)
 user_route.get("/tablet",blockchecking,userController.tabletpart)
 user_route.get("/productdetail",blockchecking,userController.productpage)
 user_route.get("/wishlist",blockchecking,userController.wishlistpage)
 user_route.get("/cartpage",userController.cartpage) 
 user_route.get("/deletecartitem",userController.deletecartitem)
 user_route.get("/checkout",userController.checkoutpage)
 user_route.post("/checkout",userController.addcheckoutpage)
 user_route.get("/getProduct",userController.getProduct)
   
 
 
  
 

 user_route.get("/gamminghome",userController.gamminghome)
 user_route.get("/officehome",userController.officehome)
 user_route.get("/tablethome",userController.tablethome)
 user_route.get("/highprice",userController.highprice)
 user_route.get("/lowprice",userController.lowprice)

 
  


 user_route.post("/login",userController.verifyLogin);
 user_route.post("/register",userController.insertuser);








 module.exports=user_route



