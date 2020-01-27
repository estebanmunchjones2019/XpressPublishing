const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');
const apiRouter = require('./api/api');

const app = express();
const PORT = process.env.PORT || 4001;

app.use('/api',apiRouter);

app.use(bodyParser.json(),cors(),morgan('dev'));
if (process.env.NODE_ENV === 'development') {
    // only use in development
    app.use(errorhandler())
  }

app.listen(PORT,()=>{
    console.log(`server listening on port: ${PORT}`);
});

module.exports = app;
