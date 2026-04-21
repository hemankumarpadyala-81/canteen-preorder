require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB Connected"));

const User = mongoose.model("User",{name:String,userId:String});
const Order = mongoose.model("Order",{
orderId:String,
userId:String,
userName:String,
canteen:String,
items:Array,
status:{type:String,default:"Pending"}
});

app.get("/",(req,res)=>res.send("Backend Running"));

// LOGIN
app.post("/login",async(req,res)=>{
let {name,id}=req.body;
let user=await User.findOne({userId:id});
if(!user){
user=new User({name,userId:id});
await user.save();
}
res.json(user);
});

// ORDER
app.post("/order",async(req,res)=>{
let {user,canteen,cart}=req.body;

let order=new Order({
orderId:"ORD"+Date.now(),
userId:user.userId,
userName:user.name,
canteen,
items:cart
});

await order.save();
res.json({msg:"ok"});
});

// HISTORY
app.get("/orders/:id",async(req,res)=>{
let data=await Order.find({userId:req.params.id});
res.json(data);
});

// ADMIN
app.get("/admin/orders",async(req,res)=>{
let data=await Order.find();
res.json(data);
});

app.listen(process.env.PORT||5000);
