const express = require('express');
const sqlite3 = require('sqlite3');
const {checkSeries} = require('./utils');

const seriesRouter = express.Router();
const db = new sqlite3.Database( process.env.TEST_DATABASE || './database.sqlite'); // ./database.sqlite should be ../database.sqlite because the 2 files aren't in the some directory. But it works :S

seriesRouter.param('seriesId',(req,res,next,seriesId)=>{
    db.get(`SELECT * FROM Series WHERE id = $seriesId`,{ $seriesId: seriesId },(err,row)=>{
        if(err){
            next(err);
        }else if(!row){
            res.sendStatus(404);
        }
        req.series = row;
        next();
    })
});

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


module.exports = seriesRouter;