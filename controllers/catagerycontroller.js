
const catagory = require("../model/products");
const categoryproduct = require("../model/category")

const Category = async (req, res) => {
  try {

    res.render("addcategory")

  } catch (error) {
    if (error.errors) {
      const message = Object.values(error.errors).map(err => err.message);


      return res.render('addcategory', { message }); // Pass errors to the view
    }
    console.log(error.message)



  }
}
const addCategory = async (req, res) => {
  try {

    const exist = await categoryproduct.findOne({ name: req.body.name });

    if (exist) {
      return res.render("addcategory", { message: "This name is already exist" })
    }



    const productpart = new categoryproduct({
      name: req.body.name,
      description: req.body.description
    })
    const products = await productpart.save();



    console.log(products)

    res.redirect("/admin/categoryproduct")



  } catch (error) {
    if (error.errors) {


      const message = Object.values(error.errors).map(err => err.message);

      return res.render('addcategory', { message }); // Pass errors to the view
    }


    console.log(error.message);


  }
}

const Categoryproduct = async (req, res) => {
  try {

    const cataproduct = await categoryproduct.find()
    res.render("categoryproduct", { category: cataproduct })

  } catch (error) {
    console.log(error)
  }
}

const editCategory = async (req, res) => {
  try {



    const id = req.query.id;
    const categoryData = await categoryproduct.findById({ _id: id })

    if (categoryData) {
      res.render("edit-category", { category: categoryData })
    } else {
      res.redirect("/admin/categoryproduct")
    }
  } catch (error) {

    console.log(error.message)
  }
}

const updateCategory = async (req, res) => {
  try {
    const id = req.query.id;

    const exist = await categoryproduct.findOne({ name: req.body.name });

    if (exist) {
      return res.render("addcategory", { message: "This name is already exist" })
    }

    const cayegoryData = await categoryproduct.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, description: req.body.description } }, { new: true, runValidators: true })
    res.redirect("/admin/categoryproduct")

  } catch (error) {
    if (error.errors) {
      const id = req.query.id;
      const message = Object.values(error.errors).map(err => err.message);
      const categoryData = await categoryproduct.findById({ _id: id })
      return res.render('edit-category', { message, category: categoryData }); // Pass errors to the view
    }
    console.log(error.message)

  }
}







module.exports = {
  Category,
  addCategory,
  Categoryproduct,
  editCategory,
  updateCategory
}