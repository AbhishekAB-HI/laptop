const User = require("../model/user");


const blockedUser = async (req, res, next) => {
    try {
        const UserData = await User.findById({ _id: req.session.user_id })
        if(UserData.is_Blocked==true){

            console.log("blocked done")
            req.session.destroy()

            res.redirect("/home")

        }
        next()



    } catch (error) {
        console.log(error.message)

    }
}

module.exports = blockedUser