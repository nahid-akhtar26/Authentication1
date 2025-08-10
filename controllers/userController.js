import userModel from "../models/model.js";    
export const getUserData = async (req,res)=>{
    try{
        const userId = req.userId;
          const user = await userModel.findById(userId);
          if(!user){
            return res.status(400).json({
                success:false,
                message:"user not found!"
            })
          }
          res.status(200).json({
            success:true,
            userData:{
                name:user.name,
                isAccountVerified:user.isVerified,
                email:user.email
            }
          })
    }catch(err){
        res.status(400).json({
            success:false,
            message:err.message
        })
    }
}