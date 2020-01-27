const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');
const apiRouter = require('./api/api');

const app = express();
const PORT = process.env.PORT || 4000;

//it's important to follow a specific order of app.use
app.use(express.static('./'));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/api',apiRouter);



if (process.env.NODE_ENV === 'development') { // the errorhandler middleware should be the last middleware on the list. The order matters!
    // only use in development
    app.use(errorhandler());
  }

app.listen(PORT,()=>{
    console.log(`server listening on port: ${PORT}`);
});

module.exports = app;
