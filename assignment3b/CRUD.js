const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/userDB")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
    id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Explicitly adding an ID
    name: String,
    email: { type: String, unique: true },
    password: String,
    age: Number,
    gender: String,
    disability: Boolean
});


const User = mongoose.model('User', userSchema);

// CREATE - Register User
app.post("/register", async (req, resp) => {
    try {
        const user = new User(req.body);
        const result = await user.save();
        resp.status(201).json({
            message: "User Registered Successfully",
            user: {
                id: result._id, // Include the MongoDB-generated ID
                name: result.name,
                email: result.email
            }
        });
        
    } catch (error) {
        resp.status(400).json({
            message: "Registration Failed",
            error: error.message
        });
    }
});

// READ - Get All Users
app.get("/users", async (req, resp) => {
    try {
        const users = await User.find({}, { password: 0 });
        resp.status(200).json({
            message: "Users Listed Successfully",
            users: users
        });
    } catch (error) {
        resp.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
});

// READ - Get Single User
app.get("/user/:id", async (req, resp) => {
    try {
        const user = await User.findById(req.params.id, { password: 0 });
        if (!user) {
            return resp.status(404).json({ message: "User not found" });
        }
        resp.status(200).json({
            message: "User Found",
            user: user
        });
    } catch (error) {
        resp.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
});

// UPDATE - Update User
app.put("/user/:id", async (req, resp) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!user) {
            return resp.status(404).json({ message: "User not found" });
        }
        resp.status(200).json({
            message: "User Updated Successfully",
            user: user
        });
    } catch (error) {
        resp.status(400).json({
            message: "Update Failed",
            error: error.message
        });
    }
});

// DELETE - Delete User
app.delete("/user/:id", async (req, resp) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return resp.status(404).json({ message: "User not found" });
        }
        resp.status(200).json({
            message: "User Deleted Successfully",
            user: user
        });
    } catch (error) {
        resp.status(500).json({
            message: "Deletion Failed",
            error: error.message
        });
    }
});

// LOGIN - User Authentication
app.post("/login", async (req, resp) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || user.password !== password) {
            return resp.status(401).json({ message: "Invalid email or password" });
        }

        resp.status(200).json({
            message: "Login Successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        resp.status(500).json({
            message: "Login Failed",
            error: error.message
        });
    }
});

app.listen(3000, () => {
    console.log("Server Running on Port:3000");
});