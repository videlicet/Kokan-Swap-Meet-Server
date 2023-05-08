/* The userModel defines the data structure for users */

import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
	user_id: String, // TD should be a number, but a string for testing purposes bc it's used in a comparison in the user_requests routes where it's compared with a string
	loggedIn: Boolean, // testing
	username: String,
	password: String,
	email: String,
	first_name: String,
	last_name: String,
	pictureURL: String, 
	kokans: Number,
	created: String
}, { collection: 'Users' });

const User = model('User', userSchema);

export default User;
