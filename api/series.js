const express = require('express');
const sqlite3 = require('sqlite3');
const {checkSeries} = require('./utils');
const {checkIssue2} = require('./utils');
const issuesRouter = require('./issues');

const seriesRouter = express.Router();
const db = new sqlite3.Database( process.env.TEST_DATABASE || './database.sqlite'); // ./database.sqlite should be ../database.sqlite because the 2 files aren't in the some directory. But it works :S



seriesRouter.param('seriesId',(req,res,next,seriesId)=>{ // seriesRouter.param should be above the rest of the route handlers
    db.get(`SELECT * FROM Series WHERE id = $seriesId`,{ $seriesId: seriesId },(err,row)=>{
        if(err){
            next(err);
        }else if(!row){
            return res.sendStatus(404);
        }
        req.series = row;
        next(); 
    })
});

seriesRouter.use('/:seriesId/issues',issuesRouter);

seriesRouter.get('/',(req,res,next)=>{
    db.all(`SELECT * FROM Series`, (err,rows)=>{
        if(err){
            next(err);
        }
        res.status(200).send({ series: rows});
    })
});

seriesRouter.get('/:seriesId',(req,res,next)=>{
    res.status(200).send( {series: req.series });
});

seriesRouter.post('/',checkSeries, (req,res,next)=>{
    const newSeries = req.body.series;
    db.run(`INSERT INTO Series (name, description) VALUES ($name, $description)`,{ $name: newSeries.name, $description: newSeries.description}, function(err){
        if(err){
            next(err);
        }
        db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`,(err,row)=>{
            if(err){
                next(err);
            }
            res.status(201).send( { series: row });
        })
    })
});

seriesRouter.put('/:seriesId', checkSeries, (req,res,next)=>{
    const newSeries = req.body.series;
    db.run(`UPDATE Series SET name = $name, description = $description WHERE id = $id`,{ $name: newSeries.name, $description: newSeries.description, $id: req.series.id}, function(err){
        if(err){
            next(err);
        }
        db.get(`SELECT * FROM Series WHERE id = ${req.series.id}`,(err,row)=>{
            if(err){
                next(err);
            }
            res.status(200).send( { series: row });
        })
    })
});

seriesRouter.delete('/:seriesId', checkIssue2,(req,res,next)=>{
    db.run(`DELETE FROM Series WHERE id = ${req.series.id}`, function(err){
        if(err){
            next(err);
        }else{
            res.sendStatus(204);
        }      
    })
});

module.exports = seriesRouter;