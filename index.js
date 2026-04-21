// IMPORTS
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ================= DB CONNECTION =================
mongoose.connect(process.env.MONGO_URI, {
useNewUrlParser: true,
useUnifiedTopology: true
})
.then(()=>console.log("✅ MongoDB Connected"))
.catch(err=>console.log("❌ DB Error:", err));

// ================= MODELS =================

// USER MODEL
const User = mongoose.model("User", new mongoose.Schema({
name: String,
userId: { type: String, unique: true }
}));

// ORDER MODEL
const Order = mongoose.model("Order", new mongoose.Schema({
orderId: String,
userId: String,
userName: String,
canteen: String,
items: Array,
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

// ROOT
app.get("/", (req,res)=>{
res.send("🍽️ Smart Canteen Backend Running");
});

// LOGIN / REGISTER
app.post("/login", async (req,res)=>{
try {
const {name, id} = req.body;

if(!name || !id){
return res.status(400).json({error:"Missing fields"});
}

let user = await User.findOne({userId:id});

if(!user){
user = new User({
name,
userId:id
});
await user.save();
}

res.json(user);

} catch(err){
res.status(500).json({error:"Server error"});
}
});

// PLACE ORDER
app.post("/order", async (req,res)=>{
try {
const {user, canteen, cart} = req.body;

if(!user || !canteen || !cart){
return res.status(400).json({error:"Invalid data"});
}

const order = new Order({
orderId: "ORD" + Date.now(),
userId: user.userId,
userName: user.name,
canteen,
items: cart
});

await order.save();

res.json({message:"Order placed successfully"});

} catch(err){
res.status(500).json({error:"Order failed"});
}
});

// GET USER ORDERS
app.get("/orders/:id", async (req,res)=>{
try {
const orders = await Order.find({userId:req.params.id}).sort({createdAt:-1});
res.json(orders);
} catch(err){
res.status(500).json({error:"Error fetching orders"});
}
});

// ADMIN: GET ALL ORDERS
app.get("/admin/orders", async (req,res)=>{
try {
const orders = await Order.find().sort({createdAt:-1});
res.json(orders);
} catch(err){
res.status(500).json({error:"Admin fetch failed"});
}
});

// UPDATE ORDER STATUS
app.put("/order/:id", async (req,res)=>{
try {
const {status} = req.body;

await Order.updateOne(
{orderId:req.params.id},
{status}
);

res.json({message:"Status updated"});
} catch(err){
res.status(500).json({error:"Update failed"});
}
});

// DELETE ORDER (optional)
app.delete("/order/:id", async (req,res)=>{
try {
await Order.deleteOne({orderId:req.params.id});
res.json({message:"Order deleted"});
} catch(err){
res.status(500).json({error:"Delete failed"});
}
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
console.log(`🚀 Server running on port ${PORT}`);
});
