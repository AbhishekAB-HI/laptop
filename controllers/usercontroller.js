
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
      const { username, number, password } = req.body;
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
      

      const spassword = await securepassword(password)
      const user = new User({
        username: username,
        email: emailid,
        password: spassword,
        number: number,
        is_admin: 0,
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
        { productname: { $regex: ".*" + search + ".*", $options: "i" } }
      ]
    }).countDocuments()

    if (count === 0) {
      res.render("nodatahome")
    } else
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
   const userorder = await order
  .find({ user: req.session.user_id })
  .populate("products.product_id")
  .sort({ createdAt: -1 });      
    res.render("userprofile", { user: UserData, address: useraddress, userCart: userorder })
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
      category: { _id: "65b686ef458b73c4060770b1" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const count = await product.find({
      category: { _id: "65b686ef458b73c4060770b1" }
    }).countDocuments()

    if (productData == 0) {
      res.render("nodata")
    } else
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
      category: { _id: "65b68708458b73c4060770b5" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({
      category: { _id: "65b68708458b73c4060770b5" }
    }).countDocuments()
    if (productData == 0) {
      res.render("nodata")
    } else
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
      category: { _id: "65b68718458b73c4060770b9" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({
      category: { _id: "65b68718458b73c4060770b9" }
    }).countDocuments()
    if (productData == 0) {
      res.render("nodata")
    } else
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
      category: { _id: "65b686ef458b73c4060770b1" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({
      category: { _id: "65b686ef458b73c4060770b1" }
    }).countDocuments()
    if (productData == 0) {
      res.render("nodatahome")
    } else
      res.render("home", {
        product: productData,
        totalpages: Math.ceil(count / limit),
        currentpages: page,
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
      category: { _id: "65b68708458b73c4060770b5" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({
      category: { _id: "65b68708458b73c4060770b5" }
    }).countDocuments()
    if (productData == 0) {
      res.render("nodatahome")
    } else
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
      category: { _id: "65b68718458b73c4060770b9" }
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({
      category: { _id: "65b68718458b73c4060770b9" }
    }).countDocuments()
    if (productData == 0) {
      res.render("nodatahome")
    } else
      res.render("home", {
        product: productData,
        totalpages: Math.ceil(count / limit),
        currentpages: page,
      })
  } catch (error) {

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
      productprice: { $gt: 65000 }
    }).limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await product.find({}).countDocuments()
    res.render("homelogin", {
      product: products,
      totalpages: Math.ceil(count / limit),
      currentpages: page
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

    const limit = 4;
    const products = await product.find({
      productprice: { $lt: 50000 }
    }).limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const count = await product.find({}).countDocuments()

    res.render("homelogin", {
      product: products,
      totalpages: Math.ceil(count / limit),
      currentpages: page
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

    const productdata = await product.findById({ _id: id })

    if (productdata) {
      res.render("wishlist", { product: productdata, user: UserData })
    }



  } catch (error) {
    console.log(error.message)

  }
}

const cartpage = async (req, res) => {
  try {
    const productid = req.query.id;
    const userid = req.session.user_id;
    const items = { product_id: productid }
    const userone = await User.findOne({ _id: userid });
    const exisitingid = userone.cart.items.findIndex(item => item.product_id == productid);
    if (exisitingid !== -1) {
      userone.cart.items[exisitingid].qty = userone.cart.items[exisitingid].qty + 1
    } else {
      const productref = await product.findById([{ _id: productid }]);
      const productobject = {
        product_id: productref._id,
        qty: 1,
        price: productref.productprice,
        totalPrice:productref.productprice
      }
      userone.cart.items.push(productobject) 
    }
    await userone.save()

    res.render("cartalert")

  }
  catch (error) {
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
  
      const sumvalue= user?.cart?.items.findIndex(item=> item.price)
           const checkone=  user?.cart?.items[sumvalue]?.price;
           console.log(checkone,"some");
    const quantity = user?.cart?.items.reduce((accu, curr) => { 
      return accu + curr.qty
    }, 0)
    if (user && user.cart) {
      console.log(user.cart.items);
      return res.render("cartpage", { cart: productdetail?.cart?.items, userCart: user.cart.items, totalPrice: value, qty: quantity, total: checkone});
    } else {
      console.error("User or user's cart is null or undefined.");
      // Handle the case where user or user's cart is null or undefined
      return res.render("cartpage", { cart: [], userCart: {} }); // Provide default values or handle as appropriate
    }
  } catch (error) {
    console.error("Error in getProduct:", error);
    // Handle the error appropriately, e.g., send an error response
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
    const cartdata=user.cart.items
  
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
        _id:item.product_id
      },{$inc:{productquantity:-item.qty}})
    }


    for (let item of cartitems) {
      const product = {
        product_id: item.product_id,
        qty: item.qty,
        price: item.price,
        totalPrice: item.totalPrice,
        status: item.status,
      }
      neworder.products.push(product)
    }
    await neworder.save();
   const data=   await User.findByIdAndUpdate({_id:userid},{$set:{"cart.items":[]}})

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
      },
      { new: true, runValidators: true }
    );

    console.log("Checkout data added");
    res.redirect("/aboutus");
  } catch (error) {
    console.error(error.message);
    const userid = req.session.user_id;

    const userdetails = await User.findById({ _id: userid });

    const message = Object.values(error.errors).map(err => err.message);

    return res.render('addAddress', { message, user: userdetails });

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
     const valueup=parseInt(req.body.quantity);
     const productvalue=req.body.quantity;
     const myproduct =await product.findById({_id:productdata})
    if ( productvalue > myproduct.productquantity ){ 
      return res.status(200).json({ status: "outofstock" })
     }
    
    //  const productqty = await product.findByIdAndUpdate({_id:productdata}, {$inc: {productquantity: -1}});
    const userid = req.session.user_id; 
    const userproduct = await User.findOne({ "cart.items._id": product_id });
    const exisitingid = userproduct.cart.items.findIndex(item => item._id == product_id)
    
    const passproductdetails = userproduct.cart.items[exisitingid];
    const Totalprice = passproductdetails.totalPrice  //total price of object 1
    const productPrice = passproductdetails.price;    //actualprice of object 1
    const productQty =  passproductdetails.qty+1;
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
    await User.findByIdAndUpdate(user._id, { $set: { "cart.items": cartItems } },{ new: true, runValidators: true })
    res.status(200).json({ status: "updated",totalprice})
  } catch (error) {
    console.log(error.message) 
  }
}



const quatitydown = async (req, res) => {
  try {
    const productdata = req.params._id;
    const minvalue= req.body.quantity;
    const currentqty =await product.findByIdAndUpdate({_id:productdata});
   if(minvalue<1){
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
    const productdataid= req.query.deleteproductid

    const myorder = await order.findById({ _id: orderid }).populate("products.$.product_id");
    const cancelproduct = myorder.products.find(product => product._id.toString() === deleteid)
    cancelproduct.status = "canceled";
    const productid = myorder.products.find(product => product.product_id);
    const idproduct=productid.product_id;

    try { 
      await myorder.save();
      const productdata =  myorder.products
      for(let item of  productdata ){ 
        if(item.product_id==productdataid){
        await products.findByIdAndUpdate({_id:item.product_id},{$inc:{productquantity:item.qty}})
        }
      }
      console.log('User saved successfully');
    } catch (error) {
      console.error('Error saving user:', error);
      // Handle the error or return an appropriate response
      return res.status(500).send('Error saving user');
    }

    res.redirect("/aboutus");

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
    var emailcheck= pattern.test(email);
    if(!emailcheck){
      const userdetails = await User.findById({ _id: userid });
      return  res.render("editSignup",{message:"Invalid email format", user: userdetails})
    }
    const updateprofile = await User.findByIdAndUpdate({ _id: userid }, { $set: { username: username, email: email, number: number,images:images} }, { new: true, runValidators: true });
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

                   const   detailpage =async (req,res)=>{
                    try {
                      const orderid= req.query.orderid;
                      const productid=req.query.productid;  
                     const orderdeatil= await  order.findById({_id:orderid}).populate("products.product_id");      
                     const currentindex =orderdeatil.products.findIndex(item=>item._id.toString()==productid )
                      console.log(currentindex ,"llll");
                      const value =orderdeatil.products[currentindex];
                    res.render("orderdetail",{order:value})    
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
  detailpage
}

