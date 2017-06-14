'use strict';

const express = require('express');
var bodyParser = require('body-parser')
// const fs = require('fs');
// const csv = require('fast-csv');
 const pg = require('pg');
// const copyTo = require('pg-copy-streams').to;
 const conString = "postgres://rnl03devnodejs:rnl03devnodejs@localhost:5432/postgres";
 const client = new pg.Client(conString);
// const Promise = require('bluebird');
// const limit = 10;
// let writePromiseQueue = [];
var http = require("http");
var app = express();
var server = http.createServer(app);
let port = 3006;
let ReadCSVData = require('./operation.js');
server.listen(port, () => {
    console.log('Express server is running on port:' + port);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', (req, res, next) => {
    res.status(200);
    res.send("hello");
});

app.post('/importcsv', (req, res, next) => {
    var obj = new ReadCSVData();
    try {
        obj.readCSV(req.body.fileName);
        res.status(200);
        res.send({ msg: "processing File " + req.body.fileName });
    } catch (err) {
        res.status(500);
        console.log(err);
        res.send(err);
    }
});
