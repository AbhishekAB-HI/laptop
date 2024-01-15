
const User = require("../model/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');
const product = require("../model/products");
const category=require("../model/category");
const checkout=require("../model/checkoutpage")



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



    res.render("home", {
      product: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,


    })


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
    const UserData = await User.findById({ _id: req.session.user_id })
    const checkoutpage =  await checkout.find({})
    console.log(checkoutpage)
                            
    res.render("myprofile", { user: UserData,check:checkoutpage })

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
                  

                  const items = {product_id : productid}
                  // console.log(items)
                  const user=await User.updateOne(
                    { _id:userid },
                    { $push: { "cart.items": items }}
                  ) 

                  res.render("cartalert")
                   // console.log(user)
                  // productdetail = await  User.findById({_id:userid});
                    
              //  const  productdetail= await User.findOne({_id:userid}).populate("cart.items.product_id")
                  
              //  console.log( productdetail.cart.items,'this is my product details ')
              //       res.render("cartpage",{cart: productdetail.cart.items})
                   }
                   catch (error) {
                    console.log(error.message)
                    
                  }
                    
 
                  
                } 
              
        const getProduct=async (req,res)=>{

          const userid=req.session.user_id;
          const  productdetail= await User.findOne({_id:userid}).populate("cart.items.product_id")
                  
          console.log( productdetail?.cart?.items,'this is my product details9999999999')
          res.render("cartpage",{cart: productdetail?.cart?.items})

        }

 
              const deletecartitem =async(req,res)=>{
                try {
                  console.log("start/////////////////////");
                  const userid=req.session.user_id;
                  const id=req.query.id;
                  console.log(userid)
                  
   
                  console.log(id,"id from product") 

              //     const updatedUser = await User.findByIdAndUpdate(
              //     userid,
              //     { $pull: { 'cart.items': { product_id: id } } },
              //     { new: true } // To get the updated document
              // ).then((res)=>{
              //   console.log(res,'this is deleted data')
              // })

              // const  productdetail= await User.findOne({_id:userid}).populate("cart.items.product_id")
                  
                  //  res.render("cartpage",{cart: productdetail.cart.items})
               
                } catch (error) {
                  console.log(error.message)

                }
              }  
 

              const checkoutpage=async(req,res)=>{
                    try {
                      res.render("checkoutpage")
                    } catch (error) {
                      console.log(error.message)
                    }
              }

              const addcheckoutpage=async(req,res)=>{
                try {

                  const {firstName,
                    lastName,
                    userName,
                    email,
                    address,
                    address2,
                    country,
                    state,
                    paymentMethod,
                    nameoncard,
                    creditcardnumber,
                    expiration,
                    cvv}  =req.body

                const checkoutdata=new  checkout({
                    firstName:firstName,
                    lastName:lastName,
                    userName:userName,
                    email:email,
                    address:address,
                    address2:address2,
                    country:country,
                    state:state,
                    paymentMethod:paymentMethod,
                    nameoncard:nameoncard,
                    creditcardnumber:creditcardnumber,
                    expiration:expiration,
                    cvv:cvv
                  })

                   const checkOutData= await checkoutdata.save();
                   console.log("checkout data added")


                  
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
  getProduct,
  highprice,
  lowprice
}

  