const express = require('express');
const sqlite3 = require('sqlite3');
const {checkArtist} = require('./utils');


const artistsRouter = express.Router();
const db = new sqlite3.Database( process.env.TEST_DATABASE || './database.sqlite'); // ./database.sqlite should be ../database.sqlite because the 2 files aren't in the some directory. But it works :S



artistsRouter.param(':artistId',(req,res,next,artistId)=>{
    db.get(`SELECT * FROM Artist WHERE id = $artistId`,{ $artistId: artistId },(err,row)=>{
        if(err){
            next(err);
        }else if(!row){
            res.sendStatus(404);
        }
        req.artist = row;
        next();
    })
});

artistsRouter.get('/', (req,res,next)=>{
    db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`, (err,rows)=>{
        if(err){
            next(err);
        }
        res.status(200).send({ artists: rows});
    })
});

artistsRouter.get('/:artistId',(req,res,next)=>{
    res.status(200).send({ artist: req.artist });
});

artistsRouter.post('/', checkArtist, (req,res,next)=>{
     const newArtist = req.body.artist;
    db.run(`INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography,$isCurrentlyEmployed)`,{ $name: newArtist.name, $dateOfBirth: newArtist.dateOfBirth, $biography: newArtist.biography, $isCurrentlyEmployed: newArtist.isCurrentlyEmployed}, function(err){
        if(err){
            next(err);
        }
        db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`,(err,row)=>{
            if(err){
                next(err);
            }
            res.status(201).send( { artist: row });
        })
    })
});

artistsRouter.put('/:artistId', checkArtist,(req,res,next)=>{
    const newArtist = req.body.artist;
    db.run(`UPDATE Artist 
    SET
    name = $name , 
    date_of_birth = $dateOfBirth, 
    biography = $biography, 
    is_currently_employed = $isCurrentlyEmployed
    WHERE id = $id`,{ $name: newArtist.name, $dateOfBirth: newArtist.dateOfBirth, $biography: newArtist.biography, $isCurrentlyEmployed: newArtist.isCurrentlyEmployed, $id: req.artist.id}, function(err){
        if(err){
            next(err);
        }
        db.get(`SELECT * FROM Artist WHERE id = ${req.artist.id}`,(err,row)=>{
            if(err){
                next(err);
            }
            res.status(200).send( { artist: row });
        })
    })
});

artistsRouter.delete('/:artistId',(req,res,next)=>{
    db.run(`UPDATE Artist 
    SET 
    is_currently_employed = 0
    WHERE id = $id`,{ $id: req.artist.id}, function(err){
        if(err){
            next(err);
        }
        db.get(`SELECT * FROM Artist WHERE id = ${req.artist.id}`,(err,row)=>{
            if(err){
                next(err);
            }
            res.status(200).send( { artist: row });
        })
    })
});

module.exports = artistsRouter;