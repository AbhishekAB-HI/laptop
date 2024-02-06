
const products = require("../model/products");
const category = require("../model/category")

const loadProduct = async (req, res) => {
  try {
    // res.render("productadd")
    res.render("productsidepage")
  } catch (error) {
    console.log(error.message)
  }
}

const insertProduct = async (req, res) => {
  const images = req.files.map(file => file.filename)
  try {
    const product = new products({
      productname: req.body.productname,
      productprice: req.body.productprice,
      category: req.body.category,
      productsize: req.body.productsize,
      productquantity: req.body.productquantity,
      images: images
    })
    const productData = await product.save();
    if (productData) {
      res.render("productsidepage", { message: "Your product is successfuly added" })
    } else {
      res.render("productsidepage", { message: "Your product is not added" })
    }
  } catch (error) {
    if (error.errors) {
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('productsidepage', { message }); // Pass errors to the view
    }
  }

}

const ProductPage = async (req, res) => {
  try {
    var search = '';
    if (req.query.search) {
      search = req.query.search
    } 
    var page = 1;
    if (req.query.page) {
      page = req.query.page
    }
    const limit=4;
    const count = await products.find(
      { productname: { $regex: ".*" + search + ".*", $options: "i" } },
    ).populate("category").countDocuments()
    const productData = await products.find(
      { productname: { $regex: ".*" + search + ".*", $options: "i" } },
    ).populate("category").limit(limit * 1)
    .skip((page - 1) * limit)
    .exec()
    // res.render("productpage", { products: productData });
    res.render("productlistpage",{ products: productData ,   totalpages: Math.ceil(count / limit),
    currentpages: page,});
  } catch (error) {
    console.log(error.message)
  }
}

const editProduct = async (req, res) => {
  try { 
    const id = req.query.id; 
    const cataid = req.query.cataid;  
    const productData = await products.findById({ _id: id }).populate("category");
    console.log(productData,"lolo");
    if (productData) {
      res.render("productsidepageedit", { product: productData })
    } else {
      res.redirect("/admin/productpage")
    }
  } catch (error) {
    if (error.errors) {
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('productsidepageedit', { message }); // Pass errors to the view
    }
  }
}

const updateProduct = async (req, res) => {
  try {
    const images = req.files.map(file => file.filename)
    console.log(images,"images");
    const productData = await products.findByIdAndUpdate({ _id: req.body.id },
      { $set: { productname: req.body.productname, productprice: req.body.productprice, productsize: req.body.productsize, category: req.body.category, productquantity: req.body.productquantity ,images:images } },
      { new: true, runValidators: true }).populate("category");
      console.log( productData ,"lllllll");
    res.redirect("/admin/productpage")

  } catch (error) {
    console.log(error);
    if (error.errors) {
      const message = Object.values(error.errors).map(err => err.message);
      const productData = await products.findById({ _id: req.body.id })
      return res.render('productsidepageedit', { message, product: productData }); // Pass errors to the view
    }
  }
}

const listProduct = async (req, res) => {
  try {
    id = req.query.id;
    const value = await products.findById({ _id: id })
    res.render("listproduct", { list: value })
  } catch (error) {
    console.log(error.message)
  }
}

const updatelistProduct = async (req, res) => {
  try {
    const id = req.query.id
    const value = await products.findByIdAndUpdate({ _id: id }, { is_list: req.body.list });
    console.log(value, ";;;;;;");
    res.redirect("/admin/productpage")
  } catch (error) {
    console.log(error.message)
  }
}


module.exports = {
  loadProduct,
  insertProduct,
  ProductPage,
  editProduct,
  updateProduct,
  listProduct,
  updatelistProduct
}




