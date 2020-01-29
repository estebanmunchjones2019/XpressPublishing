const express = require('express');
const sqlite3 = require('sqlite3');
const {checkArtist} = require('./utils');


const artistsRouter = express.Router();
const db = new sqlite3.Database( process.env.TEST_DATABASE || './database.sqlite'); 


artistsRouter.param(':artistId',(req,res,next,artistId)=>{
    db.get(`SELECT * FROM Artist WHERE id = $artistId`,{ $artistId: artistId },(err,artist)=>{
        if(err){
            next(err);
        }else if(artist){
            req.artist = artist;
            next();
        }else{
            res.sendStatus(404);
        }
        
    })
});

artistsRouter.get('/', (req,res,next)=>{
    db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`, (err,artists)=>{
        if(err){
            next(err);
        } else {
            res.status(200).send({ artists: artists}); // in ES6, can be just {artists}
        }
    })
});

artistsRouter.get('/:artistId',(req,res,next)=>{
    res.status(200).send({ artist: req.artist });
});

artistsRouter.post('/', checkArtist, (req,res,next)=>{
     const name = req.body.artist.name;
     const dateOfBirth = req.body.artist.dateOfBirth;
     const biography = req.body.artist.biography;
     const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed;
     const sql = `INSERT INTO Artist (
         name, 
         date_of_birth, 
         biography, 
         is_currently_employed) 
         VALUES (
             $name, 
             $dateOfBirth, 
             $biography,
             $isCurrentlyEmployed)`;
     const values = { 
         $name: name, 
         $dateOfBirth: dateOfBirth, 
         $biography: biography, 
         $isCurrentlyEmployed: isCurrentlyEmployed
     };     
    db.run(sql, values, function(err){
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`,(err,artist)=>{
                if(err){
                    next(err);
                } else {
                    res.status(201).send( { artist: artist });
                }
            })
        }
    })
});

artistsRouter.put('/:artistId', checkArtist,(req,res,next)=>{
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed;
    const sql = `UPDATE Artist 
        SET
        name = $name , 
        date_of_birth = $dateOfBirth, 
        biography = $biography, 
        is_currently_employed = $isCurrentlyEmployed
        WHERE id = $id`;
     const values = { 
         $name: name, 
         $dateOfBirth: dateOfBirth, 
         $biography: biography, 
         $isCurrentlyEmployed: isCurrentlyEmployed,
         $id: req.artist.id // or $id : req.params.artisId;
     };     
    db.run(sql, values, function(err){
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.artist.id}`,(err,artist)=>{
                if(err){
                    next(err);
                } else {
                    res.status(200).send( { artist: artist }); // res.status(200).json({artist:row}) can work as well
            }})
        }
    })
});

artistsRouter.delete('/:artistId',(req,res,next)=>{
    const sql = `UPDATE Artist 
        SET 
        is_currently_employed = 0
        WHERE id = $id`;
    const value = { 
        $id: req.artist.id
    };
    db.run(sql, value, function(err){
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.artist.id}`,(err,artist)=>{
                if(err){
                    next(err);
                } else {
                    res.status(200).send( { artist: artist });
                }
            })
        }
    })
});

module.exports = artistsRouter;