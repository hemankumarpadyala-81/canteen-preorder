// IMPORTS
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ================= DB =================

// Check if MONGO_URI exists
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => {
  console.error("❌ DB CONNECTION ERROR:", err.message);
  process.exit(1); // stop app if DB fails
});

// ================= MODELS =================

const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  id: { type: String, unique: true }
}));

const Order = mongoose.model("Order", new mongoose.Schema({
  orderId: String,
  user: {
    name: String,
    id: String
  },
  canteen: String,
  cart: Array,
  status: {
    type: String,
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}));

// ================= ROUTES =================

// TEST
app.get("/", (req,res)=>{
  res.send("🍽️ Smart Canteen Backend Running");
});

// LOGIN
app.post("/login", async (req,res)=>{
try{
  const {name, id} = req.body;

  if(!name || !id){
    return res.status(400).json({error:"Missing data"});
  }

  let user = await User.findOne({id});

  if(!user){
    user = new User({name, id});
    await user.save();
  }

  res.json(user);

}catch(err){
  console.error("LOGIN ERROR:", err);
  res.status(500).json({error:"Server error"});
}
});

// PLACE ORDER
app.post("/order", async (req,res)=>{
try{
  const {user, canteen, cart} = req.body;

  if(!user || !canteen || !cart){
    return res.status(400).json({error:"Invalid data"});
  }

  const order = new Order({
    orderId: "ORD"+Date.now(),
    user,
    canteen,
    cart
  });

  await order.save();

  res.json({message:"Order placed"});

}catch(err){
  console.error("ORDER ERROR:", err);
  res.status(500).json({error:"Order failed"});
}
});

// USER HISTORY
app.get("/orders/:id", async (req,res)=>{
try{
  const orders = await Order.find({"user.id": req.params.id})
  .sort({createdAt:-1});

  res.json(orders);

}catch(err){
  console.error("FETCH ERROR:", err);
  res.status(500).json({error:"Fetch failed"});
}
});

// ADMIN
app.get("/admin/orders", async (req,res)=>{
try{
  const orders = await Order.find().sort({createdAt:-1});
  res.json(orders);

}catch(err){
  console.error("ADMIN ERROR:", err);
  res.status(500).json({error:"Admin fetch failed"});
}
});

// UPDATE STATUS
app.put("/order/:id", async (req,res)=>{
try{
  const {status} = req.body;

  await Order.updateOne(
    {orderId:req.params.id},
    {status}
  );

  res.json({message:"Updated"});

}catch(err){
  console.error("UPDATE ERROR:", err);
  res.status(500).json({error:"Update failed"});
}
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
  console.log(`🚀 Server running on port ${PORT}`);
});
