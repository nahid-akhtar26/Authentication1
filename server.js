import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();
const port = process.env.PORT || 4000;
import dotenv from 'dotenv';
import authRouter from './routes/authRoute.js';
import userRouter from './routes/userRoute.js';
dotenv.config();
const allowedOrigins = ['http://localhost:5173']
app.use(cors({
  origin:allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
// app.use(cors({origin:allowedOrigins,credentials:true}))

// app.use(cors({credentials:true}));

// database connection
mongoose.connect(`${process.env.MONGO_URI}/mern-auth`)
.then(()=>{
    console.log("mongodb connected successfully");
})
.catch((err)=>{
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
})

// endpoints
app.get('/',(req,res)=>{
    res.send("hello from the server");
})
app.use('/api/auth',authRouter);
app.use('/api/user',userRouter)
app.listen(port,()=>{
    console.log("server is running on port:",port);
})