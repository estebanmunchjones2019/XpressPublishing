const checkArtist = (req,res,next)=>{
    const newArtist = req.body.artist;
    if(!newArtist.name || !newArtist.dateOfBirth || !newArtist.biography){
        res.sendStatus(400); // bad request
    }
    newArtist.isCurrentlyEmployed =  newArtist.isCurrentlyEmployed === 0 ? 0 : 1; // to be sure this value is either 0 or 1;
    req.body.artist = newArtist;
    next();
}

module.exports = {checkArtist};