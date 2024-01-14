

  const User=require("../model/user")
  const category=require("../model/category")

  const bcrypt=require("bcrypt");

  const loadAdminLogin= async (req,res)=>{
    try {

        res.render("adminLogin")
        
    } catch (error) {
        console.log(error.message)

        
    }
  }

      const verifyLogin=async(req,res)=>{
        try {

          const email=req.body.email;
          const password=req.body.password;


          const UserData= await User.findOne({email:email});

          if(UserData){
            const passwordMatch=await bcrypt.compare(password,UserData.password);
            if(passwordMatch){
              if(UserData.is_admin===0){
                res.render("adminLogin",{message:"Email and password is in correct"})
              }else{
                req.session.user_id=UserData._id ;

                res.redirect("/admin/home")
              }

            }else{
              res.render("adminLogin",{message:"Email and password is in correct"})
            }


          }else{
            res.render("adminLogin",{message:"Email and password is in correct"})
          }




          
        } catch (error) {
          console.log(error.message)
          
        }
      } 
       
       const LoadDashboard=async (req,res)=>{
        try {
        const UserData=await User.findById({_id:req.session.user_id})
          res.render("admindashboard")
          
        } catch (error) {
          console.log(error.message)
          
        }
       }
 
        const adminLogout=async(req,res)=>{
          try {

            req.session.destroy()
            res.redirect("/admin")

            
          } catch (error) {
            console.log(error.message)
           
          }
        }

         const adminDashboard=async(req,res)=>{
          try {

           const usersData= await User.find({is_admin:0})
            res.render("userDashboard",{users:usersData})
            
          } catch (error) {
            console.log(error.message)
            
          }
         }

         const editUserLoad= async(req,res)=>{
          try {
            const id=req.query.id;
            const userData = await User.findById({_id:id})
            if(userData){
              res.render("edit-user",{user:userData})
            }else{
              res.redirect("/admin/dashboard")
            }
           
            
          } catch (error) {
            console.log(error.message)
            
          }
         }

         const updateUser=async(req,res)=>{
          try {

             const userData =await User.findByIdAndUpdate({_id:req.body.id},{$set:{is_Blocked:req.body.Blocked}})
             res.redirect("/admin/dashboard")
          } catch (error) {
            console.log(error.message)

            
          }
         }

           const deleteUser=async(req,res)=>{
            try {

              const id=req.query.id;
              await User.deleteOne({_id:id})
              res.redirect("/admin/dashboard")
            } catch (error) {
              console.log(error.message)
              
            }
           }

       const deleteCategory =async(req,res)=>{
                 try {
                  const id=req.query.id;
                  await  category.deleteOne({_id:id})
                  res.redirect("/admin/categoryproduct")
                  
                 } catch (error) {
                  console.log(error.message)
                  
                 }
       }

             const   editCategory=async(req,res)=>{
                      try {

                        const id=req.query.id;
                        const categoryData = await category.findById({_id:id})
                       if(categoryData){
                      res.render("edit-category",{category:categoryData})
                     }else{
                       res.redirect("/admin/categoryproduct")
                        }
           
                        
                      } catch (error) {
                        console.log(error.message)

                        
                      }
             }
                         const updateCategory =async(req,res)=>{
                          try {
                            const id=req.query.id;
                            const cayegoryData =await category.findByIdAndUpdate({_id:id},{$set:{name:req.body.name,description:req.body.description}})
                            res.redirect("/admin/categoryproduct")
                            
                          } catch (error) {
                            console.log(error.message)
                            
                          }
                         }


    module.exports={
        loadAdminLogin,
        verifyLogin,
        LoadDashboard,
        adminLogout,
        adminDashboard,
        editUserLoad,
        updateUser,
        deleteUser,
        deleteCategory,
        editCategory,
        updateCategory
    }