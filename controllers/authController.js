import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/model.js';
import transporter from './../config/nodeMailer.js';
import {PASSWORD_RESET_TEMPLATE,EMAIL_VERIFY_TEMPLATE} from './../config/emailTemplate.js';
export const register = async (req,res)=>{
    const {name,email,password} = req.body;
    if(!name || !email || !password){
        return res.status(400).json({success:false,message:"All fields are required"});
    }
    try{
         const existedUser = await userModel.findOne({email});
         if(existedUser){
            return res.status(400).json({success:false,message:"user exist in database"});
         }
         const hashedPassword = await bcrypt.hash(password,10);
         const user = await userModel.create({name,email,password:hashedPassword});
         const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
         res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'production'?'none':'strict',
            maxAge: 7*24*60*60*1000 // 7 days in milliseconds
         })
         // SEND WELCOME EMAIL
          const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'WELCOME TO OUR APPLICATION',
            text: 'YOU HAVE SUCCESSFULLY REGISTERED',
          }
          await transporter.sendMail(mailOptions);
       
         res.status(201).json({success:true,message:"User registered Succesfully"});
    }catch(err){
        res.status(400).json({success:false,message:err.message})
    }
}

export const login = async (req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({success:false,message:"All fields are required"});
    }
    try{
          const user = await userModel.findOne({email});
          if(!user){
            res.status(400).json({success:false,message:"User not found"});
            return;
          }
          const isMatch = await bcrypt.compare(password,user.password);
          if(!isMatch){
            return res.status(400).json({success:false,message:"Invalid password"});
          }
          const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
          res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'production'?'none':'strict',
            maxAge: 7*24*60*60*1000 // 7 days in milliseconds
          })
          return res.status(200).json({success:true,message:"User logged in successfully"});
    }catch(err){
        res.status(400).json({success:false,message:err.message});
    }
}

export const logout = async (req,res)=>{
    try{
         res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV === 'production',
            sameSite:process.env.NODE_ENV === 'production'?'none':'strict'
         })
         return res.status(200).json({success:true,message:"User logged out successfully"})
    }catch(err){
        res.status(400).json({success:false,message:err.message});
    }
}

export const sendVerifyOtp = async (req,res)=>{
   try{
          const userId = req.userId;
          const user = await userModel.findById(userId);
          if(user.isVerified){
            return res.status(400).json({success:false,message:"user is already verified"});
          }
          const otp = String(Math.floor(Math.random() * 900000 + 100000)); // 6 digit OTP
          const expiresIn = Date.now() + 24*60*60*1000;  // 24 hours time extra
          user.verifyOtp = otp;
          user.verifyOtpExpires = expiresIn;
           await user.save();
           // SEND OTP EMAIL
           const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'VERIFY YOUR ACCOUNT',
            // text: `Your OTP IS ${otp}. It is valid for 24 hrs`
            html: EMAIL_VERIFY_TEMPLATE.replace('{{email}}',user.email).replace('{{otp}}',otp)
           }
           await transporter.sendMail(mailOptions);
           return res.status(200).json({success:true,message:"OTP IS SENT TO YOUR EMAIL"});
   }catch(err){
        res.status(400).json({success:false,message:err.message});    
   }
}

export const verifyEmail = async (req,res)=>{
  const userId = req.userId;
   const {otp} = req.body;
   if(!userId || !otp){
        return res.status(400).json({success:false,message:"All fields are required"});
   }
   try{
        const user = await userModel.findById(userId);
        if(!user){
          return res.status(400).json({success:false,message:"User not found"});
        }
        if(user.verifyOtp != otp){
          return res.status(400).json({success:false,message:"Invalid OTP"});
        }
        if(user.verifyOtpExpires <Date.now()){
          return res.status(400).json({success:false,message:"OTP has expired"});
        }
        user.isVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpires = 0;
        await user.save();
        return res.status(200).json({success:true,message:"User verified successfully"});
   }catch(err){
    res.status(400).json({success:false,message:err.message});
   }
}

//  check user is authenticated or not
export const isAuthenticated = async (req,res)=>{
  try{
        return res.status(200).json({success:true});
  }catch(err){
        return res.status(400).json({success:false,message:err.message})
  }
}

// send password reset opt.
export const sendResetOtp = async (req,res)=>{
  const {email} = req.body;
  if(!email){
    return res.status(400).json({success:false,message:"email is not provided"});
  }
  try{
  const user = await userModel.findOne({email});
  if(!user){
     return res.status(400).json({success:false,message:"user not found!"});   
  }
          const otp = String(Math.floor(Math.random() * 900000 + 100000)); // 6 digit OTP
          console.log(otp);
          user.resetOtp = otp;
          user.resetOtpExpires = Date.now()+ 15*60*10000;
          await user.save();
          const mailOptions = {
           from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Reset OTP',
            html: PASSWORD_RESET_TEMPLATE.replace('{{email}}',user.email).replace('{{otp}}',otp)
          }
          await transporter.sendMail(mailOptions);
          res.status(200).json({success:true,message:"otp is send to the user email address"});
  }catch(err){
     res.status(400).json({success:false,message:err.message})
  }
}

// Reset user's password
export const resetPassword = async (req,res)=>{
  const {email,otp,newPassword} = req.body;
  if(!email || !otp || !newPassword){
    res.status(400).json({success:false,message:"something is missing! try again later."});
  }
  try{
     const user = await userModel.findOne({email});
     if(!user){
      res.status(400).json({success:false,message:"user not found!"});
     }
     if(user.resetOtp === "" || user.resetOtp != otp){
      return res.status(400).json({success:false,message:'Invalid otp'})
     }
     if(user.resetOtpExpires <Date.now()){
      return res.status(400).json({success:false,message:"OTP expired."})
     }
     const  hashedPassword = await bcrypt.hash(newPassword,10);
     user.password = hashedPassword;
     user.resetOtp = '';
     user.resetOtpExpires = 0;
     await user.save();
     return res.status(200).json({success:true,message:"password has been reset successfully."})
  }catch(err){
    res.status(400).json({success:false,message:err.message});
  }
}