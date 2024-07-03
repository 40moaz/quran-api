const mongoose = require( 'mongoose' );

const UserSchema = new mongoose.Schema( {
    fullName: String,
    username: String,
    date_of_birth: String,
    profileImage: String,
    password: String,
    role: String,
    student: Boolean
} );

const User = mongoose.model( 'User', UserSchema );

module.exports = User;
