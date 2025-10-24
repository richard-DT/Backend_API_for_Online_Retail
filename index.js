const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import route files
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orderRoutes");

const app = express();


mongoose.connect(process.env.MONGODB_STRING);
let db = mongoose.connection
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () => console.log("We're connected to the cloud database"))


app.use(express.json());
app.use(express.urlencoded({extended:true}));


//CORS (Cross-Origin Resource Sharing)
// it allows our backend application to be available to our frontend application

//app.use(cors())

// const corsOptions = {
// 	origin: ['http://localhost:8000'],
// 	//methods: ['GET', 'POST'],
// 	//allowedHeaders: ['Content-Type', 'Authorization']
// 	credentials: true, //cookies, headers
// 	optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));

// debugging purpose
console.log("Cart routes loaded");

// Routes
// ======================
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// Root route (optional)
app.get("/", (req, res) => {
	res.send("E-Commerce API is running...");
});


// ******** for debugging purposes only *******
// if (app && app._router && app._router.stack) {
//   console.log("\nRegistered Routes:");
//   app._router.stack.forEach((middleware) => {
//     if (middleware.route) {
//       // Routes directly registered on the app
//       const methods = Object.keys(middleware.route.methods)
//         .map((m) => m.toUpperCase())
//         .join(", ");
//       console.log(`${methods.padEnd(10)} ${middleware.route.path}`);
//     } else if (middleware.name === "router") {
//       // Routes inside routers (like /carts)
//       middleware.handle.stack.forEach((handler) => {
//         if (handler.route) {
//           const routePath = handler.route.path;
//           const methods = Object.keys(handler.route.methods)
//             .map((m) => m.toUpperCase())
//             .join(", ");
//           console.log(`${methods.padEnd(10)} ${routePath}`);
//         }
//       });
//     }
//   });
//   console.log(); // blank line
// } else {
//   console.log("Could not inspect routes. app._router not available.");
// }

// ********************************************


if(require.main === module){
    app.listen(process.env.PORT || 3000, () => 
    	console.log(`API is now online on port ${process.env.PORT || 3000}`));
}

//Export both app and mongoose for only for checking
module.exports = {app,mongoose};