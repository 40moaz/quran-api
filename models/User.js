const mongoose = require( 'mongoose' );

const UserSchema = new mongoose.Schema( {
    fullName: String,
    username: String,
    email: String,
    phone: String,
    date_of_birth: String,
    profileImage: String,
    password: String
} );

const User = mongoose.model( 'User', UserSchema );

module.exports = User;
