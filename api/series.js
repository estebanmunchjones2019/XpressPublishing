const express = require('express');
const sqlite3 = require('sqlite3');
const {checkSeries} = require('./utils');
const {checkIssue2} = require('./utils');
const issuesRouter = require('./issues');

const seriesRouter = express.Router();
const db = new sqlite3.Database( process.env.TEST_DATABASE || './database.sqlite'); // ./database.sqlite should be ../database.sqlite because the 2 files aren't in the some directory. But it works :S



seriesRouter.param('seriesId',(req,res,next,seriesId)=>{ // seriesRouter.param should be above the rest of the route handlers
    db.get(`SELECT * FROM Series WHERE id = $seriesId`,{ $seriesId: seriesId },(err,series)=>{
        if(err){
            next(err);
        }else if(series){
            req.series = series;
            next(); 
        } else {
            res.sendStatus(404);
        }
    })
});

seriesRouter.use('/:seriesId/issues',issuesRouter);

seriesRouter.get('/',(req,res,next)=>{
    db.all(`SELECT * FROM Series`, (err,series)=>{
        if(err){
            next(err);
        } else {
            res.status(200).send({ series: series });
        }
    })
});

seriesRouter.get('/:seriesId',(req,res,next)=>{
    res.status(200).send( {series: req.series });
});

seriesRouter.post('/',checkSeries, (req,res,next)=>{
    const name = req.body.series.name;
    const description = req.body.series.description;
    const sql = `INSERT INTO Series (
        name, description) 
        VALUES (
        $name, $description)`;
    const values = {
        $name: name, $description: description
    };
    db.run(sql, values, function(err){
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`,(err,series)=>{
                if(err){
                    next(err);
                } else {
                    res.status(201).send( { series: series });
                }
            })
        }
    })
});

seriesRouter.put('/:seriesId', checkSeries, (req,res,next)=>{
    const name = req.body.series.name;
    const description = req.body.series.description;
    const sql = `UPDATE Series SET name = $name, description = $description WHERE id = $id`;
    const values = { $name: name, $description:description, $id: req.series.id}
    db.run(sql, values, function(err){
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${req.series.id}`,(err,series)=>{
                if(err){
                    next(err);
                } else {
                    res.status(200).send( { series: series });
                }
            })
        }
    })
});

seriesRouter.delete('/:seriesId', checkIssue2,(req,res,next)=>{
    const sql = `DELETE FROM Series WHERE id = $id`;
    const value = {
        $id: req.series.id
    };
    db.run(sql, value, function(err){
        if(err){
            next(err);
        }else{
            res.sendStatus(204);
        }      
    })
});

module.exports = seriesRouter;