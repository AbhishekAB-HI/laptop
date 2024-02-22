
const User = require("../model/user")
const category = require("../model/category")
const order = require("../model/orders")
const bcrypt = require("bcrypt");
const products = require("../model/products");
const coupon = require("../model/coupon");
const orders = require("../model/orders");

const loadAdminLogin = async (req, res) => {
  try {
    res.render("adminLogin")
  } catch (error) {
    console.log(error.message)
  }
}

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const UserData = await User.findOne({ email: email });
    if (UserData) {
      const passwordMatch = await bcrypt.compare(password, UserData.password);
      if (passwordMatch) {
        if (UserData.is_admin === 0) {
          res.render("adminLogin", { message: "Email and password is in correct" })
        } else {
          req.session.admin_id = UserData._id;
          res.redirect("/admin/home")
        }
      } else {
        res.render("adminLogin", { message: "Email and password is in correct" })
      }
    } else {
      res.render("adminLogin", { message: "Email and password is in correct" })
    }
  } catch (error) {
    console.log(error.message)
  }
}

const LoadDashboard = async (req, res) => {
  try {
    const UserData = await User.findById({ _id: req.session.admin_id })
    res.render("adminHome")
  } catch (error) {
    console.log(error.message)
  }
}


const adminLogout = async (req, res) => {
  try {
    req.session.destroy()
    res.redirect("/admin")
  } catch (error) {
    console.log(error.message)
  }
}


const adminDashboard = async (req, res) => {
  try {
    const usersData = await User.find({ is_admin: 0 })
    res.render("userManager", { users: usersData })
  } catch (error) {
    console.log(error.message)
  }
}


const editUserLoad = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id })
    if (userData) {
      res.render("edit-user", { user: userData })
    } else {
      res.redirect("/admin/dashboard")
    }
  } catch (error) {
    console.log(error.message)
  }
}



const updateUser = async (req, res) => {
  try {
    const userData = await User.findByIdAndUpdate({ _id: req.body.id }, { $set: { is_Blocked: req.body.Blocked } })
    res.redirect("/admin/dashboard")
  } catch (error) {
    console.log(error.message)
  }
}




const deleteUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.deleteOne({ _id: id })
    res.redirect("/admin/dashboard")
  } catch (error) {
    console.log(error.message)
  }
}



const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    await category.deleteOne({ _id: id })
    res.redirect("/admin/categoryproduct")
  } catch (error) {
    console.log(error.message)
  }
}



const Orderdetails = async (req, res) => {
  try {

    var page = 1;
    if (req.query.page) {
      var page = req.query.page
    }
    const limit = 5;
    const orderdetail = await order.find({}).sort({ _id: -1 }).populate('products.product_id').limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await order.find({}).sort({ createdAt: -1 }).populate('products.product_id').countDocuments()
    res.render("orderDetails", {
      userCart: orderdetail, totalpages: Math.ceil(count / limit),
      currentpages: page
    })
  } catch (error) {
    console.log(error.message)
  }
}




const Orderstatus = async (req, res) => {
  try {
    const productid = req.query.id;
    console.log(productid, "ewcwc");
    const orderid = req.query.orderid;
    console.log(orderid, "iiimm");
    const user = await order.findById({ _id: orderid }).populate("products.product_id")
    const value = user.products.find(index => index._id.toString() == productid)
    value.status = "canceled";
    await user.save()
    res.redirect("/admin/orderlist")
  } catch (error) {
    console.log(error.message)
  }
}



const Orderconfirmed = async (req, res) => {
  try {
    const productid = req.query.id;
    console.log(productid, "ewcwc");
    const orderid = req.query.orderid;
    console.log(orderid, "iiimm");
    const user = await order.findById({ _id: orderid }).populate("products.product_id")
    const value = user.products.find(index => index._id.toString() == productid)
    value.status = "confirmed";
    await user.save()
    res.redirect("/admin/orderlist")
  } catch (error) {
    console.log(error.message)
  }
}



const deliveryconfirmed = async (req, res) => {
  try {
    const productid = req.query.id;
    console.log(productid, "ewcwc");
    const orderid = req.query.orderid;
    console.log(orderid, "iiimm");
    const user = await order.findById({ _id: orderid }).populate("products.product_id")
    const value = user.products.find(index => index._id.toString() == productid)
    value.status = "out for deliver";
    await user.save()
    res.redirect("/admin/orderlist")
  } catch (error) {
    console.log(error.message)
  }
}



const returnedconfirmed = async (req, res) => {
  try {
    const orderid = req.query.id;
    console.log(orderid,"orderid");
    const userid = req.session.user_id;
    const productid = req.query.orderid;
    const orderd = await order.findById({ _id: productid }).populate("products.product_id")
    const value = orderd.products.find(index => index._id.toString() == orderid)
    console.log(value,"geted");
    const  returnsuccess=  value.status = "returnApproved";
    const orderId = await order.findById({ _id: productid });
    console.log(orderId,"orderid");
    const totalPriceSum = orderId.products.reduce((accu, curr) => {
      return accu + curr.totalPrice;
    }, 0);
    console.log(totalPriceSum,"total");
  const uservalues =  await User.findByIdAndUpdate(
      { _id: userid },
      {
        $push: {
          walletHistory: {
            amount: totalPriceSum,
            direction: "in" // Provide the appropriate direction value
          }
        }
      }
    )
    console.log(uservalues,"popopo");
    const walletAmount = await User.findById({ _id: userid }).select("walletHistory");
    const totalPrice = walletAmount.walletHistory.reduce((accu, curr) => {
      return accu + curr.amount
    }, 0)
    const walletPrice = await User.findByIdAndUpdate({ _id: userid }, { $set: { wallet: totalPrice } })
    await orderd.save()
    res.redirect("/admin/orderlist")
  } catch (error) {
    console.log(error.message)
  }
}



const deliveredconfirmed = async (req, res) => {
  try {
    const orderid = req.query.orderid;
    const productid = req.query.productid
    const orderdetail = await order.findById({ _id: orderid });
    const orderd = orderdetail.products.find(index => index._id.toString() == productid)
    orderd.status = "delivered";
    await orderdetail.save()
    res.redirect("/admin/orderlist")
  } catch (error) {
    console.log(error.message)
  }
}



const shippedconfirmed = async (req, res) => {
  try {
    const orderid = req.query.orderid;
    const productid = req.query.productid
    const orderdetail = await order.findById({ _id: orderid });
    const orderd = orderdetail.products.find(index => index._id.toString() == productid)
    orderd.status = "shipped";
    await orderdetail.save()
    res.redirect("/admin/orderlist")
  } catch (error) {
    console.log(error.message)
  }
}


const deleteImage = async (req, res) => {
  try {
    const imageindex = req.query.imageindex;
    const deleteimageid = req.query.id;
    const deleteimage = await products.findById({ _id: deleteimageid })
    const dataid = deleteimage.images.find((value, index) => index == imageindex)
    await products.updateOne(
      { _id: deleteimageid },
      { $pull: { images: dataid } })

    const productData = await products.findById({ _id: deleteimageid }).populate("category")
    res.render("productsidepageedit", { product: productData })
  } catch (error) {
    console.log(error.message)
  }
}


const gameSearch = async (req, res) => {

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
    const productData = await products.find({
      category: { _id: "65b686ef458b73c4060770b1" }
    }).populate("category")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const count = await products.find({
      category: { _id: "65b686ef458b73c4060770b1" }
    }).countDocuments()
    res.render("productlistpage", {
      products: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,
    })
  } catch (error) {
    console.log(error.message)
  }
}



const officeSearch = async (req, res) => {

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
    const productData = await products.find({
      category: { _id: "65b68708458b73c4060770b5" }
    }).populate("category")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await products.find({
      category: { _id: "65b68708458b73c4060770b5" }
    }).countDocuments()
    res.render("productlistpage", {
      products: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,
    })
  } catch (error) {
    console.log(error.message)
  }
}






const tabletSearch = async (req, res) => {

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
    const productData = await products.find({
      category: { _id: "65b68718458b73c4060770b9" }
    }).populate("category")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await products.find({
      category: { _id: "65b68718458b73c4060770b9" }
    }).countDocuments()
    res.render("productlistpage", {
      products: productData,
      totalpages: Math.ceil(count / limit),
      currentpages: page,
    })
  } catch (error) {
    console.log(error.message)
  }
}

const Addcoupon = async (req, res) => {
  try {

    res.render("addCoupon")

  } catch (error) {
    console.log(error.message)
  }
}

const UpdateAddcoupon = async (req, res) => {
  try {

    const couponcode = new coupon({
      couponcode: req.body.couponcode,
      percentage: req.body.percentage,
      usagelimit: req.body.usagelimit,
      minamount: req.body.minamount,
      maxamount: req.body.maxamount
    })

    await couponcode.save();

    res.redirect("/admin/listCoupon")


  } catch (error) {
    if (error.errors) {
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('addCoupon', { message }); // Pass errors to the view
    }
    console.log(error.message)
  }
}

const ListCoupon = async (req, res) => {
  try {

    const couponcode = await coupon.find()

    res.render("couponListpage", { couponcode: couponcode })

  } catch (error) {
    console.log(error.message)
  }
}

const deleteCoupon = async (req, res) => {
  try {
    const deletecouponid = req.query.id;
    await coupon.findByIdAndDelete({ _id: deletecouponid })
    res.redirect("/admin/listCoupon")
  } catch (error) {
    console.log(error.message)
  }
}


  const Salesreport =async (req,res)=>{
    try {

      res.render("salesPage")
      
    } catch (error) {
      console.log(error.message)
    }
  }


    const adminMonthReport = async(req,res)=>{

      console.log("iiiiiiiiiiiiiiiiiiiiiiiii");
 
      try {
        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
         const ord = await orders.find().select("products")
         console.log(ord,"opopopopopopop");


         const values=ord.filter((datas)=>datas.products.filter((dd)=> dd.status == 'delivered'))
         console.log(values,"deliverdddddddddddddd");
      
        // console.log(salesRep);
        // const newSalesreport = salesRep.map((el) => {
        //   let newEl = { ...el };
        //   newEl._id.month = months[newEl._id.month - 1];
        //   return newEl;
        // });
        // console.log(newSalesreport)
        // console.log(newSalesreport);
        // res.render("/admin/monthReport", { admin:true,
        //   salesReport: newSalesreport,
        // });
      } catch(error){
        res.render("admin/adminError",{admin:true})
      }
    }
  


module.exports = {
  loadAdminLogin,
  verifyLogin,
  LoadDashboard,
  adminLogout,
  adminDashboard,
  editUserLoad,
  updateUser,
  deleteUser,
  deleteCategory,
  Orderconfirmed,
  deliveryconfirmed,
  returnedconfirmed,
  deliveredconfirmed,
  Orderdetails,
  Orderstatus,
  shippedconfirmed,
  deleteImage,
  gameSearch,
  officeSearch,
  tabletSearch,
  Addcoupon,
  UpdateAddcoupon,
  ListCoupon,
  deleteCoupon,
  Salesreport,
  adminMonthReport
}