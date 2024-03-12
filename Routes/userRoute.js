

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
 user_route.get("/logout",userAuth.isLogin,blockchecking,userController.userLogout)
 user_route.get("/aboutus",userAuth.isLogin,blockchecking,userController.AboutUs)
 user_route.get("/detailview",userAuth.isLogin,userController.detailpage);
 user_route.get("/detailInvoice",userAuth.isLogin,userController.Invoice);


 
 user_route.get("/gamming",userAuth.isLogin,blockchecking,userController.gammingpart)
 user_route.get("/office",userAuth.isLogin,blockchecking,userController.officepart)
 user_route.get("/tablet",userAuth.isLogin,blockchecking,userController.tabletpart) 
 user_route.get("/productdetail",userAuth.isLogin,blockchecking,userController.productpage)
  
 user_route.post("/cartpage",userAuth.isLogin,userController.cartpage) 
 user_route.post("/cartpagelogin",userAuth.isLogin,userController.Logincartpage) 


//  user_route.post("/cartpage",userController.updatecartpage) 
user_route.post("/wishcart",userAuth.isLogin,userController.wishcartpage) 
user_route.post("/changeCancel",userAuth.isLogin,userController.cancelStatus) 





 
 user_route.get("/deletecartitem",userAuth.isLogin,userController.deletecartitem)  
 user_route.get("/checkout",userAuth.isLogin,userController.checkoutpage)
 user_route.post("/checkout",userAuth.isLogin,userController.addcheckoutpage)
 user_route.get("/addadress",userAuth.isLogin,userController.addaddress) 
 user_route.get("/editAddress",userAuth.isLogin,userController.editAddress) 
 user_route.post("/editAddress",userAuth.isLogin,userController.updateeditAddress) 


 user_route.post("/addadress",userAuth.isLogin,userController.addaddresspost)
 user_route.get("/checkadress",userAuth.isLogin,userController.checkaddress) 
 user_route.post("/checkadress",userAuth.isLogin,userController.updatecheckaddress)             
 user_route.get("/getProduct",userAuth.isLogin,userController.getProduct);
 user_route.post("/quantityup/:product_id/:_id",userAuth.isLogin,userController.quatityup); 
 user_route.post("/quantitydown/:product_id/:_id",userAuth.isLogin,userController.quatitydown);
 user_route.get("/usercart",userAuth.isLogin,userController.user_cart);  
 user_route.get("/cartsum",userAuth.isLogin,userController.totalprice);  
 user_route.get("/quantity",userAuth.isLogin,userController.totalquantity);  
 user_route.get("/deleteorderproduct",userAuth.isLogin,userController.deleteOrderList);
 user_route.post("/returnorderproduct",userAuth.isLogin,userController.returnedOrderList);
  
 user_route.get("/editprofile",userAuth.isLogin,userController.editUserProfile);    
 user_route.post("/editprofile",userAuth.isLogin,upload.array("images",5),userController.UpdateUserProfile);            
 user_route.get("/forgotpassword",userAuth.isLogin,userController.forgotPassword); 
 user_route.post("/forgotpassword",userAuth.isLogin,userController. updateforgotpassword);    
 user_route.get("/verifypassword",userAuth.isLogin,userController.verifypassword);      
 user_route.post("/verifypassword",userAuth.isLogin,userController.updateverifypassword);   
 user_route.get("/changepassword",userAuth.isLogin,userController.changepassword);       
 user_route.post("/changepassword",userAuth.isLogin,userController.updatechangepassword); 
 user_route.get("/deleteaddress",userAuth.isLogin,userController.deleteaddress); 

//  payment Method----------------------------------------------------------------------------

 user_route.post("/onlinepayment",userController.rayzopayIntitial); 
 user_route.post("/paymentContinue",userController.rayzopayPaymentContinue);
 user_route.post("/PaymentSuccess",userController.rayzopayPaymentSuccess); 
 user_route.post("/PaymentFailed",userController.rayzopayPaymentFailed);

//  user_route.get("/rayzopayContinue",userController.rayzopayContinue); 
 user_route.get("/rayzopay",userController.rayzopayCompletion); 
 user_route.get("/rayzopaycheck",userController.rayzopayChecking); 


 
 user_route.post("/walletcheck",userController.Walletcheck);
 user_route.post("/cashowndelivery",userController.cashowndelivery); 


 //  payment Method----------------------------------------------------------------------------



 user_route.get("/game",userAuth.isLogin,userController.gamminghome)
 user_route.get("/officetype",userAuth.isLogin,userController.officehome)
 user_route.get("/tablettype",userAuth.isLogin,userController.tablethome)
 user_route.get("/highprice",userAuth.isLogin,userController.highprice)
 user_route.get("/lowprice",userAuth.isLogin,userController.lowprice)

 
  
 
 user_route.post("/",userController.verifyLogin);
 user_route.post("/login",userController.verifyLogin);
 user_route.post("/register",userController.insertuser);

//  coupon ----------------------------------

user_route.get("/couponcheck",userController.couponget);
user_route.post("/passingCopon",userController.discountCoupon);
user_route.get("/showCoupons",userController.showAllCoupons);

// wishlist-------------------------------------------

user_route.get("/wishlist",userAuth.isLogin,blockchecking,userController.wishlistpage) 
user_route.get("/addTocart",userController.addToCart);
user_route.post("/addwish",userController.addWish);
user_route.get("/deleteWish",userController.deleteWish);
user_route.get("/wallets",userController.Wallets);






















 module.exports=user_route



 