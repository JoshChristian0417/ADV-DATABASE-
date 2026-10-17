const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config();

const Product = require("./models/product");

const app = express();

app.use(express.static("public"));

// ==============================
// Middleware
// ==============================

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static("public"));



// ==============================
// EJS
// ==============================

app.set("view engine", "ejs");


// ==============================
// Session
// ==============================

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);


// Authentication Middleware
function isLoggedIn(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/");
    }

    next();
}

// API Redirect Middleware
function redirectAPI(req, res) {
    res.redirect("https://youtu.be/QDia3e12czc");
}

app.use("/api", redirectAPI);

// ==============================
// MongoDB
// ==============================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected!");
    })
    .catch((error) => {
        console.log("MongoDB connection failed!");
        console.log(error);
    });


// ==============================
// Login Page
// ==============================

app.get("/", (req, res) => {

    res.render("login");

});


// ==============================
// Login
// ==============================

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    if (username === "joshua" && password === "123") {

        req.session.user = username;

        res.redirect("/dashboard");

    } else {

        res.send("Invalid username or password");

    }

});


// ==============================
// Dashboard
// ==============================

app.get("/dashboard", isLoggedIn, (req, res) => {
    res.render("dashboard", {
        user: req.session.user
    });

});


// ==============================
// Product List
// ==============================

app.get("/products", isLoggedIn, async (req, res) => {

    try {

        const products = await Product.find();

        res.render("products", {
            products: products,
            user: req.session.user
        });

    } catch (error) {

        res.send("Error loading products.");

    }

});


// ==============================
// Add Product Page
// ==============================

app.get("/products/add", isLoggedIn, (req, res) => {

    res.render("add-product");

});


// ==============================
// Add Product
// ==============================

app.post("/products/add", isLoggedIn, async (req, res) => {
    try {
        console.log("Product received:", req.body);

        const product = new Product({
            name: req.body.name,
            category: req.body.category,
            price: Number(req.body.price),
            quantity: Number(req.body.quantity)
        });

        const savedProduct = await product.save();

        console.log("Product saved to MongoDB:", savedProduct);

        res.redirect("/products");

    } catch (error) {
        console.log("Error adding product:");
        console.log(error);

        res.send("Error adding product. Check the terminal.");
    }
});

// ==============================
// Edit Product Page
// ==============================

app.get("/products/edit/:id", isLoggedIn, async (req, res) => {

    try {

        const product = await Product.findById(req.params.id);

        res.render("edit-product", {
            product: product
        });

    } catch (error) {

        res.send("Error finding product.");

    }

});


/// ==============================
// Update Product
// ==============================

app.post("/products/edit/:id", isLoggedIn, async (req, res) => {

    try {

        console.log("Updating product:", req.params.id);
        console.log("Updated data:", req.body);

        await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                category: req.body.category,
                price: Number(req.body.price),
                quantity: Number(req.body.quantity)
            },
            {
                runValidators: true
            }
        );

        console.log("Product updated successfully!");

        res.redirect("/products");

    } catch (error) {

        console.log("ERROR UPDATING PRODUCT:");
        console.log(error);

        res.send("Error updating product. Check the terminal.");

    }

});


// ==============================
// Delete Product
// ==============================

app.post("/products/delete/:id", isLoggedIn, async (req, res) => {

    try {

        await Product.findByIdAndDelete(req.params.id);

        res.redirect("/products");

    } catch (error) {

        res.send("Error deleting product.");

    }

});


// ==============================
// Logout
// ==============================

app.get("/logout", (req, res) => {

    req.session.destroy(() => {

        res.redirect("/");

    });

});

app.get("/api/products", (req, res) => {
    res.json({
        message: "Product API"
    });
});

// ==============================
// Start Server
// ==============================

app.listen(process.env.PORT, () => {

    console.log(
        `Server running on http://localhost:${process.env.PORT}`
    );

});