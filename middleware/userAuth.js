

 const isLogin=async(req,res,next)=>{

    try {

         if(req.session.user_id){
         }
         else{
             
            res.redirect('/login') 
         }
            
    } catch (error) {
        console.log(error.message)  
    }
    next()
 } 

 
 const isLogout=async(req,res,next)=>{

    try { 
 
        if(req.session.user_id){
            res.redirect("/dashboard")
        }
        next();
        
    } catch (error) {
        console.log(error.message) 
    }
 }


   
 

   module.exports={
    isLogin,
    isLogout
   }


