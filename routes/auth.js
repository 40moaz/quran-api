const express = require( 'express' );
const User = require( '../models/User' );
const jwt = require( 'jsonwebtoken' );
const bcrypt = require( 'bcryptjs' ); // Library for password hashing

const router = express.Router();

// Middleware to verify token
function verifyToken ( req, res, next )
{
    const authHeader = req.headers.authorization;
    if ( !authHeader )
    {
        return res.status( 401 ).json( { message: 'Access denied. No token provided.' } );
    }

    const token = authHeader.split( ' ' )[ 1 ];
    if ( !token )
    {
        return res.status( 401 ).json( { message: 'Access denied. No token provided.' } );
    }

    try
    {
        const decoded = jwt.verify( token, 'mySuperSecretKey123!@#' );
        req.user = decoded;
        next();
    } catch ( error )
    {
        res.status( 400 ).json( { message: 'Invalid token.' } );
    }
}

// Create a new user account
router.post( '/signup', async ( req, res ) =>
{
    try
    {
        const { fullName, email, phone, date_of_birth, profileImage, password, username } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash( password, 10 ); // 10 is the salt rounds

        const user = new User( { fullName, email, phone, date_of_birth, profileImage, password: hashedPassword, username } );
        await user.save();
        res.status( 201 ).json( { message: 'User created successfully' } );
    } catch ( error )
    {
        res.status( 500 ).json( { message: 'Failed to create user', error: error.message } );
    }
} );

// User login
router.post( '/login', async ( req, res ) =>
{
    try
    {
        const { email, password } = req.body;

        // Check if the user exists in the database
        const user = await User.findOne( { email } );
        if ( !user )
        {
            return res.status( 404 ).json( { message: 'User not found' } );
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare( password, user.password );
        if ( !isPasswordValid )
        {
            return res.status( 401 ).json( { message: 'Invalid credentials' } );
        }

        // Generate a JWT token with user ID and set expiration time
        const token = jwt.sign( { userId: user._id }, 'mySuperSecretKey123!@#', { expiresIn: '1h' } );

        // Return success message and token
        res.json( { message: 'Login successful', token } );
    } catch ( error )
    {
        res.status( 500 ).json( { message: 'Failed to login', error: error.message } );
    }
} );

// Protected route to fetch current user profile
router.get( '/me', verifyToken, async ( req, res ) =>
{
    try
    {
        // Fetch the user details using userId from the token
        const user = await User.findById( req.user.userId ).select( '-password' ); // Exclude password field

        if ( !user )
        {
            return res.status( 404 ).json( { message: 'User not found' } );
        }
        res.json( {
            message: 'User profile fetched successfully',
            user: user
        } );
    } catch ( error )
    {
        res.status( 500 ).json( { message: 'Failed to fetch user profile', error: error.message } );
    }
} );

// Update user profile
router.put( '/me', verifyToken, async ( req, res ) =>
{
    try
    {
        const { fullName, email, phone, date_of_birth, profileImage, username } = req.body;

        // Find user and update their details
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { fullName, email, phone, date_of_birth, profileImage, username },
            { new: true, runValidators: true } // Return the updated document and run validation
        ).select( '-password' ); // Exclude password field

        if ( !user )
        {
            return res.status( 404 ).json( { message: 'User not found' } );
        }

        res.json( {
            message: 'User profile updated successfully',
            user: user
        } );
    } catch ( error )
    {
        res.status( 500 ).json( { message: 'Failed to update user profile', error: error.message } );
    }
} );

// Update password
router.put( '/update-password', verifyToken, async ( req, res ) =>
{
    try
    {
        const { currentPassword, newPassword } = req.body;

        // Fetch the user from the database
        const user = await User.findById( req.user.userId );
        if ( !user )
        {
            return res.status( 404 ).json( { message: 'User not found' } );
        }

        // Compare the current password with the stored hashed password
        const isPasswordValid = await bcrypt.compare( currentPassword, user.password );
        if ( !isPasswordValid )
        {
            return res.status( 401 ).json( { message: 'Current password is incorrect' } );
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash( newPassword, 10 ); // 10 is the salt rounds
        user.password = hashedNewPassword;
        await user.save();
        res.json( { message: 'Password updated successfully' } );
    } catch ( error )
    {
        res.status( 500 ).json( { message: 'Failed to update password', error: error.message } );
    }
} );

// DELETE route to delete user account
router.delete( '/me', verifyToken, async ( req, res ) =>
{
    try
    {
        const userId = req.user.userId;
        // Find user by ID and delete
        const user = await User.findByIdAndDelete( userId );
        if ( !user )
        {
            return res.status( 404 ).json( { message: 'User not found' } );
        }

        res.json( { message: 'User deleted successfully' } );
    } catch ( error )
    {
        res.status( 500 ).json( { message: 'Failed to delete user', error: error.message } );
    }
} );
module.exports = router;
