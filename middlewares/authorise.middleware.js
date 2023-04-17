
const authorise = (permittedRole) => {
    return (req,res,next) => {
        let user_role = req.role;
        if(permittedRole.contains(user_role)){
            next();
        } else {
            res.status(400).send({msg: "Unauthorised access"});
        }
    }
}

module.exports = { authorise };