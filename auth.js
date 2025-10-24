const jwt = require("jsonwebtoken");

require('dotenv').config();

// [Section] JSON Web Tokens
/*
- JSON Web Token or JWT is a way of securely passing information from the server to the client or to other parts of a server
- Information is kept secure through the use of the secret code
- Only the system that knows the secret code that can decode the encrypted information
- Imagine JWT as a gift wrapping service that secures the gift with a lock
- Only the person who knows the secret code can open the lock
- And if the wrapper has been tampered with, JWT also recognizes this and disregards the gift
- This ensures that the data is secure from the sender to the receiver
*/

module.exports.createAccessToken = (user) => {

	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	};

	// Generate a JSON web token using the jwt's sign method
    // Generates the token using the form data and the secret code with no additional options provided
    // SECRET_KEY is a User defined string data that will be used to create our JSON web tokens
    // Used in the algorithm for encrypting our data which makes it difficult to decode the information without the defined secret keyword
    //Since this is a critical data, we will use the .env to secure the secret key. "Keeping your secrets secret".
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
};


//Token Verification
module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization);

	let token = req.headers.authorization;

	if(typeof token === "undefined"){
		return res.send({auth: "Failed. No Token"})
	} else {
		console.log(token);
		token = token.slice(7, token.length);
		console.log(token)

		jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken){
			if(err){
				return res.status(403).send({
					auth:"Failed",
					message: err.message
				})
			} else {
				console.log("result from verify method:")
				console.log(decodedToken);
				req.user = decodedToken;
				next();
			}
		})
	}
}

//Verify Admin

module.exports.verifyAdmin = (req, res, next) => {
	if(req.user.isAdmin){
		next();
	} else {
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
}



/*
[SECTION] Error Handling Middleware
- Handling errors in every route can get messy, so we use Error Handling Middleware to manage them in one place.
- This middleware catches errors across the app and ensures they are handled the same way.
- It keeps code simple by letting developers focus on features while the middleware handles error logging and responses.
*/

module.exports.errorHandler = (err, req, res, next) => {
	console.error(err);

	const statusCode = err.status || 500;

	const errorMessage = err.message || 'Internal Server Error';

	// standardized object response
	res.status(statusCode).json({
		error: {
			message:errorMessage,
			errorCode: err.code || 'SERVER_ERROR',
			details: err.details || null
		}
	});
};


//Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
	if(req.user){
		next()
	} else {
		res.sendStatus(401);
	}
}