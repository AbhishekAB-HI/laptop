
const catagory = require("../model/products");
const categoryproduct = require("../model/category")

const Category = async (req, res) => {
  try {
    res.render("AddNewCata")
  } catch (error) {
    if (error.errors) {
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('AddNewCata', { message }); 
    }
    console.log(error.message)
  }
}

const addCategory = async (req, res) => {
  try {
    const exist = await categoryproduct.findOne({ name: req.body.name });
    if (exist) {
      return res.render("AddNewCata", { message: "This name is already exist" })
    }
    const productpart = new categoryproduct({
      name: req.body.name,
      description: req.body.description
    })
    const products = await productpart.save();
    res.redirect("/admin/categoryproduct")
  } catch (error) {
    if (error.errors) {
      const message = Object.values(error.errors).map(err => err.message);
      return res.render('AddNewCata', { message }); // Pass errors to the view
    }
    console.log(error.message);
  }
}

const Categoryproduct = async (req, res) => {
  try {
    
    const cataproduct = await categoryproduct.find()
    res.render("categoryList", { category: cataproduct })
  } catch (error) {
    console.log(error.message)
  }
}

const editCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await categoryproduct.findById({ _id: id });
    console.log(categoryData,"lololol");
    const exist = await categoryproduct.findOne({ name: req.body.name });
    if (exist) {
      return res.render("EditNewCata", { message: "This name is already exist",category:categoryData })
    }


    if (categoryData) {
      res.render("EditNewcata", { category: categoryData })
    } else {
      res.redirect("/admin/categoryproduct")
    }
  } catch (error) {
    console.log(error.message)
  }
}

const updateCategory = async (req, res) => {
  try {
    const id = req.body.id;
    console.log(id,'opopopo');
    const categoryData = await categoryproduct.findById({ _id: id });
    const exist = await categoryproduct.findOne({ name: req.body.name });
    // if (exist) {
    //   return res.render("EditNewCata", { message: "This name is already exist",category:categoryData })
    // }
    const cayegoryData = await categoryproduct.findByIdAndUpdate({ _id: id }, { $set: { name: req.body.name, description: req.body.description } }, { new: true, runValidators: true })
    console.log(cayegoryData,'popopo');
    res.redirect("/admin/categoryproduct")
  } catch (error) {
    console.log(error.message)
    if (error.errors) {
      const id = req.body.id;
      const message = Object.values(error.errors).map(err => err.message);
      const categoryData = await categoryproduct.findById({ _id: id })
      return res.render('EditNewCata', { message, category: categoryData }); // Pass errors to the view
    }
    
  }
}


module.exports = {
  Category,
  addCategory,
  Categoryproduct,
  editCategory,
  updateCategory
}