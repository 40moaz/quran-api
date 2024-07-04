const express = require( "express" );
const app = express();
const cors = require( 'cors' );
const mongoose = require( "mongoose" );

// Correctly encode the password
const password = encodeURIComponent( 'Moaz@Ali123' );
const url = `mongodb+srv://amoaz14109:${ password }@quranapi.ogjkhvf.mongodb.net/?retryWrites=true&w=majority&appName=quranApi`;

// Allow requests from all origins
app.use( cors() );

// إعدادات CORS المخصصة
app.use( ( req, res, next ) =>
{
    res.header( 'Access-Control-Allow-Origin', 'http://localhost:3000' ); // السماح للطلبات من localhost:3000
    res.header( 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE' );
    res.header( 'Access-Control-Allow-Headers', 'Content-Type, Authorization' );
    res.header( 'Access-Control-Allow-Credentials', 'true' ); // السماح بإرسال الكوكيز أو التوكينات
    next();
} );

// Connect to MongoDB
mongoose.connect( url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
} )
    .then( () =>
    {
        console.log( 'MongoDB connected' );
    } )
    .catch( err =>
    {
        console.error( 'MongoDB connection error:', err );
    } );

app.use( express.json() );

// Authentication routes
const authRoutes = require( './routes/auth' );
app.use( '/auth', authRoutes );

app.get( "/", ( req, res ) =>
{
    res.send( "<h1>Hi There</h1> <p>You can signup & login.</p>" );
} );

const quranRoutes = require( './routes/quran' );
app.use( '/quran', quranRoutes );

app.listen( 3000, () =>
{
    console.log( "I'm Listening In Port 3000" );
} );
