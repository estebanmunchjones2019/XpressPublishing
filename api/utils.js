const sqlite3 = require('sqlite3');
const db = new sqlite3.Database( process.env.TEST_DATABASE || './database.sqlite');

const checkArtist = (req,res,next)=>{
    const newArtist = req.body.artist;
    if(!newArtist.name || !newArtist.dateOfBirth || !newArtist.biography){
        return res.sendStatus(400); // bad request
    }
    newArtist.isCurrentlyEmployed =  newArtist.isCurrentlyEmployed === 0 ? 0 : 1; // to be sure this value is either 0 or 1;
    req.body.artist = newArtist;
    next();
}

const checkSeries = (req,res,next)=>{
    const newSeries = req.body.series;
    if(!newSeries.name || !newSeries.description){
        return res.sendStatus(400); // bad request
    }
    next();
}

const checkIssue = (req,res,next)=>{
    const newIssue = req.body.issue;
    if(!newIssue.name || !newIssue.issueNumber || !newIssue.publicationDate || !newIssue.artistId){
        res.sendStatus(400); // bad request
    }else{
        next();
    }
}

const checkIssue2 = (req,res,next)=>{
    db.get(`SELECT * FROM Issue WHERE series_id = ${req.series.id}`,(err,row)=>{
        if(err){
            next(err);
        }else if(row){
            res.sendStatus(400);
        }else{
            next();
        }
        
    })
}

module.exports = {checkArtist, checkSeries, checkIssue, checkIssue2};



