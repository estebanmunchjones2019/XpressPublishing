const express = require('express');
const sqlite3 = require('sqlite3');
const {checkIssue} = require('./utils');

const issuesRouter = express.Router( { mergeParams: true } ); // mergeParams in not necessary because there is a middleware function that gets the seriesId and attach it to the req object. It'd be useful if I had req.params.seriesId call in issuesRouter
const db = new sqlite3.Database( process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId',(req,res,next,issueId)=>{
    db.get(`SELECT * FROM Issue WHERE id = $issueId`,{ $issueId: issueId },(err,row)=>{
        if(err){
            next(err);
        }else if(row){
            req.issue = row;
            next();        
        } else {
            res.sendStatus(404);
        }
    })
});


issuesRouter.get('/',(req,res,next)=>{
   db.all(`SELECT * FROM Issue WHERE series_id = ${req.series.id}`,(err,issues)=>{
       if(err){
           next(err);
       } else {
        res.status(200).send( { issues: issues } );
       }
   }) 
});

issuesRouter.post('/', checkIssue, (req,res,next)=>{
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    const sql = `INSERT INTO Issue (
        name,
        issue_number,
        publication_date,
        artist_id, series_id)
        VALUES (
        $name, 
        $issueNumber, 
        $publicationDate, 
        $artistId, 
        $seriesId)`;
    const values = { 
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId, 
        $seriesId: req.series.id // or req.params.seriesId;
    };
    db.run(sql, values, function(err){
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`,(err,issue)=>{
                if(err){
                    next(err);
                } else {
                    res.status(201).send( { issue: issue });
                }
            })
        }
    })
});

issuesRouter.put('/:issueId', checkIssue, (req,res,next)=>{
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    const sql = `UPDATE Issue SET 
    name = $name, 
    issue_number = $issueNumber,
    publication_date = $publicationDate,
    artist_id = $artistId  
    WHERE id = $id`;
    const values = { 
        $name: name, 
        $issueNumber: issueNumber, 
        $publicationDate: publicationDate, 
        $artistId: artistId, 
        $id: req.issue.id // or req.parms.issueId
    };
    db.run(sql, values, function(err){
        if(err){
            next(err);
        } else{
            db.get(`SELECT * FROM Issue WHERE id = ${req.issue.id}`,(err,issue)=>{
                if(err){
                    next(err);
                } else{
                    res.status(200).send( { issue: issue });
                }
            })
        }
    }) 
});

issuesRouter.delete('/:issueId',(req,res,next)=>{
    const sql = `DELETE FROM Issue WHERE id = $id`;
    const value = { 
        $id: req.issue.id // or req.params.issueId;
    };
    db.run(sql, value, function(err){
        if(err){
            next(err);
        } else {
            res.sendStatus(204);
        }
    })
});

module.exports = issuesRouter;