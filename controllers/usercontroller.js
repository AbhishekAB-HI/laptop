
const User = require("../model/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');
const product = require("../model/products");
const category = require("../model/category");
const checkout = require("../model/checkoutpage");
const { default: mongoose } = require("mongoose");
const order = require("../model/orders");
const orders = require("../model/orders");
const products = require("../model/products");

const Razorpay = require("razorpay")
const orderid = require('order-id')('key');
const wishlist = require("../model/wishlist")

const coupon = require("../model/coupon");
const banner =require("../model/banner")


const createOtp = () => {
  const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false, number: true });
  return otp;
}


const securepassword = async (password) => {
  const hashpassword = await bcrypt.hash(password, 10);
  return hashpassword
}


const sendVerfyMail = async (username, email, req) => {
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
    const emailid = (req.body.email).toLowerCase();
    const check = await User.findOne({ email: req.body.email });
    if (check) {
      res.render("signup", { message: "This email is already exist" })
    } else {
      const { username, number, password, referalId } = req.body;

      if (referalId) {
        req.session.code = referalId
      }
      var regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
      console.log(!password.length > 6 || !password.length <= 8 || regularExpression.test(password), regularExpression.test(password), password.length, "lllllll");
      const isValid = (password.length > 6 && password.length === 8) || regularExpression.test(password)
      if (!isValid) {
        return res.render("signup", { message: "Invalid password. It should be at least 8 characters long and contain at least one special character" })
      }
      var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const emailCheck = pattern.test(emailid);
      if (!emailCheck) {
        return res.render("signup", { message: "Invalid email format" });
      }

      // get the referalcode here---------------------------------------------------

      const referralCode = generateReferralCode();

      // get the referalcode here---------------------------------------------------

      const spassword = await securepassword(password)
      const user = new User({
        username: username,
        email: emailid,
        password: spassword,
        number: number,
        is_admin: 0,
        referalId: referralCode
      })
      if (user) {
        const conformpassword = req.body.conformpassword
        const passwordMatch = await bcrypt.compare(conformpassword, user.password);
        if (passwordMatch) {
          const Userdata = await user.save();
          req.session.user_id = Userdata._id;
          sendVerfyMail(req.body.username, req.body.email, req);
          res.render("verification")
        } else {
          res.render("signup", { message: "Entered password is incorrect" })
        }
      } else {
        res.render("signup", { message: "Please fill all the forms" })
      }
    }

  } catch (error) {

    console.log(error)

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

// generate the referal code here--------------------------------------------------------

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// generate the referal code here--------------------------------------------------------
const verify = async (req, res) => {

  try {
    const { user_id } = req.session
    const userData = await User.findById(user_id)
    console.log(userData)
    sendVerfyMail(userData.username, userData.email, req);
    res.redirect("/verification")
  } catch (error) {
    console.log(error.message)

  }
}



const loadRegister = async (req, res) => {
  try {

    const { code } = req.query;
    res.render('signup', { code });

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
    
    const baners = await banner.find()

    const limit = 8;
    const productData = await product.find({

      $and: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } },
        { is_list: false }
      ]
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()


    const count = await product.find({
      $or: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } },

      ]
    }).countDocuments()
 console.log(productData,"dataaaaa");
    if (count === 0) {
      res.render("nodatahome")
    } else
      res.render("home", {
        product: productData,
        totalpages: Math.ceil(count / limit),
        currentpages: page,
        baners
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
    const userData = await User.findOne({ email: email });
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
    const { createdOtp } = req.session
    console.log(OTP)
    console.log(createdOtp)
    if (OTP === createdOtp) {

      
      if (req.session.code) {
        await User.findOneAndUpdate({referalId: req.session.code }, {
          $inc: { wallet: 100 }, $push: {
            walletHistory: {
              amount: 100,
              createdAt: new Date(),
              direction: '+',
              description:"Referal bonus"
            }
          }
        })

        await User.findOneAndUpdate({ _id: req.session.user_id }, {
          $inc: { wallet: 50 }, $push: {
            walletHistory: {
              amount: 50,
              createdAt: new Date(),
              direction: '+',
              description:"Welcome bonus"
         
            }
          }
        })
      }
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
    const baners = await banner.find()

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
      baners
    })
  } catch (error) {
    console.log(error.message)
  }
}


const AboutUs = async (req, res) => {
  try {
    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }
    const limit = 3;
    const UserData = await User.findById({ _id: req.session.user_id });
    const useraddress = await User.findById({ _id: req.session.user_id }).populate("address1")
    const userorder = await order
      .find({ user: req.session.user_id })
      .populate("products.product_id")
      .sort({ _id: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const count = await order
      .find({ user: req.session.user_id })
      .populate("products.product_id").countDocuments()
    res.render("userprofile", { user: UserData, address: useraddress, userCart: userorder, totalpages: Math.ceil(count / limit), currentpages: page })
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
    const limit = 8;

    const baners = await banner.find()
    const productData = await product.find({
      $and: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } },
        { is_list: false }
      ]
    }).populate("category")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({
      $or: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    }).countDocuments()
    const id = req.query.id;
    if (count === 0) {
      res.render("nodata")
    } else

   


      res.render("homelogin", {
        product: productData,
        totalpages: Math.ceil(count / limit),
        currentpages: page,
        baners
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
      $and: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" }, category: { _id: "65dc2b1cf67d8e9f3bc10154" } }
      ]
    }).populate("category")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
      const baners = await banner.find()
    const count = await product.find({
      $and: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" }, category: { _id: "65dc2b1cf67d8e9f3bc10154" } }
      ]
    }).countDocuments()

    if (productData == 0) {
      res.render("nodata")
    } else
      // res.json({product:productData,  totalpages: Math.ceil(count / limit),message: "Gaming"})
     
      res.render("homelogin", {
        product: productData,
        totalpages: Math.ceil(count / limit),
        message: "Gaming",
        baners
      })
  } catch (error) {
    console.log(error.message)
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
    const baners = await banner.find()
    const productData = await product.find({
      $and: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" }, category: { _id: "65dc2b3bf67d8e9f3bc1015b" } }
      ]
    }).populate("category")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({
      $and: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" }, category: { _id: "65dc2b3bf67d8e9f3bc1015b" } }
      ]
    }).countDocuments()
    if (productData == 0) {
      res.render("nodata")
    } else
      res.render("homelogin", {
        product: productData,
        totalpages: Math.ceil(count / limit),
        currentpages: page,
        message: "Office",
        baners

      })
  } catch (error) {
    console.log(error.message);
  }
}

const tabletpart = async (req, res) => {
  try {
    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }

    var search = '';
    if (req.query.search) {
      search = req.query.search
    }
    const limit = 4;
    const baners = await banner.find()
    const productData = await product.find({
      $and: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" }, category: { _id: "65dc2b55f67d8e9f3bc10160" } }
      ]
    }).populate("category")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({
      $and: [
        { productname: { $regex: ".*" + search + ".*", $options: "i" }, category: { _id: "65dc2b55f67d8e9f3bc10160" } }
      ]

    }).countDocuments()
    if (productData == 0) {
      res.render("nodata")
    } else
      res.render("homelogin", {
        product: productData,
        totalpages: Math.ceil(count / limit),
        currentpages: page,
        message: "Tablet",
        baners

      })
  } catch (error) {
    console.log(error.message);

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
      category: { _id: "65dc2b1cf67d8e9f3bc10154" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({
      category: { _id: "65dc2b1cf67d8e9f3bc10154" }
    }).countDocuments()
    if (productData == 0) {
      res.render("nodatahome")
    } else
      res.render("home", {
        product: productData,
        totalpages: Math.ceil(count / limit),
        currentpages: page,
        message: "Gaming"
      })
  } catch (error) {
    console.log(error.message);
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
      category: { _id: "65dc2b3bf67d8e9f3bc1015b" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({
      category: { _id: "65dc2b3bf67d8e9f3bc1015b" }
    }).countDocuments()
    if (productData == 0) {
      res.render("nodatahome")
    } else
      res.render("home", {
        product: productData,
        totalpages: Math.ceil(count / limit),
        currentpages: page,
        message: "Office"
      })
  } catch (error) {
    console.log(error.message);
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
      category: { _id: "65dc2b55f67d8e9f3bc10160" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({
      category: { _id: "65dc2b55f67d8e9f3bc10160" }
    }).countDocuments()
    if (productData == 0) {
      res.render("nodatahome")
    } else
      res.render("home", {
        product: productData,
        totalpages: Math.ceil(count / limit),
        currentpages: page,
        message: "Tablet"
      })
  } catch (error) {
    console.log(error.message);
  }
}
const highprice = async (req, res) => {
  try {
    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }
    const limit = 4;
    const products = await product.find({
      productprice: { $gt: 20000 }
    }).limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    if (products == 0) {
      return res.render("nodatahome")
    }

    const baners = await banner.find()



    const count = await product.find({}).countDocuments()
    res.render("homelogin", {
      product: products,
      totalpages: Math.ceil(count / limit),
      currentpages: page,
      baners


    })

  } catch (error) {
    console.log(error.message)
  }
}




const lowprice = async (req, res) => {
  try {

    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }
    const baners = await banner.find()
    const limit = 4;
    const products = await product.find({
      productprice: { $lt: 20000 }
    }).limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    if (products == 0) {
      return res.render("nodatahome")
    }


    const count = await product.find({}).countDocuments()

    res.render("homelogin", {
      product: products,
      totalpages: Math.ceil(count / limit),
      currentpages: page,
      baners

    })

  } catch (error) {
    console.log(error.message)
  }
}



const productpage = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await product.findById({ _id: id })
    if (productData) {
      res.render("productdeatil", { product: productData })
    } else {
      res.redirect("/dashboard")
    }

  } catch (error) {
    console.log(error.message)

  }
}

const wishlistpage = async (req, res) => {
  try {

    const id = req.query.id;
    const UserData = await User.findById({ _id: req.session.user_id })
    const wishList = await wishlist.find({ user: req.session.user_id }).populate("wishlist")
    console.log(wishList, 'wishlist');
    res.render("wishlist", { user: UserData, wishlist: wishList })
    // const productdata = await product.findById({ _id: id })

    // if (productdata) {
    //   res.render("wishlist", { product: productdata, user: UserData })
    // }



  } catch (error) {
    console.log(error.message)

  }
}

const wishcartpage = async (req, res) => {
  try {
    console.log("hiiiiiiiiiiiiiiiiii");
    console.log("add to cart", req.body);
    const productid = req.body.productid
    const deletewish = req.body.deleteid;

    console.log(productid, "productwish");
    console.log(deletewish, "deletewish");
    // const productid = value.productId
    console.log(productid, "llllllllllllllll");
    const userid = req.session.user_id;
    const items = { product_id: productid }
    const productdatas = await product.findById({ _id: productid })
    console.log(productdatas, "loloo");
    const userone = await User.findOne({ _id: userid })
    const exisitingid = userone.cart.items.findIndex(item => item.product_id == productid);
    if (exisitingid !== -1) {
      if (userone.cart.items[exisitingid].qty + 1 >= productdatas.productquantity) {
        console.log("reached to stock")
        return res.status(200).json({ success: false, error: "Out of stock" })
      }
      userone.cart.items[exisitingid].qty = userone.cart.items[exisitingid].qty + 1
      userone.cart.items[exisitingid].totalPrice = userone.cart.items[exisitingid].price + userone.cart.items[exisitingid].price
    } else {
      const productref = await product.findById([{ _id: productid }]);
      const productobject = {
        product_id: productref._id,
        qty: 1,
        price: productref.productprice,
        totalPrice: productref.productprice
      }
      userone.cart.items.push(productobject)
    }
    await userone.save()
    // const deletewish = req.body.deleteid;
    console.log(deletewish, "popopo ");
    await wishlist.deleteOne({ _id: deletewish })
    return res.status(200).json({ success: true, message: "product added to cart" })

  }
  catch (error) {
    console.log(error.message)

  }
}

const cartpage = async (req, res) => {
  try {
    const value = req.body
    const productid = value.productId
    const userid = req.session.user_id;
    const items = { product_id: productid }
    const productdatas = await product.findById({ _id: productid });
    const userone = await User.findOne({ _id: userid })
    const exisitingid = userone.cart.items.findIndex(item => item.product_id == productid);
    if (exisitingid !== -1) {
      if (userone.cart.items[exisitingid].qty + 1 >= productdatas.productquantity) {
        console.log("reached to stock")
        return res.status(200).json({ success: false, error: "Out of stock" })
      }
      userone.cart.items[exisitingid].qty = userone.cart.items[exisitingid].qty + 1
      userone.cart.items[exisitingid].totalPrice = userone.cart.items[exisitingid].price + userone.cart.items[exisitingid].price

    } else {
      const productref = await product.findById([{ _id: productid }]);

      if (productref.discountAmount) {
        const productPush = {
          product_id: productref._id,
          qty: 1,
          price: productref.discountAmount,
          totalPrice: productref.discountAmount
        }
        userone.cart.items.push(productPush)
      } else {
        const productPush = {
          product_id: productref._id,
          qty: 1,
          price: productref.productprice,
          totalPrice: productref.productprice
        }
        userone.cart.items.push(productPush)
      }


    }
    await userone.save()

    return res.status(200).json({ success: true, message: "product added to cart" })
    // res.render("cartalert")
  }
  catch (error) {
    console.log(error.message)

  }
}

const Logincartpage = async (req, res) => {
  try {

    console.log("recghhh");

    const productid = req.body.data
    console.log(productid, "llllllllllllllll");
    const userid = req.session.user_id;
    const items = { product_id: productid }
    const productdatas = await product.findById({ _id: productid });
    console.log(productdatas, "loloo");
    const userone = await User.findOne({ _id: userid })
    const exisitingid = userone.cart.items.findIndex(item => item.product_id == productid);
    if (exisitingid !== -1) {
      if (userone.cart.items[exisitingid].qty + 1 >= productdatas.productquantity) {
        console.log("reached to stock")
        return res.status(200).json({ success: false, error: "Out of stock" })
      }
      userone.cart.items[exisitingid].qty = userone.cart.items[exisitingid].qty + 1
      userone.cart.items[exisitingid].totalPrice = userone.cart.items[exisitingid].price + userone.cart.items[exisitingid].price

    } else {
      const productref = await product.findById([{ _id: productid }]);

      if (productref.discountAmount) {
        const productPush = {
          product_id: productref._id,
          qty: 1,
          price: productref.discountAmount,
          totalPrice: productref.discountAmount
        }
        userone.cart.items.push(productPush)
      } else {
        const productPush = {
          product_id: productref._id,
          qty: 1,
          price: productref.productprice,
          totalPrice: productref.productprice
        }
        userone.cart.items.push(productPush)
      }


    }
    await userone.save()

    return res.status(200).json({ success: true, message: "product added to cart" })

  } catch (error) {
    console.log(error.message)
  }
}











const getProduct = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const productdetail = await User.findOne({ _id: userid }).populate("cart.items.product_id");
    const user = await User.findOne({ _id: userid });
    const value = user?.cart?.items?.reduce((accu, curr) => {
      return accu + curr.totalPrice
    }, 0)

    const sumvalue = user?.cart?.items.findIndex(item => item.price)
    const checkone = user?.cart?.items[sumvalue]?.price;
    const quantity = user?.cart?.items.reduce((accu, curr) => {
      return accu + curr.qty
    }, 0)
    if (user && user.cart) {
      console.log(user.cart.items);
      return res.render("cartpage", { cart: productdetail?.cart?.items, userCart: user.cart.items, totalPrice: value, qty: quantity, total: checkone });
    } else {
      console.error("User or user's cart is null or undefined.");

      return res.render("cartpage", { cart: [], userCart: {} });
    }
  } catch (error) {
    console.error("Error in getProduct:", error);

    res.status(500).send("Internal Server Error");
  }
};





const deletecartitem = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const id = req.query.id;
    const updatedUser = await User.findByIdAndUpdate(
      userid,
      { $pull: { 'cart.items': { _id: id } } },
      { new: true }, // To get the updated document
      res.redirect("/getProduct")
    ).then((res) => {
      console.log(res, 'this is deleted data')
    })
  } catch (error) {
    console.log(error.message)

  }
}



const checkoutpage = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const productdetail = await User.findOne({ _id: userid }).populate("cart.items.product_id");
    const user = await User.findOne({ _id: userid });
    const cartdata = user.cart.items

    const value = user.cart.items.reduce((accu, curr) => {
      return accu + curr.totalPrice
    }, 0)

    const quantity = user.cart.items.reduce((accu, curr) => {
      return accu + curr.qty
    }, 0)
    const checkoutdata = await User.findById({ _id: userid })
    const permenentaddress = checkoutdata.address
    res.render("checkoutpage", { check: checkoutdata, address: permenentaddress, userCart: user.cart.items, totalPrice: value, qty: quantity })
  } catch (error) {
    console.log(error.message)
  }
}



// var instance = new Razorpay({
//   key_id: 'key_secret',
//   key_secret: '',
// });




const addcheckoutpage = async (req, res) => {

  try {
    const userid = req.session.user_id;
    const {
      address,
      paymentMethod
    } = req.body;


    const cartitem = await User.findById({ _id: userid })
    await User.findByIdAndUpdate({ _id: userid }, {
      $push: {
        payment: {
          address: address,
          paymentMethod: paymentMethod,

        }
      }
    }, { new: true })

    const userdetail = await User.findByIdAndUpdate({ _id: userid }).select("cart")
    const cartitems = userdetail.cart.items;
    const neworder = new order({
      user: userid,
    })

    for (let item of cartitems) {
      await products.findByIdAndUpdate({
        _id: item.product_id
      }, { $inc: { productquantity: -item.qty } })
    }


    for (let item of cartitems) {
      const product = {
        product_id: item.product_id,
        qty: item.qty,
        price: item.price,
        totalPrice: item.totalPrice,
        status: item.status,
        address: address,
        paymentMethod: paymentMethod


      }
      neworder.products.push(product)
    }
    await neworder.save();
    const data = await User.findByIdAndUpdate({ _id: userid }, { $set: { "cart.items": [] } })
    res.render("paymentsuccess")
  } catch (error) {
    console.log(error.message)
  }
}


const addaddress = async (req, res) => {
  try {

    res.render("addAddress")

  } catch (error) {
    console.log(error.message)
  }
}

const editAddress = async (req, res) => {
  try {
    const addressid = req.query.id
    const userid = req.session.user_id;
    const uservalue = await User.findById({ _id: userid })
    const addressID = uservalue.address1.findIndex(item => item._id == addressid)
    const addressfind = uservalue.address1[addressID]
    res.render("editAddress", { address: addressfind })
  } catch (error) {
    console.log(error.message)
  }
}

const updateeditAddress = async (req, res) => {
  try {
    const addressId = req.body.id;
    const userId = req.session.user_id;
    // Validate and sanitize inputs
    const {
      firstName,
      lastName,
      email,
      address,
      state,
      city
    } = req.body;

    // Construct the updated address object
    const updatedAddress = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      address: address,
      state: state,
      city: city,
    }

    // Update the user's address
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, 'address1._id': addressId },
      { $set: { "address1.$": updatedAddress } }, { new: true, runValidators: true },

    );





    // Check if the user was found and updated
    if (!updatedUser) {
      return res.status(404).send("User not found or address not updated.");
    }

    res.redirect("/aboutus");

  } catch (error) {
    if (error.errors) {
      const userId = req.session.user_id;
      const addressdata = await User.findById(
        { _id: userId }).select("address1")
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('editAddress', { message, address: addressdata }); // Pass errors to the view
    }



    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

const addaddresspost = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      address,
      state,
      city
    } = req.body;

    const userId = req.session.user_id;
    const user = await User.findById(userId);

    if (user.address1.length > 0) {
      user.address1.push({
        firstName,
        lastName,
        address,
        state,
        city
      });
    } else {
      user.address1 = [{
        firstName,
        lastName,
        address,
        state,
        city
      }];
    }

    await user.save();
    res.redirect("/aboutus");

  } catch (error) {
    console.error(error.message);
    const userId = req.session.user_id;
    const userdetails = await User.findById(userId);

    const message = Object.values(error.errors).map(err => err.message);

    return res.render('addAddress', {
      message,
      user: userdetails
    });
  }
};









const checkaddress = async (req, res) => {
  try {

    res.render("checkAddress")

  } catch (error) {
    console.log(error.message)
  }
}



const updatecheckaddress = async (req, res) => {
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
      },
      { new: true, runValidators: true }
    );

    console.log("Checkout data added");
    res.redirect("/checkout");
  } catch (error) {
    console.error(error.message);
    const userid = req.session.user_id;

    const userdetails = await User.findById({ _id: userid });

    const message = Object.values(error.errors).map(err => err.message);

    return res.render('checkAddress', { message, user: userdetails });

  }
};


const quatityup = async (req, res) => {
  try {

    let cloneItems = [];
    const product_id = req.params.product_id;
    const productdata = req.params._id;
    const valueup = parseInt(req.body.quantity);
    const productvalue = req.body.quantity;
    const myproduct = await product.findById({ _id: productdata })
    if (productvalue > myproduct.productquantity) {
      return res.status(200).json({ status: "outofstock" })
    }

    //  const productqty = await product.findByIdAndUpdate({_id:productdata}, {$inc: {productquantity: -1}});
    const userid = req.session.user_id;
    const userproduct = await User.findOne({ "cart.items._id": product_id });
    const exisitingid = userproduct.cart.items.findIndex(item => item._id == product_id)

    const passproductdetails = userproduct.cart.items[exisitingid];
    const Totalprice = passproductdetails.totalPrice  //total price of object 1
    const productPrice = passproductdetails.price;    //actualprice of object 1
    const productQty = passproductdetails.qty + 1;
    //  -----------------------------------------------------
    const totalprice = productPrice * productQty
    const totalvalue = userproduct.cart.items[exisitingid].totalPrice;
    await User.findByIdAndUpdate(
      userid,
      {
        $set: {
          [`cart.items.${exisitingid}.totalPrice`]: totalprice
        }
      },
      { new: true });
    const TotalAmount = userproduct.totalAmount;
    const TotalQuantity = userproduct.totalQty;
    const productdetails = await product.findOne({ _id: userproduct.cart.items[exisitingid].product_id });
    const user = await User.findOne({ "cart.items._id": product_id });
    const cartItems = user.cart.items;
    const itemindex = cartItems.findIndex((item) => {
      return item._id.toString() === product_id
    })
    const Items = cartItems.forEach((item) => {
      if (item._id.toString() === product_id) {
        item.qty = valueup
      }
    })
    await User.findByIdAndUpdate(user._id, { $set: { "cart.items": cartItems } }, { new: true, runValidators: true })
    res.status(200).json({ status: "updated", totalprice })
  } catch (error) {
    console.log(error.message)
  }
}



const quatitydown = async (req, res) => {
  try {
    const productdata = req.params._id;
    const minvalue = req.body.quantity;
    const currentqty = await product.findByIdAndUpdate({ _id: productdata });
    if (minvalue < 1) {
      return res.status(200).json({ status: "Quantityone" })
    }
    let cloneItems = []
    const product_id = req.params.product_id;
    const quatity = req.body.quantity;
    const userid = req.session.user_id;
    const userproduct = await User.findOne({ "cart.items._id": product_id });
    const exisitingid = userproduct.cart.items.findIndex(item => item._id == product_id)
    const passproductdetails = userproduct.cart.items[exisitingid]
    const Totalprice = passproductdetails.totalPrice
    const productPrice = passproductdetails.price;
    const productQty = quatity;
    const totalprice = productPrice * productQty
    const totalvalue = userproduct.cart.items[exisitingid].totalPrice;
    await User.findByIdAndUpdate(
      userid,
      {
        $set: {
          [`cart.items.${exisitingid}.totalPrice`]: totalprice
        }
      },
      { new: true });
    await User.findByIdAndUpdate(
      userid,
      {
        $set: {
          [`cart.items.${exisitingid}.qty`]: quatity
        }
      },
      { new: true });
    const productdetails = await product.findOne({ _id: userproduct.cart.items[exisitingid].product_id });
    const user = await User.findOne({ "cart.items._id": product_id });
    const cartItems = user.cart.items;
    const itemindex = cartItems.findIndex((item) => {
      return item._id.toString() === product_id
    })
    const Items = cartItems.forEach((item) => {
      if (item._id.toString() === product_id) {
        item.qty = quatity
      }
    })
    await User.findByIdAndUpdate(user._id, { $set: { "cart.items": cartItems } }, { new: true, runValidators: true })
    res.status(200).json({ status: "updated" })
  } catch (error) {
    console.log(error.message)
  }
}


const user_cart = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const currentuser = await User.findById(userid).select("cart")
    res.status(200).json({ currentuser })
  } catch (error) {
    console.log(error.message)
  }
}


const totalprice = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await User.findOne({ _id: userid });
    const value = user.cart.items.reduce((accu, curr) => {
      return accu + curr.totalPrice
    }, 0)
    res.status(200).json({ valueOne: value })
  } catch (error) {
    console.log(error.message)
  }
}


const totalquantity = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await User.findOne({ _id: userid });
    const quantity = user.cart.items.reduce((accu, curr) => {
      return accu + curr.qty
    }, 0)
    res.status(200).json({ valueOne: quantity })
  } catch (error) {
    console.log(error.message)
  }
}


const deleteOrderList = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const deleteid = req.query.id;
    const orderid = req.query.orderid;
    const productdataid = req.query.deleteproductid
    console.log(productdataid, "product id");
    const myorder = await order.findById({ _id: orderid }).populate("products.$.product_id");
    const cancelproduct = myorder.products.find(product => product._id.toString() === deleteid)
    cancelproduct.status = "canceled";
    const productid = myorder.products.find(product => product.product_id);
    const idproduct = productid.product_id;
    try {
      await myorder.save();
      const productdata = myorder.products
      for (let item of productdata) {
        if (item.product_id == productdataid) {
          await products.findByIdAndUpdate({ _id: item.product_id }, { $inc: { productquantity: item.qty } })
        }
      }
      console.log('User saved successfully');
    } catch (error) {
      console.error('Error saving user:', error);
      return res.status(500).send('Error saving user');
    }



    const orderStatus = await order.findById({ _id: orderid })
    const orderstatus = orderStatus.products.findIndex(item => item.product_id.toString() == productdataid)
    const cashondeliverystatus = orderStatus.products[orderstatus].paymentMethod == "cash on delivery";

    if (cashondeliverystatus == true) {
      console.log("cash on delvery");
      res.redirect("/aboutus");
    } else {
      const orderId = await order.findById({ _id: orderid });
      const totalPriceSum = orderId.products.reduce((accu, curr) => {
        return accu + curr.totalPrice;
      }, 0);

      await User.findByIdAndUpdate(
        { _id: userid },
        {
          $push: {
            walletHistory: {
              amount: totalPriceSum,
              direction: "+",
              description:"The amount is credited in your walletaccount",
              status: orderStatus.products[orderstatus].status,
              paymentMethod: orderStatus.products[orderstatus].paymentMethod
            }
          }
        }
      )
      const walletAmount = await User.findById({ _id: userid }).select("walletHistory");
      const totalPrice = walletAmount.walletHistory.reduce((accu, curr) => {
        return accu + curr.amount
      }, 0)
      const orderdetails = await order.findById({ _id: orderid });
      const walletPrice = await User.findByIdAndUpdate({ _id: userid }, { $set: { wallet: totalPrice } })
      res.redirect("/aboutus");
      // payment checking status here
    }


  } catch (error) {
    console.log(error.message)
  }
}

const returnedOrderList = async (req, res) => {
  try {

    console.log("reachgereeeee");

    const userid = req.session.user_id;
    const productID = req.body.productId;
    const orderid = req.body.orderId
    const orderdetails = await order.findById({ _id: orderid }).populate("products.$.product_id");
    console.log(orderdetails, 'orderiddetails');
    const orderchanging = orderdetails.products.find(product => product.product_id.toString() === productID)
    const orderindex = orderdetails.products.findIndex(item => item.product_id.toString() == productID)
    console.log(orderindex, "indexnumber");
    console.log(orderchanging, 'pppp');
    orderchanging.status = "returnrequest";
    await orderdetails.save()
    const orderdeatil = await order.findById({ _id: orderid }).populate("products.product_id");
    const value = orderdetails.products[orderindex]
    console.log(value, "order");
    console.log(orderdeatil, "orderpage");
    const orderstatus = await order.findById({ _id: orderid })
    const productIndex = orderstatus.products.findIndex(item => item.product_id.toString() == productID)
    const returnsuccess = orderstatus.products[productIndex].status == "returnApproved"
    res.json({ status: true })
  } catch (error) {
    console.log(error.message)
  }
}



const editUserProfile = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const userdetails = await User.findById({ _id: userid });
    res.render("editSignup", { user: userdetails })
  } catch (error) {
    console.log(error.message)
  }
}


const UpdateUserProfile = async (req, res) => {
  try {
    const images = req.files.map(file => file.filename)
    const { username, email, number } = req.body
    const userid = req.session.user_id;
    var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    var emailcheck = pattern.test(email);
    if (!emailcheck) {
      const userdetails = await User.findById({ _id: userid });
      return res.render("editSignup", { message: "Invalid email format", user: userdetails })
    }
    const updateprofile = await User.findByIdAndUpdate({ _id: userid }, { $set: { username: username, email: email, number: number, images: images } }, { new: true, runValidators: true });
    res.redirect("/aboutus")
  } catch (error) {
    console.log(error.message)
    if (error.errors) {
      const userid = req.session.user_id;
      const userdetails = await User.findById({ _id: userid });
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('editSignup', { message, user: userdetails }); // Pass errors to the view
    }
  }
}


const sentPassword = async (usermail, emailnew) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      }
    })
    const mailoption = {
      from: process.env.SMTP_USERNAME,
      to: emailnew,
      subject: "For verification mail",
      html: '<p>To conform change password Click the link below:</p><a href="http://localhost:7000/forgotpassword">click</a>',

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


const forgotPassword = async (req, res) => {
  try {
    res.render("forgotpassword")
  } catch (error) {
    console.log(error.message)
  }
}

const updateforgotpassword = async (req, res) => {
  try {
    const useremail = req.body.email;
    const userone = await User.findOne({ email: useremail });
    const pass = req.body.password;
    const password = userone.password
    const passmatch = await bcrypt.compare(pass, password);
    if (passmatch) {
      const newpassword = req.body.newpassword;
      var regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
      const isValid = (newpassword.length > 6 && newpassword.length === 8) || regularExpression.test(newpassword)
      if (!isValid) {
        return res.render("forgotpassword", { message: "Invalid password. It should be at least 8 characters long and contain at least one special character" })
      }
      const spassword = await securepassword(newpassword)
      userone.password = spassword
      await userone.save()
      res.render("forgotpassword", { message: "Your password is changed please login again" })
    } else {
      res.render("forgotpassword", { message: "Please check your old password" })
    }
  } catch (error) {
    console.log(error.message)
  }
}


const updateverifypassword = async (req, res) => {
  try {
    const emailid = req.body.email;
    const usermail = await User.findOne({ email: emailid });
    if (usermail) {
      const Username = usermail.username
      const emailnew = usermail.email
      sentPassword(Username, emailnew, usermail)
      return res.render("passwordsuccess")
    } else {
      res.render("passwordok", { message: "This email id doesnot exist" })
    }
  } catch (error) {
    console.log(error.message)
  }
}


const verifypassword = async (req, res) => {
  try {
    res.render("passwordok")
  } catch (error) {
    console.log(error.message)
  }
}

const changepassword = async (req, res) => {
  try {
    res.render("edit-password")
  } catch (error) {
    console.log(error.message)
  }
}

const updatechangepassword = async (req, res) => {
  try {

    const userid = req.session.user_id;
    const userone = await User.findById({ _id: userid });
    const pass = req.body.password;
    const password = userone.password
    const passmatch = await bcrypt.compare(pass, password);
    if (passmatch) {
      const newpassword = req.body.newpassword;
      var regularExpression = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
      const isValid = (newpassword.length > 6 && newpassword.length === 8) || regularExpression.test(newpassword)
      if (!isValid) {
        return res.render("edit-password", { message: "Invalid password. It should be at least 8 characters long and contain at least one special character" })
      }
      const spassword = await securepassword(newpassword)
      userone.password = spassword
      await userone.save()
      res.redirect("/aboutus")
    } else {
      res.render("edit-password", { message: "Please check your old password" })
    }
  } catch (error) {
    console.log(error.message)
  }
}

const detailpage = async (req, res) => {
  try {

    const userid = req.session.user_id;
    const orderid = req.query.orderid;
    const productid = req.query.productid;
    const product_id =req.query.deleteproductid
    const payment = req.query.payment;
    const orderdeatil = await order.findById({ _id: orderid }).populate("products.product_id");
    console.log(orderdeatil, 'stuuuuu');
    const currentindex = orderdeatil.products.findIndex(item => item._id.toString() == productid)
    const value = orderdeatil.products[currentindex];
    if(value.status == "returnApproved"){
      const orderId = await order.findById({ _id: orderid });
      const totalPriceSum = orderId.products.reduce((accu, curr) => {
        return accu + curr.totalPrice;
      }, 0);
      console.log(totalPriceSum, "total");
      const updateWallet = {
        $push: {
          walletHistory: {
            amount: totalPriceSum,
            direction: "+",
            description: "Return amount credited",
          },
        },
      }
      const updatedUser = await User.findByIdAndUpdate({ _id: userid }, updateWallet, { new: true });
      const walletAmount = await User.findById({ _id: userid }).select("walletHistory");
      const totalPrice = walletAmount.walletHistory.reduce((accu, curr) => {
        return accu + curr.amount
      }, 0)
      const walletPrice = await User.findByIdAndUpdate({ _id: userid }, { $set: { wallet: totalPrice } })
      await orderdeatil.save()
      res.render("orderDETAILS", { order: value, orderpage: orderdeatil })


    }else{
      res.render("orderDETAILS", { order: value, orderpage: orderdeatil })
    }

  } catch (error) {
    console.log(error.message)
  }
}

const Invoice = async (req, res) => {
  try {

    const orderid = req.query.orderid;
    const productid = req.query.productid;
    const payment = req.query.payment;
    const orderdeatil = await order.findById({ _id: orderid }).populate("products.product_id");
    console.log(orderdeatil, 'stuuuuu');
    const userData = await order.findById({ _id: orderid }).populate("user")
    const currentindex = orderdeatil.products.findIndex(item => item._id.toString() == productid)
    const value = orderdeatil.products[currentindex];
    // res.render("orderdetail", { order: value, orderpage: orderdeatil })
    res.render("InvoicePage", { product: value, order: orderdeatil, user: userData })

  } catch (error) {
    console.log(error.message)
  }

}





const deleteaddress = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const addressid = req.query.id;
    const userdetails = await User.findById({ _id: userid });
    const userone = userdetails.address1.findIndex(item => item._id.toString() == addressid)
    const address = userdetails.address1[userone]._id;
    console.log(address, "popopop");
    const value = await User.findByIdAndUpdate({ _id: userid }, { $pull: { address1: { _id: address } } });

    res.redirect("/aboutus")


  } catch (error) {
    console.log(error.message)
  }
}












const instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

const rayzopayIntitial = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const dicountAmount = req.body.discount;
    console.log(dicountAmount, "discount");

    const userdetails = await User.findById({ _id: userid }).select("cart");
    const cartitems = await User.findById({ _id: userid }).select("cart.items");

    const totalamount = userdetails.cart.items.reduce((accu, curr) => {
      return accu + curr.totalPrice;
    }, 0);

    const shippingCharge =100;

    let afterDiscount;
    if (dicountAmount) {
      afterDiscount = totalamount - dicountAmount;
    } else {
      afterDiscount = totalamount;
    }

    const orderdetails = await instance.orders.create({
      amount: (afterDiscount + shippingCharge) * 100,
      currency: "INR",
      receipt: "receipt-1" + Date.now(),
    });

    const neworder = new order({
      user: userid,
    });

    for (let item of cartitems.cart.items) {
      await products.findByIdAndUpdate(
        { _id: item.product_id },
        { $inc: { productquantity: -item.qty } }
      );
    }

    for (let item of cartitems.cart.items) {
      const product = {
        product_id: item.product_id,
        qty: item.qty,
        price: item.price,
        totalPrice: ((((item.price)*item.qty) + shippingCharge) -dicountAmount) ,
        status: "Order placed",
        address: req.body.address,
        paymentMethod: "onlinePay",
        couponDiscount: dicountAmount,
       
      };
      neworder.products.push(product);
    }
    neworder.subtotal=afterDiscount
    neworder.rayzorpayId = orderdetails.id;


    await neworder.save(); // Save the new order


    await User.findByIdAndUpdate({ _id: userid }, { $set: { "cart.items": [] } });


    const userdata = await User.findById({ _id: userid });

    const couponcode = req.body.coupon;
    console.log(couponcode, "couponcode");
    if (couponcode) {
      const couponData = await coupon.findOneAndUpdate(
        { couponcode: couponcode, usagelimit: { $gt: 0 } },
        {
          $push: { user: userid },
          $inc: { usagelimit: -1 },
        },
        { new: true }
      );
    }

    const neworderObject = neworder.toObject();
    console.log(neworderObject, 'getttttttttt');

    res.json({ orderid: orderdetails.id, orders: neworderObject });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
};


const rayzopayPaymentContinue = async (req, res) => {
  try {

    console.log("controller");
    const userid = req.session.user_id;
    const dicountAmount = req.body.discount;
    const afterDiscount = req.body.TotalAmount
    const orderId = req.body.orderID;
    const productId = req.body.productId
    const newStatus = 'Order placed';
    console.log(dicountAmount, 'dicount');
    console.log(afterDiscount, 'total');
    console.log(orderId, 'orderID');
    console.log(productId, 'productID');

    const orderdetails = await instance.orders.create({
      amount: afterDiscount * 100,
      currency: "INR",
      receipt: `receipt-1${Date.now()}`,
    });

    const neworder = await order.findById({ _id: orderId })

    console.log(orderdetails, "orderdataID");
    console.log(orderdetails.id, "orderid is this");

    console.log(neworder.rayzorpayId, "fuedeeew");


    const result = await order.updateOne(
      { _id: orderId, 'products.product_id': productId },
      { $set: { 'products.$.status': newStatus } }
    );

    res.json({ orderid: orderdetails.id });
  } catch (error) {
    console.error('Error processing payment continuation:', error);
    res.status(500).json({ status: false, error: 'Internal server error', details: error.message });
  }
};





















const rayzopayPaymentSuccess = async (req, res) => {
  try {
    const result = req.body.value;
    console.log(result, "Response");
    const decodedResult = decodeURIComponent(result.replace(/&#34;/g, '"'));
    console.log(decodedResult, 'Decoded result');
    const resultObject = JSON.parse(decodedResult);
    console.log(resultObject, 'Parsed data');
    const filter = { _id: resultObject._id }
    const updateResult = await order.updateOne(filter, resultObject, { upsert: true });
    res.json({ status: true, data: updateResult });

  } catch (error) {
    console.error('Error processing payment success:', error.message);
    res.status(500).json({ status: false, error: 'Internal server error' });
  }
};




const rayzopayPaymentFailed = async (req, res) => {
  try {
    // Extracting the 'value' property from the request body
    const result = req.body.value;

    // Decoding the 'value' property, replacing HTML entities with corresponding characters
    const decodedResult = decodeURIComponent(result.replace(/&#34;/g, '"'));
    console.log(decodedResult, 'Decoded result');

    // Parsing the decoded result into a JSON object
    const resultObject = JSON.parse(decodedResult);
    console.log(resultObject, 'Parsed data');

    // Updating the status of each product in the 'products' array to 'Payment Failed'
    resultObject.products.forEach((product) => {
      product.status = 'pending';
    });

    // Define criteria to find the existing order, for example, based on a unique identifier
    const criteria = { _id: resultObject._id };

    // Use findOneAndUpdate to find and update the existing order or create a new one if not found
    const updatedOrder = await order.findOneAndUpdate(
      criteria,
      { $set: resultObject },
      { new: true, upsert: true }
    );

    // Sending a JSON response with the status and updated order data
    res.json({ status: true, data: updatedOrder });
  } catch (error) {
    // Adding more specific error handling based on the type of error
    console.error('Error processing payment failure:', error);

    // Sending a meaningful error response
    res.status(500).json({ status: false, error: 'Internal server error', details: error.message });
  }
};







// const  rayzopayPaymentFailed = async (req, res) => {
//   try {
//     const result = req.body.value;

//     // Decode HTML entities
//     const decodedResult = decodeURIComponent(result.replace(/&#34;/g, '"'));
//     console.log(decodedResult, 'decoded result');

//     // Parse the decoded JSON string
//     const resultObject = JSON.parse(decodedResult);
//     console.log(resultObject, 'parsed data');
//     resultObject.priduc

//     // Save data using Mongoose model (assuming "order" is a Mongoose model)
//     const dataSave = await new order(resultObject);
//     console.log(dataSave, 'order schema');



//     // Save the document
//     const data = await dataSave.save();
//     res.json({ status: true, data: data });

//   } catch (error) {
//     console.error('Error processing payment success:', error.message);
//     res.status(500).json({ status: false, error: 'Internal server error' });
//   }
// };









const cashowndelivery = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const dicountAmount = req.body.discount;
    const userdetails = await User.findById({ _id: userid }).select("cart");
    const cartitems = await User.findById({ _id: userid }).select("cart.items")
    const totalamount = userdetails.cart.items.reduce((accu, curr) => {
      return accu + curr.totalPrice
    }, 0);

    let afterDiscount
    if (dicountAmount) {
      afterDiscount = totalamount - dicountAmount
    } else {
      afterDiscount = totalamount
    }

    var shippingCharge=100;

    const neworder = new order({
      user: userid,
    })
    for (let item of cartitems.cart.items) {
      await products.findByIdAndUpdate({
        _id: item.product_id
      }, { $inc: { productquantity: -item.qty } })
    }
    for (let item of cartitems.cart.items) {
      const product = {
        product_id: item.product_id,
        qty: item.qty,
        price: item.price,
        totalPrice:((((item.price)*item.qty) + shippingCharge) -dicountAmount),
        status: "Order placed",
        address: req.body.address,
        paymentMethod: "cash on delivery",
        couponDiscount: dicountAmount,
       

      }
      neworder.products.push(product)

      neworder.subtotal=afterDiscount

      console.log(neworder, "new order details getttttttttttttttttt");

    }
    await neworder.save();
    const data = await User.findByIdAndUpdate({ _id: userid }, { $set: { "cart.items": [] } })
    const userdata = await User.findById({ _id: userid })
    const couponcode = req.body.coupon
    if (couponcode) {
      const couponData = await coupon.findOneAndUpdate(
        { couponcode: couponcode, usagelimit: { $gt: 0 } }, // Ensure usagelimit is greater than 0
        {
          $push: { user: userid, },
          $inc: { usagelimit: -1 } // Decrement usagelimit by 1
        },
        { new: true }
      );
    }
    // const orderdata =req.body.datavalue;
    res.json({ status: true });

  } catch (error) {
    console.log(error.message)
  }
}

















// const rayzopayIntitial = async (req, res) => {
//   try {
//     const userid = req.session.user_id;

//     // Combine the queries to fetch user details and cart items
//     const { cart } = await User.findById(userid).select("cart items");

//     // Calculate total amount
//     const totalamount = cart.items.reduce((accu, curr) => accu + curr.totalPrice, 0);

//     // Create Razorpay order
//     const orderdetails = await instance.orders.create({
//       amount: totalamount * 100,
//       currency: "INR",
//       receipt: "receipt-1" + Date.now(),
//     });

//     console.log(orderdetails, "orderdata");

//     // Update product quantities and create a new order
//     const neworder = new order({ user: userid });

//     for (let item of cart.items) {
//       await Product.findByIdAndUpdate(item.product_id, { $inc: { productquantity: -item.qty } });

//       const product = {
//         product_id: item.product_id,
//         qty: item.qty,
//         price: item.price,
//         totalPrice: item.totalPrice,
//         status: item.status,
//         address: req.body.address,
//         paymentMethod: "onlinePay",
//       };

//       neworder.products.push(product);
//     }

//     neworder.rayzorpayId = orderdetails.id;
//     await neworder.save();

//     // Clear the user's cart
//     await User.findByIdAndUpdate(userid, { $set: { "cart.items": [] } });

//     // Send the response
//     res.json({ orderid: orderdetails.id });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };



const rayzopayContinue = async (req, res) => {
  try {
    const orderId = req.query.orderid;
    const datas = req.query.data;
    const TotalAmount = req.query.Totalamount;

    console.log(productdata, 'get the data here');

    res.render("RayzopayCheckOut", { orderid: orderId, total: TotalAmount })

  } catch (error) {
    console.log(error.message)
  }
}



const rayzopayChecking = async (req, res) => {
  try {


    const orderId = req.query.orderid;

    console.log(orderId, 'orderId');

    const TotalAmount = req.query.Totalamount;

    res.render("RayzopayPage", { orderid: orderId, total: TotalAmount })

  } catch (error) {
    console.log(error.message)
  }
}









const rayzopayCompletion = async (req, res) => {
  try {


    const orderId = req.query.orderid;
    const datas = req.query.data;
    console.log(orderId, 'orderId');
    console.log(datas, 'datagether');
    const TotalAmount = req.query.Totalamount;

    console.log(TotalAmount,"totalsssssssssssssssssssssssssssssss");
    const productdata = JSON.parse(datas);
    console.log(productdata, 'ooooooooooooooo');
    res.render("RayzopayCheckOut", { orderid: orderId, total: TotalAmount, productdata })

  } catch (error) {
    console.log(error.message)
  }
}

const couponget = async (req, res) => {
  try {
    const couponget = await coupon.find()

    res.status(200).json({ success: true, coupon: couponget })

  } catch (error) {
    console.log(error.message)
  }
}

const discountCoupon = async (req, res) => {
  try {

    const userid = req.session.user_id;
    const couponcode = req.body.name;
    const totalvalue = req.body.total;
    const value = await coupon.find({ couponcode: couponcode });
    const cuponUsed = await coupon.find({}).select("user")

    const userCouponUsed = await coupon.findOne({ couponcode: couponcode, user: { $in: [userid] } });

    if (userCouponUsed) {
      res.json({ message: "You already used this coupon" })
    }
    console.log(cuponUsed, "couponcheck");

    console.log(cuponUsed.user, "couponstatus");

    if (value.length != 0) {
      if (totalvalue >= value[0].minamount && totalvalue < value[0].maxamount) {
        const percentageAmount = (totalvalue * value[0].percentage) / 100;
        res.json({ totalDiscount: percentageAmount, status: true })
      } else {
        res.json({ message: `For use this coupon you need to purchase upto the price range:(Min-Max):-${value[0].minamount}-${value[0].maxamount}` })
      }

    } else {
      console.log("loloalala");
      res.json({ status: false })
    }

  } catch (error) {
    console.log(error.message)
  }
}

const showAllCoupons = async (req, res) => {
  try {

    const couponCollection = await coupon.find({})
    res.render("showAllCoupons", { couponValue: couponCollection })

  } catch (error) {
    console.log(error.message)

  }
}

const addToCart = async (req, res) => {
  try {
    const wishupdate = req.query.id;
    const userid = req.session.user_id;
    const productdetails = await product.findById({ _id: wishupdate })
    const userone = await User.findByIdAndUpdate({ _id: userid })

    const exisitingid = userone.cart.items.findIndex(item => item.product_id == wishupdate);
    if (exisitingid !== -1) {
      if (userone.cart.items[exisitingid].qty + 1 >= productdetails.productquantity) {
        console.log("reached to stock")
        return res.status(200).json({ success: false, error: "Out of stock" })
      }

      userone.cart.items[exisitingid].qty = userone.cart.items[exisitingid].qty + 1
    } else {
      const productref = await product.findById([{ _id: wishupdate }]);
      const productobject = {
        product_id: productref._id,
        qty: 1,
        price: productref.productprice,
        totalPrice: productref.productprice
      }
      userone.cart.items.push(productobject)
    }
    await userone.save()

    res.redirect("/getproduct")

  } catch (error) {
    console.log(error.message)
  }
}


const addWish = async (req, res) => {
  try {

    const userid = req.session.user_id;
    const productid = req.body.productID;
    const productvalue = await product.findById({ _id: productid });
    const result = await wishlist.findOne({ wishlist: productid });
    if (result) {
      res.json({ message: "Product already exists in the wishlist" });
    } else {
      const wishvalue = new wishlist({
        user: userid,
        wishlist: productvalue,
      });
      await wishvalue.save();
      res.json({ status: true });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const deleteWish = async (req, res) => {
  try {
    const deletewish = req.query.deleteid;
    console.log(deletewish, "wishlist................");
    await wishlist.deleteOne({ _id: deletewish })
    res.redirect("/wishlist")
  } catch (error) {
    console.log(error.message)
  }
}

const Wallets = async (req, res) => {
  try {

    var page = 1;
    if (req.query.page) {
      var page = req.query.page
    }
    const limit = 5;

    const userid = req.session.user_id;
    const userlatest = await User.findById(userid).sort({ "walletHistory._id": -1 }) 
   
    
    const userdetails = await User.findById({ _id: userid })
    const count = await User.findById({ _id: userid }).sort({ "walletHistory.createdAt": 1  }).countDocuments()

    console.log(userlatest, "popopo");
    const walet = await User.findById({ _id: userid })
    const totalprice = walet.wallet
    console.log(totalprice, "price came");
    res.render("walletpage", { user: userdetails, walet: userlatest, total: totalprice,    })
  } catch (error) {
    console.log(error.message)
  }
}

const Walletcheck = async (req, res) => {
  try {
    const totalprice = req.body.totalprice;
    const userid = req.session.user_id;
    const dicountAmount = req.body.discount
    const cartitems = await User.findById({ _id: userid }).select("cart.items")
    const totalamount = cartitems.cart.items.reduce((accu, curr) => {
      return accu + curr.totalPrice
    }, 0);  

    const shippingCharge =100;

   

    let afterDiscount
    if (dicountAmount) {
      afterDiscount = totalamount - dicountAmount
    } else {
      afterDiscount = totalamount
    }
    const userlatest = await User.findById({ _id: userid }).select("wallet");
    console.log(userlatest.wallet, "wallet_his");
    const walletAmount = userlatest.wallet
    if (totalprice > userlatest.wallet) {
      res.json({ message: "You don't have enough money in your wallet" })
    } else {

      const amount = walletAmount - totalprice
      const userlatest = await User.findByIdAndUpdate({ _id: userid }, { $set: { wallet: amount } });
      // const userlatest = await User.findByIdAndUpdate({ _id: userid },{walletHistory:})
      await User.findByIdAndUpdate(
        { _id: userid },
        {
          $push: {
            walletHistory: {
              amount: totalprice,
              direction: "-",
            description:"The Amount debited from your wallent account"

            }
          }
        }
      )
      console.log(userlatest, "reached here");

      const cartitems = await User.findById({ _id: userid }).select("cart.items")
      const neworder = new order({
        user: userid,
      })

      for (let item of cartitems.cart.items) {
        await products.findByIdAndUpdate({
          _id: item.product_id
        }, { $inc: { productquantity: -item.qty } })
      }
      for (let item of cartitems.cart.items) {
        const product = {
          product_id: item.product_id,
          qty: item.qty,
          price: item.price,
          totalPrice: ((((item.price)*item.qty) + shippingCharge) -dicountAmount),
          status: 'Order placed',
          address: req.body.address,
          paymentMethod: "Wallet",
          couponDiscount: dicountAmount,
          subtotal:afterDiscount

        }
        neworder.products.push(product)
      }

      neworder.subtotal=afterDiscount
      await neworder.save();

      console.log(neworder, "poippoiedepoiepod");

      const couponcode = req.body.coupon
      if (couponcode) {
        const couponData = await coupon.findOneAndUpdate(
          { couponcode: couponcode, usagelimit: { $gt: 0 } }, // Ensure usagelimit is greater than 0
          {
            $push: { user: userid, },
            $inc: { usagelimit: -1 } // Decrement usagelimit by 1
          },
          { new: true }
        );
      }
      const data = await User.findByIdAndUpdate({ _id: userid }, { $set: { "cart.items": [] } })
      res.json({ status: true })
    }
  } catch (error) {
    console.log(error.message)
  }
}

const cancelStatus = async (req, res) => {
  try {

    const productId = req.body.productID
    const orderID = req.body.orderID;

    const orderData = await order.findById({ _id: orderID });
    const index = orderData.products.findIndex(item => item._id.toString() == productId)
    orderData.products[index].status = "canceled";
    await orderData.save()




    res.status(200).json({ message: 'Product status updated to canceled' });

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
  addcheckoutpage,
  addaddresspost,
  getProduct,
  highprice,
  lowprice,
  quatityup,
  addaddress,
  quatitydown,
  user_cart,
  totalprice,
  totalquantity,
  deleteOrderList,
  editUserProfile,
  UpdateUserProfile,
  forgotPassword,
  verifypassword,
  updateverifypassword,
  updateforgotpassword,
  changepassword,
  updatechangepassword,
  checkaddress,
  updatecheckaddress,
  detailpage,
  deleteaddress,
  editAddress,
  updateeditAddress,
  rayzopayIntitial,
  rayzopayCompletion,
  returnedOrderList,
  couponget,
  discountCoupon,
  showAllCoupons,
  addToCart,
  addWish,
  deleteWish,
  wishcartpage,
  Wallets,
  Walletcheck,
  cashowndelivery,
  cancelStatus,

  Logincartpage,
  rayzopayPaymentSuccess,
  Invoice,
  rayzopayPaymentFailed,
  rayzopayPaymentContinue,
  rayzopayChecking


}



