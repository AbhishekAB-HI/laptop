
const User = require("../model/user")
const category = require("../model/category")
const order = require("../model/orders")
const bcrypt = require("bcrypt");
const products = require("../model/products");
const coupon = require("../model/coupon");
const orders = require("../model/orders");
const offer = require("../model/offer")

const banner = require("../model/banner")

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



const filterWeekly = async (req, res) => {
  try {

    const revenue = await order.aggregate([
      {
        $group: {
          _id: null,
          revenue: { $sum: "$subtotal" }
        }
      }
    ]);
    const onlinePay = await order.countDocuments({ 'products.paymentMethod': "onlinePay" });
    const cashondelivery = await order.countDocuments({ 'products.paymentMethod': "cash on delivery" });
    const Wallet = await order.countDocuments({ 'products.paymentMethod': "Wallet" });

    // top selling products------------------------------------------------------------------

    let Productsids = [];
    const bestSellingProducts = await order.aggregate([
      { $match: { "products.status": "delivered" } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product_id',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    bestSellingProducts.forEach((n) => {
      Productsids.push(n._id);
    });
    const FindBestSellingProducts = await products.find({ _id: { $in: Productsids } }).populate('category')

    const BestSellingProductsCount = await products.find({ _id: { $in: Productsids } }).populate('category').countDocuments()



    // top selling products------------------------------------------------------------------

    // best selling caegory-----------------------
    const uniqueCategories = [];

    FindBestSellingProducts.forEach(product => {
      const categoryName = product.category.name.toString()

      // Assuming Cname is a property in pcategory
      if (!uniqueCategories.includes(categoryName) && uniqueCategories.length < 5) {
        uniqueCategories.push(categoryName);
      }
    });

    // Category count--------------------------------------------------------------


    const cataSize = uniqueCategories.length


    // best selling brand-----------------------
    const brandNamearray = [];

    FindBestSellingProducts.forEach(product => {
      const brandName = product.productname.toString()

      // Assuming Cname is a property in pcategory
      if (!brandNamearray.includes(brandName) && brandNamearray.length < 5) {
        brandNamearray.push(brandName);
      }
    });

    console.log(brandNamearray, 'brandname');

    const brandCount = brandNamearray.length

    //  ledger book details-----------------------------------------------------

    const orderDetails = await order.find({})


    const totalorders = await order.countDocuments();
    const totalproducts = await products.countDocuments()

    // finding according to weekly base-------------------------------------------------------------

    // weekly revenue and orders-------------------------------------------------------------------------

    const currentWeek = new Date();
    currentWeek.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay()); // Start of the week (Sunday)
    const endOfWeek = new Date(currentWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)

    const weeklyRevenue = await order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfWeek,
            $lt: endOfWeek
          },
        }
      },
      {
        $group: {
          _id: { $week: "$createdAt" },
          weeklyRevenue: { $sum: "$subtotal" }
        }
      }
    ]);

    const weeklyGraphValue = Array(52).fill(0);

    weeklyRevenue.forEach(entry => {
      const weekIndex = entry._id - 1;
      weeklyGraphValue[weekIndex] = entry.weeklyRevenue;
    });

    

    // weekly revenue and orders-------------------------------------------------------------------------


  console.log(weeklyGraphValue,"weekly");





    res.render('weeklychart', { revenue, onlinePay, cashondelivery, Wallet, FindBestSellingProducts, uniqueCategories, cataSize, brandNamearray, brandCount, orderDetails, totalproducts, totalorders, BestSellingProductsCount,weeklyGraphValue });



  } catch (error) {
    console.log(error.message)
  }
}









const LoadDashboard = async (req, res) => {
  try {

    

    // finding total orders and products--------------------------------------------------------

    const totalorders = await order.countDocuments();
    const totalproducts = await products.countDocuments()

    // finding total orders and products--------------------------------------------------------

    // calculating the total revenue---------------------------------------------------------

    const revenue = await order.aggregate([

      {
        $group: {
          _id: null,
          revenue: { $sum: "$subtotal" }
        }
      }
    ]);


    // calculating the total revenue---------------------------------------------------------


    // monthly renevue-------------------------------------------------------------------------

    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 10, 0);

    console.log(startOfMonth,"start");
    console.log(endOfMonth,"end");


    const monthlyrevenue = await order.aggregate([

      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth
          },
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          monthlyrevenue: { $sum: "$subtotal" }

        }
      }
    ])

  // weekly chart-------------------------------------------------------------------------------------------

const currentDate = new Date();
const startOfWeek = new Date(currentDate);
startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the current week

const endOfWeek = new Date(currentDate);
endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 6); // End of the current week

console.log(startOfWeek, "startOfWeek");
console.log(endOfWeek, "endOfWeek");

// const weeklyRevenue = await order.aggregate([
//   {
//     $match: {
//       createdAt: {
//         $gte: startOfWeek,
//         $lte: endOfWeek,
//       },
//     },
//   },
//   {
//     $group: {
//       _id: { $week: "$createdAt" },
//       weeklyRevenue: { $sum: "$subtotal" },
//     },
//   },
// ]);


    // weekly chart-------------------------------------------------------------------------------------------
    const graphValue = Array(12).fill(0);

    monthlyrevenue.forEach(entry => {
      const monthIndex = entry._id - 1;
      graphValue[monthIndex] = entry.monthlyrevenue;
    });


    const monthlyOrder = await order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },

          monthlyOrder: { $sum: 1 }
        }
      }
    ]);




    // monthly renevue-------------------------------------------------------------------------



    //  payment methods----------------------------------------------------------------

    const onlinePay = await order.countDocuments({ 'products.paymentMethod': "onlinePay" });
    const cashondelivery = await order.countDocuments({ 'products.paymentMethod': "cash on delivery" });
    const Wallet = await order.countDocuments({ 'products.paymentMethod': "Wallet" });


    //  payment methods----------------------------------------------------------------

    // Yearly revenue----------------------------------------------------------------------

    const currentYear = new Date().getFullYear();
    console.log(currentYear,"current year");

    const startOfYear = new Date(currentYear, 0, 1);

    console.log(startOfYear,"statt yeaee");
    const endOfYear = new Date(currentYear, 11, 31);

    console.log(endOfYear,"end yeaeerr");

    const Yearlyrevenue = await order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfYear,
            $lt: endOfYear
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          yearrevenue: { $sum: "$subtotal" }
        }
      }
    ]);



     var yearArray=[]

    const yearlyTotal = Yearlyrevenue.length > 0 ? Yearlyrevenue[0].yearrevenue : 0;
    if(yearlyTotal){
      yearArray.push(0,0,0,0,yearlyTotal)
    }

    console.log(yearArray,'oooooooooooooooo');

    

    const YearlyValue = Array(1).fill(yearlyTotal);
    console.log("Yearly Values:", YearlyValue);

    // Yearly revenue----------------------------------------------------------------------

    // top selling products------------------------------------------------------------------

    let Productsids = [];
    const bestSellingProducts = await order.aggregate([
      { $match: { "products.status": "delivered" } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product_id',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    bestSellingProducts.forEach((n) => {
      Productsids.push(n._id);
    });
    const FindBestSellingProducts = await products.find({ _id: { $in: Productsids } }).populate('category')

    const BestSellingProductsCount = await products.find({ _id: { $in: Productsids } }).populate('category').countDocuments()



    // top selling products------------------------------------------------------------------

    // best selling caegory-----------------------
    const uniqueCategories = [];

    FindBestSellingProducts.forEach(product => {
      const categoryName = product.category.name.toString()

   
      if (!uniqueCategories.includes(categoryName) && uniqueCategories.length < 5) {
        uniqueCategories.push(categoryName);
      }
    });

     // best selling caegory-----------------------

    // Category count--------------------------------------------------------------


    const cataSize = uniqueCategories.length


    // best selling brand-----------------------
    const brandNamearray = [];

    FindBestSellingProducts.forEach(product => {
      const brandName = product.productname.toString()

      // Assuming Cname is a property in pcategory
      if (!brandNamearray.includes(brandName) && brandNamearray.length < 5) {
        brandNamearray.push(brandName);
      }
    });

    console.log(brandNamearray, 'brandname');

    const brandCount = brandNamearray.length

    //  ledger book details-----------------------------------------------------
    var page = 1;
    if (req.query.page) {
      var page = req.query.page
    }
    const limit = 5;

    const orderDetails = await order.find({}).limit(limit * 1)
    .skip((page - 1) * limit).sort({ _id: -1 })
    .exec()

    const count = await order.find({}).countDocuments()

    res.render('adminHome', { orderDetails ,totalpages: Math.ceil(count / limit)   ,currentpages: page,monthlyOrder, uniqueCategories, monthlyrevenue, yearArray,YearlyValue, revenue, totalproducts, totalorders, graphValue, onlinePay, cashondelivery, Wallet, FindBestSellingProducts, BestSellingProductsCount, cataSize, brandNamearray, brandCount });



  } catch (error) {
    console.log(error.message)
  }
}


const addBanners = async (req, res) => {
  try {

    res.render("addBanner")

  } catch (error) {

    console.log(error.message)
  }
}

const sharp = require("sharp")

const uploadaddBanners = async (req, res) => {
  try {
    const filenames = [];
    console.log(req.files, "filessssssssssssssssssssss");

    for (let item of req.files) {
      const pathdata = Date.now() + '-' + item.originalname;
      const imagePath = path.join(
        __dirname,
        '../public/productImages',
        `${pathdata}`
      );

      const fileBuffer = await fs.promises.readFile(item.path);

      await sharp(fileBuffer)
        .resize(1200, 1000, { fit: 'fill' })
        .toFile(imagePath);

      filenames.push(pathdata);
    }

    console.log(req.body, "bannerssssssssss");

    const { bannername, bannertitle, description, images } = req.body;

    const bannervalue = new banner({
      bannername,
      bannertitle,
      description,
      images: filenames
    });

    await bannervalue.save();

    res.redirect("/admin/listbanner")


  } catch (error) {
    if (error.errors) {
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('addBanner', { message }); // Pass errors to the view
    }
  }
};

const listBanners = async (req, res) => {
  try {

    const baners = await banner.find()
    res.render("bannerList", { baners })

  } catch (error) {
    console.error(error.message);
  }
}

const editBanners = async (req, res) => {
  try {

    const editId = req.query.id;
    const bannervalue = await banner.findById({ _id: editId })
    res.render("editBanner", { bannervalue })
  } catch (error) {

    console.error(error.message);
  }
}

//   const filenames = [];
//   const files= req.files
//   console.log(files,'filess...');

// const existingData=await  banner.findById( req.body.id)

// const img = [
//   files?.[0]?.filename || existingData.images[0],
//   files?.[1]?.filename || existingData.images[1],

// ].filter(img => img !== undefined);

// for (let item of req.files) {
//   const pathdata = Date.now() + '-' + item.originalname;
//   const imagePath = path.join(
//     __dirname,
//     '../public/productImages',
//     `${pathdata}`
//   );

//   // Read the file buffer using fs.promises.readFile
//   const fileBuffer = await fs.readFile(item.path);

//   await sharp(fileBuffer)
//     .resize(1200, 1000, { fit: 'fill' })
//     .toFile(imagePath);

//   filenames.push(pathdata);
// }













const updateBanners = async (req, res) => {
  try {
    const editId = req.body.id;
    const existingData = await banner.findById({ _id: editId });
    const filenames = [];

    for (let item of req.files) {
      const pathdata = Date.now() + '-' + item.originalname;
      const imagePath = path.join(
        __dirname,
        '../public/productImages',
        `${pathdata}`
      );

      const fileBuffer = await fs.promises.readFile(item.path);

      await sharp(fileBuffer)
        .resize(1200, 1000, { fit: 'fill' })
        .toFile(imagePath, (err) => {
          if (err) {
            console.error('Sharp Error:', err);
          }
        });

      filenames.push(pathdata);
    }

    const updatedBanner = await banner.findByIdAndUpdate(
      { _id: editId },
      {
        $set: {
          bannername: req.body.bannername,
          bannertitle: req.body.bannertitle,
          description: req.body.description,
          images: filenames,
        },
      }, { new: true, runValidators: true }
    );

    res.redirect('/admin/listbanner');
  } catch (error) {
    console.error(error.message);
    if (error.errors) {
      const editId = req.body.id;
      const bannervalue = await banner.findById({ _id: editId });
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('editBanner', { message, bannervalue }); // Pass errors to the view
    }
  }
};



const deleteBanners = async (req, res) => {
  try {

    const deleteID = req.query.id;
    console.log(deleteID, 'doloooo');
    await banner.findByIdAndDelete({ _id: deleteID })
    res.redirect("/admin/listbanner")

  } catch (error) {
    console.error(error.message);
  }
}






const monthly = async (req, res) => {
  try {

    // calculating the total revenue---------------------------------------------------------
    const currentMonth = new Date();
    const startOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), currentMonth.getDate() - currentMonth.getDay());
    const endOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), currentMonth.getDate() - currentMonth.getDay() + 6);

    const weeklyrevenue = await order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfWeek,
            $lt: endOfWeek,
          },
        },
      },
      {
        $group: {
          _id: { $week: "$createdAt" },
          weeklyrevenue: { $sum: "$subtotal" },
        },
      },
    ]);

    console.log(weeklyrevenue, 'year codeddeee');

    const weekly = Array(52).fill(0); // Assuming 52 weeks in a year

    weeklyrevenue.forEach(entry => {
      const weekIndex = entry._id - 1; // Assuming _id represents the week number
      weekly[weekIndex] = entry.weeklyrevenue;
    });

    console.log(weekly, 'weekly revenue array');


    res.json({ weekly })


    // res.render('adminHome', { monthlyOrder, monthlyrevenue, revenue, totalproducts, totalorders, graphValue, onlinePay, cashondelivery, Wallet });



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
    const userDatas = await order.find({}).populate('user')
    console.log(userDatas, "userdetails");
    const orderdetail = await order.find({}).sort({ _id: -1 }).populate('products.product_id').limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()
    const count = await order.find({}).sort({ createdAt: -1 }).populate('products.product_id').countDocuments()
    res.render("orderDetails", {
      userCart: orderdetail, totalpages: Math.ceil(count / limit),
      currentpages: page,
      userDatas
    })
  } catch (error) {
    console.log(error.message)
  }
}

const viewOrderdetails = async (req, res) => {
  try {

    const orderid = req.query.orderid;
    const orderstatus = req.query.orderstatus;
    const productId = req.query.productId

    const orderData = await orders.findById({ _id: orderid }).populate("user");
    const orderDetails = await orders.findById({ _id: orderid }).populate("products");
    console.log(orderDetails, "orderdetailssssssssssssssssssss");
    const orderstatusdata = await orders.findById({ _id: orderid });
    const index = orderstatusdata.products.findIndex(item => item._id.toString() == orderstatus);
    const orderedData = orderDetails.products[index];
    const orderStatus = await orders.findById(orderid).populate('products.product_id');
    res.render("viewOrderDetails", { orderData, orderedData, orderStatus })

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
    value.status = "Payment Failed";
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
    value.status = "canceled";
    await user.save()
    res.redirect("/admin/orderlist")
  } catch (error) {
    console.log(error.message)
  }
}



const returnedconfirmed = async (req, res) => {
  try {
    const orderid = req.query.id;
    const productid = req.query.orderid;
    const orderd = await order.findById({ _id: productid }).populate("products.product_id")
    const value = orderd.products.find(index => index._id.toString() == orderid)
    console.log(value, "geted");
    const returnsuccess = value.status = "returnApproved";
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

const path = require("path")
const fs = require("fs");
const { log } = require("console");
const deleteImage = async (req, res) => {
  try {
    const imageindex = req.query.imageindex;
    const deleteimageid = req.query.id;
    const deleteimage = await products.findById({ _id: deleteimageid });
    const deletedImageData = deleteimage.images.splice(imageindex, 1)[0];


    const imagePathToDelete = path.join(__dirname, '../public/productImages', deletedImageData);
    await fs.promises.unlink(imagePathToDelete);

    await products.updateOne(
      { _id: deleteimageid },
      { $set: { images: deleteimage.images } }
    );

    const productData = await products.findById({ _id: deleteimageid }).populate("category");
    res.render("productsidepageedit", { product: productData });
  } catch (error) {
    console.log(error.message);
  }
};



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

const EditCoupon = async (req, res) => {
  try {

    const id = req.query.id
    const coupons = await coupon.findById({ _id: id })
    res.render("EditCoupon", { coupons })

  } catch (error) {
    console.log(error.message)
  }
}

const UpdateEditCoupon = async (req, res) => {
  try {
    const id = req.body.id;
    const { couponcode, percentage, date, usagelimit, minamount, maxamount } = req.body;
    await coupon.findByIdAndUpdate({ _id: id }, { couponcode: couponcode, percentage: percentage, date: date, usagelimit: usagelimit, minamount: minamount, maxamount: maxamount }, { new: true, runValidators: true })
    res.redirect("/admin/listCoupon")
  } catch (error) {
    if (error.errors) {
      const id = req.body.id;
      const coupons = await coupon.findByIdAndUpdate({ _id: id })
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('EditCoupon', { message, coupons }); // Pass errors to the view
    }
    console.log(error.message)
  }
}


const Salesreport = async (req, res) => {
  try {

    res.render("salesPage")

  } catch (error) {
    console.log(error.message)
  }
}


const adminMonthReport = async (req, res) => {
  try {

    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }

    const limit = 4;

    // console.log(datavalue,"datavalue");

    //     const orderss = await orders.find()

    //         for(const orderd of orderss){
    //             const allDelivered = orderd.products.every(item => item.status === 'delivered')
    //             if(allDelivered){
    //                 orderd.products.status = "Delivered"
    //                 await orders.save()
    //             }
    //         }








    const orderdetails = await orders.find({ "products.status": "delivered" }).populate("products.product_id")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const counts = await orders.find({ "products.status": "delivered" }).countDocuments();


    const totalPrices = orderdetails.reduce((accu, order) => {
      return accu + order.products.reduce((accuProduct, currProduct) => {
        return accuProduct + currProduct.totalPrice;
      }, 0);
    }, 0);

    const couponDiscounts = orderdetails.reduce((accu, order) => {
      return accu + order.products.reduce((accuProduct, currProduct) => {
        return accuProduct + currProduct.couponDiscount;
      }, 0);
    }, 0);


    console.log(totalPrices, "totalprice");



    res.render("YearPage", { orders: orderdetails, counts, totalPrices, couponDiscounts, totalpages: Math.ceil(counts / limit) })
  } catch (error) {
    res.render("admin/adminError", { admin: true })
  }
}

const updateMonthReport = async (req, res) => {
  try {
    const datefrom = req.body.dateFrom;
    const dateTo = req.body.dateTo;

    console.log(datefrom, "datefrom");
    console.log(dateTo, "dateTo");

    const startDateObj = new Date(datefrom);
    startDateObj.setHours(0, 0, 0, 0);
    const endDateObj = new Date(dateTo);
    endDateObj.setHours(23, 59, 59, 999);

    console.log(startDateObj, "start");
    console.log(endDateObj, "end");

    const filteredOrders = await orders.find({
      "products.status": "delivered",
      createdAt: {
        $gte: startDateObj,
        $lte: endDateObj
      }
    }).populate("products.product_id")

    console.log(filteredOrders);
    res.json({ success: true, data: filteredOrders });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};



const productOffer = async (req, res) => {
  try {

    res.render("offerPage")

  } catch (error) {
    console.log(error.message);
  }
}

const updateProductOffer = async (req, res) => {
  try {

    const offers = new offer({
      offername: req.body.offername,
      percentage: req.body.percentage,
      startdate: req.body.startdate,
      enddate: req.body.enddate
    })
    await offers.save();

    res.redirect("/admin/listoffer")


  } catch (error) {

    if (error.errors) {
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('offerPage', { message }); // Pass errors to the view
    }
    console.log(error.message);
  }
}

const listProductOffer = async (req, res) => {
  try {

    const offers = await offer.find()
    res.render("listOffers", { offers })

  } catch (error) {
    console.log(error.message);
  }
}

const deleteProductOffer = async (req, res) => {
  try {
    const deleteid = req.query.id;
    await offer.findByIdAndDelete({ _id: deleteid })
    res.redirect("/admin/listoffer")

  } catch (error) {
    console.log(error.message);
  }
}

const editProductOffer = async (req, res) => {
  try {
    const id = req.query.editId;
    const offers = await offer.findById({ _id: id })
    res.render("editOffer", { offers })
  } catch (error) {
    console.log(error.message);
  }
}

const updateEditProductOffer = async (req, res) => {
  try {

    const id = req.body.dataid;
    const { offername, percentage, startdate, enddate } = req.body
    const offers = await offer.findByIdAndUpdate({ _id: id }, { $set: { offername: offername, percentage: percentage, startdate: startdate, enddate: enddate } }, { new: true, runValidators: true })
    res.redirect("/admin/listoffer")

  } catch (error) {
    if (error.errors) {
      const id = req.body.dataid;
      const offers = await offer.findById({ _id: id })
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('editOffer', { message, offers }); // Pass errors to the view
    }
    console.log(error.message);
  }
}

const applyProductOffer = async (req, res) => {
  try {

    const productId = req.body.productID;
    const discount = req.body.discount;
    const productdetails = await products.findById({ _id: productId });
    console.log(productdetails, "ooooo");
    const productprice = productdetails.productprice;
    const Dicountamount = productprice * (discount / 100);
    console.log(productprice, "original price");
    console.log(Dicountamount, "discount price");
    const afterDicount = productprice - Dicountamount;
    console.log(afterDicount, "after-discount amount");
    await products.findByIdAndUpdate({ _id: productId }, { $set: { discountAmount: afterDicount, dicountPercentage: discount } });
    res.json({ status: true })

  } catch (error) {
    console.log(error.message);
  }
}

const removeProductOffer = async (req, res) => {
  try {

    const productID = req.body.productID;
    await products.findByIdAndUpdate({ _id: productID }, { $set: { discountAmount: null, dicountPercentage: null } })
    res.json({ status: true })

  } catch (error) {
    console.log(error.message);
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
  adminMonthReport,
  updateMonthReport,
  productOffer,
  updateProductOffer,
  listProductOffer,
  deleteProductOffer,
  editProductOffer,
  updateEditProductOffer,
  EditCoupon,
  UpdateEditCoupon,
  applyProductOffer,
  removeProductOffer,
  viewOrderdetails,
  monthly,
  addBanners,
  uploadaddBanners,
  listBanners,
  editBanners,
  deleteBanners,
  updateBanners,
  filterWeekly
}