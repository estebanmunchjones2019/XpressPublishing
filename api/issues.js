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
   db.all(`SELECT * FROM Issue WHERE series_id = ${req.series.id}`,(err,row)=>{
       if(err){
           next(err);
       }
       res.status(200).send( { issues: row } );
   }) 
});

issuesRouter.post('/', checkIssue, (req,res,next)=>{
    const newIssue = req.body.issue;
    db.run(`INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`,{ $name: newIssue.name, $issueNumber: newIssue.issueNumber, $publicationDate: newIssue.publicationDate, $artistId: newIssue.artistId, $seriesId: req.series.id}, function(err){
        if(err){
            next(err);
        }
        db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`,(err,row)=>{
            if(err){
                next(err);
            }
            res.status(201).send( { issue: row });
        })
    })
});

issuesRouter.put('/:issueId', checkIssue, (req,res,next)=>{
    const newIssue = req.body.issue;
    db.run(`UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId  WHERE id = $id`,{ $name: newIssue.name, $issueNumber: newIssue.issueNumber, $publicationDate: newIssue.publicationDate, $artistId: newIssue.artistId, $id: req.issue.id}, function(err){
        if(err){
            next(err);
        } else{
            db.get(`SELECT * FROM Issue WHERE id = ${req.issue.id}`,(err,row)=>{
                if(err){
                    next(err);
                } else{
                    res.status(200).send( { issue: row });
                }
                
            })
        }}) 
});

issuesRouter.delete('/:issueId',(req,res,next)=>{
    db.run(`DELETE FROM Issue WHERE id = $id`,{ $id: req.issue.id}, function(err){
        if(err){
            next(err);
        }
            res.sendStatus(204);
        })
});

module.exports = issuesRouter;