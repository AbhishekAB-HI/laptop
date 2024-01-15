
require('dotenv').config(); 
 const mongoose=require("mongoose");
 mongoose.connect(process.env.MONGO_URI);

const express=require("express"); 
const app=express();
const port =process.env.PORT||7000;
  
  

  
 
    

 

// user route require
const userRoute=require("./Routes/userRoute")
app.use("/",userRoute)
// admin route require
const admin_route=require("./Routes/adminRoute")
app.use("/admin",admin_route);



 


const path = require('path');
app.use("/static",express.static(path.join(__dirname,"public")))

app.use(express.static(__dirname+'/public'));

 

app.listen(port,()=>{
    console.log("server is running")
})






