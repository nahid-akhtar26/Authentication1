// find the token from the cookie and it will find the user id 
import jwt from 'jsonwebtoken';
import userModel from '../models/model.js';

const userAuth = async(req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        return res.status(401).json({success:false,message:"Unauthorized access"});
    }
    try{
       const tokenDecode =  jwt.verify(token,process.env.JWT_SECRET);
       if(tokenDecode.id){
        req.userId = tokenDecode.id;
       }else{
         return res.status(401).json({success:false,message:"Unauthorized access"});
       }
       next();  // next controller method will be execute.
    }catch(err){
        return res.status(500).json({success:false,message:"Internal server error"});  
    }
}
export default userAuth;