
const User = require("../model/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');
const product = require("../model/products");
const category=require("../model/category");
const checkout=require("../model/checkoutpage");
const { default: mongoose } = require("mongoose");



const createOtp=()=>{
  const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false, number: true });
  return otp;
}


const securepassword = async (password) => {
  const hashpassword = await bcrypt.hash(password, 10);
  return hashpassword
}

const sendVerfyMail = async (username, email,req) => {
  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      }

    })
    const otp = createOtp()
    req.session.createdOtp = otp
    const mailoption = {
      from: process.env.SMTP_USERNAME,
      to: email,
      subject: "For verification mail",
      html: "<p>hi" + " " + username + ",Your otp number is :-" + otp + ""

    }
    transporter.sendMail(mailoption, function (error, info) {

      if (error) {
        console.log(error)
      } else {
        console.log("Email has been send:-", info.response)
      }

    })
  } catch (error) {
    console.log(error.message)


  }
}

const insertuser = async (req, res) => {
  try {
    const check = await User.findOne({ email: req.body.email })

    if (check) {
      res.render("signup", { message: "This email is already exist" })
    } else {
      const { username, email, number, password } = req.body;
      const spassword = await securepassword(password)
      const user = new User({
        username: username,
        email: email,
        password: spassword,
        number: number,
        is_admin: 0,
      })
      if (user) {
        const conformpassword = req.body.conformpassword

        const passwordMatch = await bcrypt.compare(conformpassword, user.password);
        if (passwordMatch) {
          const mobileRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;

          if (!mobileRegex.test(req.body.number)) {

            res.render("signup", { message: "Number should be in 10 digit" })

          } else {

            const Userdata = await user.save();
            req.session.user_id = Userdata._id;
            sendVerfyMail(req.body.username, req.body.email, req);
            res.render("verification")
          }

        } else {
          res.render("signup", { message: "Entered password is incorrect" })
        }

      } else {
        res.redirect("signup", { message: "Please fill all the forms" })
      }
    }
  } catch (error) {

    if (error.errors) {
      const message = Object.values(error.errors).map(err => err.message);


      return res.render('signup', { message }); // Pass errors to the view
    }


    else {
      let errors;
      res.render('signup', { errors, message: " an internal error has occurred please try later " });
    }









  }
}

const verify = async (req, res) => {

  try {

     const {user_id} = req.session
     const userData = await User.findById(user_id)
     console.log(userData)
    sendVerfyMail(userData.username,userData.email,req);
    res.redirect("/verification")

  } catch (error) {
    console.log(error.message)

  }
}













// for send mail verify




const loadRegister = async (req, res) => {
  try {

    res.render("signup")

  } catch (error) {
    console.log(error.message)
  }
}

const loadHome = async (req, res) => {
  try {

    var search = '';
    if (req.query.search) {
      search = req.query.search
    }

    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }



    const limit = 4;


    const productData = await product.find({

      $or: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()


    const count = await product.find({
      $or: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    }).countDocuments()

    if(count===0){
      res.render("nodatahome")
    }else
    res.render("home", {
      product: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,
    }
  )

  









  } catch (error) {
    console.log(error)

  }
}

const loadLogin = async (req, res) => {
  try {

    res.render("login")

  } catch (error) {
    console.log(error.message)


  }
}


const verifyLogin = async (req, res) => {
  try {

    const email = req.body.email;
    const password = req.body.password
    const userData = await User.findOne({ email: email })

    if (userData) {

      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {

        if (userData.is_Blocked === true) {
         
          res.render("login", { message: "You are blocked" })
         

        } else {
          req.session.user_id = userData._id;

          res.redirect("/dashboard")
        }


      } else {
        res.render("login", { message: "Email and Password is incorrect" })
      }

    } else {
      res.render("login", { message: "Email and Password is incorrect" })
    }
  } catch (error) {
    console.log(error.message)


  }
}

const forgotpage = async (req, res) => {
  try {

    res.render("forgotpage")

  } catch (error) {
    console.log(error.message)

  }
}



const verificationLoad = async (req, res) => {
  try {

    res.render("verification")

  } catch (error) {
    console.log(error.message)


  }
}



const sendverificationLink = async (req, res) => {
  try {

    const OTP = req.body.otp
    const {createdOtp} = req.session
    console.log(OTP)
    console.log(createdOtp)
    
    if (OTP === createdOtp) {
      res.redirect("/dashboard")
    } else {
      res.render("verification", { message: "Entered otp is in correct" })
    }

  } catch (error) {
    console.log(error.message)

  }
}




const userLogout = async (req, res) => {
  try {



    var search = '';
    if (req.query.search) {
      search = req.query.search
    }

    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }



    const limit = 4;


    const productData = await product.find({

      $or: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()


    const count = await product.find({

      $or: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    }).countDocuments()

    req.session.destroy()

    res.render("home", {
      product: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,


    })





  } catch (error) {
    console.log(error.message)

  }
}
 

const AboutUs = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.user_id });
    const useraddress = await User.findById({ _id: req.session.user_id }).populate("address1")
                            
    res.render("userprofile", { user: UserData,address:useraddress})

  } catch (error) {
    console.log(error.message) 

  }
}

const HomeLogined = async (req, res) => {
  try {

    var search = '';
    if (req.query.search) {
      search = req.query.search
    }

    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }



    const limit = 4;


    const productData = await product.find({

      $or: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()


    const count = await product.find({

      $or: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    }).countDocuments()

    const id=req.query.id;

    if(count===0){
      res.render("nodata")
    }else
    res.render("homelogin", {
      product: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,
    })
  } catch (error) {

    console.log(error.message)


  }
}




const gammingpart = async (req, res) => {

  try {

    var search = '';
    if (req.query.search) {
      search = req.query.search
    }


    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }

    const limit = 4;

    const productData = await product.find({
      category: { _id: "65a20deac81be0bc337be682" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const count = await product.find({
      category: { _id: "65a20deac81be0bc337be682" }
    }).countDocuments()
       
    if(productData==0){
      res.render("nodata")

    }else


    res.render("homelogin", {
      product: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,
 
    })







  } catch (error) {

  }
}



const officepart = async (req, res) => {
  try {
    
    var search = '';
    if (req.query.search) {
      search = req.query.search
    }



    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }

    const limit = 4;


    const productData = await product.find({
      category: { _id: "65a20e00c81be0bc337be685" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()


    const count = await product.find({
      category: { _id: "65a20e00c81be0bc337be685" }
    }).countDocuments()

    
    if(productData==0){
      res.render("nodata")

    }else



    res.render("homelogin", {
      product: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,

    })


  } catch (error) {

  }
}

const tabletpart = async (req, res) => {
  try {

    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }

    const limit = 4;

    const productData = await product.find({
      category: { _id: "65a20e51c81be0bc337be689" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const count = await product.find({
      category: { _id: "65a20e51c81be0bc337be689" }
    }).countDocuments()
       
    if(productData==0){
      res.render("nodata") 

    }else


    res.render("homelogin", {
      product: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,

    })









  } catch (error) {

  }
}





const gamminghome = async (req, res) => {
  try {

    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }

    const limit = 4;


    const productData = await product.find({
      category: { _id: "65a20deac81be0bc337be682" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const count = await product.find({
      category: { _id: "65a20deac81be0bc337be682" }
    }).countDocuments()

    if(productData==0){
      res.render("nodatahome")

    }else


    res.render("home", {
      product: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,

    })


  




  } catch (error) {

  }
}



const officehome = async (req, res) => {
  try {
    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }

    const limit = 4;


    const productData = await product.find({
      category: { _id: "65a20e00c81be0bc337be685" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()


    const count = await product.find({
      category: { _id: "65a20e00c81be0bc337be685" }
    }).countDocuments()

    if(productData==0){
      res.render("nodatahome")

    }else


    res.render("home", {
      product: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,

    })


  } catch (error) {

  }
}

const tablethome = async (req, res) => {
  try {

    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }

    const limit = 4;

    const productData = await product.find({
      category: { _id: "65a20e51c81be0bc337be689" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const count = await product.find({
      category: { _id: "65a20e51c81be0bc337be689" }
    }).countDocuments()

    if(productData==0){
      res.render("nodatahome")

    }else

    res.render("home", {
      product: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,

    })


  } catch (error) {

  }
}

const highprice=async (req,res)=>{
  try {

    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }

    const limit = 4;

           const products= await product.find({
              productprice:{$gt:65000}
             }).limit(limit * 1)
             .skip((page - 1) * limit)
             .exec()

             const count= await product.find({}).countDocuments()

             res.render("homelogin",{product:products,
             totalpages: Math.ceil(count / limit),
            currentpages:page})

          } catch (error) {
           console.log(error.message)
          }
           }




           const lowprice=async (req,res)=>{
            try {
          
              var page = 1;
              if (req.query.page) {
                page = req.query.page
              }
          
              const limit = 4;
          
                     const products= await product.find({
                        productprice:{$lt:50000}
                       }).limit(limit * 1)
                       .skip((page - 1) * limit)
                       .exec()
          
                       const count= await product.find({}).countDocuments()
          
                       res.render("homelogin",{product:products,
                       totalpages: Math.ceil(count / limit),
                      currentpages:page})
          
                    } catch (error) {
                     console.log(error.message)
                    }
                     }

















 
            const productpage=async(req,res)=>{
                try {
                  const id=req.query.id;
                  
                  const productData = await product.findById({_id:id})
                      if(productData){
                        res.render("productdeatil", {product: productData })   
                      }else{
                        res.redirect("/dashboard")
                      }
                  
                } catch (error) {
                  console.log(error.message)
                  
                }
              }

              const wishlistpage=async (req,res)=>{
                try {

                  const id=req.query.id;
                  const UserData = await User.findById({ _id: req.session.user_id })
                 
                  const productdata= await product.findById({_id:id})

                  if(productdata){
                    res.render("wishlist",{product:productdata,user:UserData})
                  }

                  
                  
                } catch (error) {
                  console.log(error.message)
                  
                }
              }
   
              const cartpage=async (req,res)=>{
                try {
                  const productid=req.query.id;
                  const userid=req.session.user_id;
                  console.log(userid);
                  console.log(productid);

                  const items = {product_id : productid}
                  
                   const userone= await User.findOne({ _id: userid });
 
                  // console.log(userone);

                  // const productref=await  product.findById({_id:productid})
 
                  //   const productobject=
                  //   userone.cart.items.push({
                  //     product_id:productref._id,
                  //     qty:1,
                  //     price:productref.productprice 
                  //   })

                  // await  userone.save()

                  // res.render("cartalert")







                 
                   const exisitingid=userone.cart.items.findIndex(item=>item.product_id==productid)
                   console.log(exisitingid,"ttttttttttttttttttt");
                    if(exisitingid !== -1){
                    userone.cart.items[exisitingid].qty=userone.cart.items[exisitingid].qty+1
                   }else{
                            const productref=await  product.findById({_id:productid})

  
 
 
                    const productobject=
                    userone.cart.items.push({
                      product_id:productref._id,
                      qty:1,
                      price:productref.productprice
                    })

                   }

 
                 await userone.save()
                 
                 res.render("cartalert")
                 


 


                 
                   }
                   catch (error) {
                    console.log(error.message)
                    
                  } 
                    
 
                  
                } 

                // const getProduct = async (req, res) => {
                //   const userid = req.session.user_id;
                //   const productdetail = await User.findOne({ _id: userid }).populate("cart.items.product_id");
                //   const user=await User.findOne({_id: userid})
                //    console.log(Object.values(user.cart))
                
                //     res.render("cartpage", { cart: productdetail?.cart?.items ,userCart:user});
                  
                // };

                const getProduct = async (req, res) => {
                  try {
                    const userid = req.session.user_id;
                    const productdetail = await User.findOne({ _id: userid }).populate("cart.items.product_id");
                    const user = await User.findOne({ _id: userid });

                   const value=  user.cart.items.reduce((accu,curr)=>{
                          return accu+curr.totalPrice
                      },0)

                      const quantity=  user.cart.items.reduce((accu,curr)=>{
                        return accu+curr.qty
                    },0)

 
                               
                
                    if (user && user.cart) {
                      console.log(user.cart.items);
                     return res.render("cartpage", { cart: productdetail?.cart?.items, userCart: user.cart.items,totalPrice:value,qty:quantity });
                    } else {
                      console.error("User or user's cart is null or undefined.");
                      // Handle the case where user or user's cart is null or undefined
                    return  res.render("cartpage", { cart: [], userCart: {} }); // Provide default values or handle as appropriate
                    } 
                  } catch (error) {
                    console.error("Error in getProduct:", error);
                    // Handle the error appropriately, e.g., send an error response
                    res.status(500).send("Internal Server Error");
                  }
                };
                
               
       
 
 
              const deletecartitem =async(req,res)=>{
                try {
                  console.log("start/////////////////////");
                  const userid=req.session.user_id;
                  const id=req.query.id;
                  
                     
    
                  console.log(id,"id from product") 

                  const updatedUser = await User.findByIdAndUpdate(
                  userid,
                  { $pull:{ 'cart.items': { _id: id } } },
                  { new: true }, // To get the updated document
                  res.redirect("/getProduct")
              ).then((res)=>{
             
                console.log(res,'this is deleted data')
              })
 
              // const  productdetail= await User.findOne({_id:userid}).populate("cart.items.product_id")
                  
                  //  res.render("cartpage",{cart: productdetail.cart.items})
               
                } catch (error) {
                  console.log(error.message)

                }
              }  
  

              const checkoutpage=async(req,res)=>{
                    try {
                      const userid=req.session.user_id; 

                    
                      const productdetail = await User.findOne({ _id: userid }).populate("cart.items.product_id");
                      const user = await User.findOne({ _id: userid });
  
                     const value=  user.cart.items.reduce((accu,curr)=>{
                            return accu+curr.totalPrice
                        },0)
  
                        const quantity=  user.cart.items.reduce((accu,curr)=>{
                          return accu+curr.qty
                      },0)


                      const checkoutdata=await User.findById({_id:userid})
                      console.log(checkoutdata.address,"ddqdedec");

                      const permenentaddress=checkoutdata.address

                      res.render("checkoutpage",{check:checkoutdata,address:permenentaddress,userCart: user.cart.items,totalPrice:value,qty:quantity })
                    } catch (error) {
                      console.log(error.message)
                    }
              } 


             const  addcheckoutpage=async (req,res)=>{

              try {

                const userid=req.session.user_id; 

                const {
                  address,
                  paymentMethod
                } = req.body;

                 await   User.findByIdAndUpdate({_id:userid},{$push:{
                    payment:{
                      address: address,
                      paymentMethod:paymentMethod
                    } 
                  }})
 
                  res.render("paymentsuccess")
  
                 

                
                
              } catch (error) {
                console.log(error.message)
              }


             }
              
              













              
              const addaddresspost = async (req, res) => {
                try {
                  const {
                    firstName,
                    lastName,
                    email,
                    address,
                    state,
                    city
                  } = req.body;
              
                  const userid = req.session.user_id;
                  const mongoose = require("mongoose");
              
                  const ObjectId = mongoose.Types.ObjectId;
                  const userIdObject = new ObjectId(userid);
              
                  // Update the user document by pushing a new address to the 'address1' array
                  await User.findByIdAndUpdate(
                    userIdObject, // Corrected the first argument to be the filter criteria
                    {
                      $push: {
                        address1: {
                          firstName: firstName,
                          lastName: lastName,
                          email: email,
                          address: address,
                          state: state,
                          city: city
                        }
                      }
                    }
                  );
              
                  console.log("Checkout data added");
                  res.redirect("/checkout");
                } catch (error) {
                  console.error(error.message);
                  res.status(500).send("Internal Server Error");
                }
              };
              
 
            
 
              const quatityup=async (req,res)=>{
                try {
 
                   let cloneItems=[]
                  const product_id=req.params.product_id;
                  const quatity=req.body.quantity;
                  const userid=req.session.user_id;
                                                 
                   const userproduct=await User.findOne({"cart.items._id":product_id});
                   console.log( userproduct,"satatsaxs");
                   
  
                   const exisitingid=userproduct.cart.items.findIndex(item=>item._id==product_id)
                   console.log(exisitingid,"id");
                  
                   console.log( userproduct.cart.items[exisitingid],"product"); 

                   const passproductdetails=userproduct.cart.items[exisitingid]
                   const Totalprice= passproductdetails.totalPrice  //total price of object 1
                   const productPrice=passproductdetails.price;    //actualprice of object 1
                   const productQty=quatity; 
                  //  -----------------------------------------------------

               
                        
                    
                   console.log(productQty,"qty");
                   const totalprice=productPrice*productQty

                   console.log(totalprice,"added");

                   console.log( userproduct.cart.items[exisitingid].totalPrice,"totalproductprice"); 

                              
                    const totalvalue=userproduct.cart.items[exisitingid].totalPrice;

                    
                    await  User.findByIdAndUpdate(
                      userid,
                      {
                        $set: {
                          [`cart.items.${exisitingid}.totalPrice`]: totalprice
                        }
                      },
                      { new: true }); 






                    const TotalAmount= userproduct.totalAmount;
                    console.log(TotalAmount,"aucecececececerc");
                    const TotalQuantity=userproduct.totalQty;
                    console.log(TotalQuantity,"aucecececececerc");
                    console.log(productPrice,"price");




                  const productdetails=await product.findOne({_id:userproduct.cart.items[exisitingid].product_id});
 
                  console.log( productdetails.productquantity,"mached");
                 
 

                  if(productdetails.productquantity<parseInt(quatity)){
                    console.log( productdetails,"cdcdcdcdc");
                      return  res.render("cartalert") 
                    } 
                   
                     
  
  

                   
                  const user =await User.findOne({"cart.items._id":product_id});

                   const cartItems = user.cart.items;
                
                   
                     const itemindex=cartItems.findIndex((item)=>{
                        
                      return item._id.toString()===product_id
                     })

                   const Items= cartItems.forEach((item)=>{
                     
                      if(item._id.toString()===product_id){

                        item.qty=quatity

                      }
                     })

                     

                      // // Items.qty=quatity
                      console.log(Items,cartItems)

                      // //  cloneItems=cartItems.splice(itemindex,1,Items)
  
         await User.findByIdAndUpdate(user._id,{$set:{"cart.items":cartItems}},{new:true,runValidators:true})
                           res.status(200).json({status:"updated"})
                } catch (error) {
                  console.log(error.message)
                }
              }
  
  

              const quatitydown=async (req,res)=>{
                try { 
                  

                   let cloneItems=[]
                  const product_id=req.params.product_id;
                  console.log(product_id,"product id is");
                  const quatity=req.body.quantity;
                  console.log(quatity,"quantit isssssss"); 
                  const userid=req.session.user_id;
                                             
                   const userproduct=await User.findOne({"cart.items._id":product_id});
                   console.log( userproduct,"satatsaxs");
                    
  
                   const exisitingid=userproduct.cart.items.findIndex(item=>item._id==product_id)
                   console.log(exisitingid,"id");
                  
                   console.log( userproduct.cart.items[exisitingid],"product"); 

                   const passproductdetails=userproduct.cart.items[exisitingid]
                    const Totalprice= passproductdetails.totalPrice
                   const productPrice=passproductdetails.price; 
                   console.log(productPrice,"price");

                   const productQty=quatity;
                   console.log(productQty,"qty");
                   const totalprice=productPrice*productQty

                   console.log(totalprice,"added");

                   console.log( userproduct.cart.items[exisitingid].totalPrice,"totalproductprice"); 
 
                               
                    const totalvalue=userproduct.cart.items[exisitingid].totalPrice;
                          await  User.findByIdAndUpdate(
                      userid,
                      {
                        $set: {
                          [`cart.items.${exisitingid}.totalPrice`]: totalprice
                        }
                      },
                      { new: true }); 


                      await  User.findByIdAndUpdate(
                        userid,
                        {
                          $set: {
                            [`cart.items.${exisitingid}.qty`]:quatity
                          }
                        },
                        { new: true }); 










                  
                  const productdetails=await product.findOne({_id:userproduct.cart.items[exisitingid].product_id});
 
                  console.log( productdetails.productquantity,"mached");
                 
 

                     
  
  

                   
                  const user =await User.findOne({"cart.items._id":product_id});

                   const cartItems = user.cart.items;
                
                   
                     const itemindex=cartItems.findIndex((item)=>{
                        
                      return item._id.toString()===product_id
                     })

                   const Items= cartItems.forEach((item)=>{
                     
                      if(item._id.toString()===product_id){
                        item.qty=quatity
                      }
                     })

                     
 
                      console.log(Items,cartItems)

                      //  cloneItems=cartItems.splice(itemindex,1,Items)
  
                            
                      

         await User.findByIdAndUpdate(user._id,{$set:{"cart.items":cartItems}},{new:true,runValidators:true})
                              res.status(200).json({status:"updated"})
                } catch (error) {
                  console.log(error.message)
                }
              }


                      
  
 


  








           





























               
              const addaddress=async(req,res)=>{
                try {

                  res.render("addAddress")
                  
                } catch (error) {
                  console.log(error.message)
                }
              }


              const user_cart=async (req,res)=>{
                try {

                  const userid=req.session.user_id;
 
                const currentuser=await User.findById(userid).select("cart")
 
                 res.status(200).json({currentuser})

                        
                  
                } catch (error) { 
                  console.log(error.message)
                }
              }


               const totalprice = async (req,res)=>{
                try {

                  const userid = req.session.user_id;
                
                  const user = await User.findOne({ _id: userid });

                 const value=  user.cart.items.reduce((accu,curr)=>{
                        return accu+curr.totalPrice
                    },0)


                    
              //  const totalquantity = async (req,res)=>{
              //   try {

              //     const userid = req.session.user_id;
                
              //     const user = await User.findOne({ _id: userid });

              //    const value=  user.cart.items.reduce((accu,curr)=>{
              //           return accu+curr.qty
              //       },0)








                      
                 res.status(200).json({valueOne:value})

                    
                  
                } catch (error) {
                  console.log(error.message)



                  
                }
               }


          const totalquantity =async (req,res)=>{
            try {
              const userid = req.session.user_id;    
              const user = await User.findOne({ _id: userid });
              const quantity= user.cart.items.reduce((accu,curr)=>{
                return accu+curr.qty
            },0)

            res.status(200).json({valueOne:quantity})



              
            } catch (error) {
              console.log(error.message)
            }
          }

               
              
 



































module.exports = {
  loadRegister,
  loadHome,
  insertuser,
  loadLogin,
  verifyLogin,
  forgotpage,
  verificationLoad,
  sendverificationLink,
  userLogout,
  AboutUs,
  HomeLogined,
  verify,
  gammingpart,
  officepart,
  tabletpart,
  gamminghome,
  officehome,
  tablethome,
  productpage,
  wishlistpage,
  cartpage,
  deletecartitem,
  checkoutpage,
  addcheckoutpage ,
  addaddresspost,
  getProduct,
  highprice,
  lowprice,
  quatityup,
  addaddress,
  quatitydown,
  user_cart,
  totalprice,
  totalquantity
}

  