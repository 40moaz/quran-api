const express = require( 'express' );
const router = express.Router();
const fs = require( 'fs' );

const quran = JSON.parse( fs.readFileSync( 'quranData.json', 'utf-8' ) );

// 1- get quran
router.get( '/', async ( req, res ) =>
{
    try
    {
        res.json( quran );
    } catch ( error )
    {
        res.status( 500 ).json( {
            message: "An error occurred",
            error: error.message
        } );
    }
} );

module.exports = router;
