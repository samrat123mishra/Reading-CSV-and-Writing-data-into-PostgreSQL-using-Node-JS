'use strict';
var bodyParser = require('body-parser')
const fs = require('fs');
const csv = require('fast-csv');
const pg = require('pg');
const copyTo = require('pg-copy-streams').to;
const conString = "postgres://rnl03devnodejs:rnl03devnodejs@localhost:5432/postgres";
const client = new pg.Client(conString);
const Promise = require('bluebird');
const limit = 10;
let writePromiseQueue = [];
client.connect();
class ReadCSVData {
    constructor() {

    }
    readCSV(fileName) { 
        fs.createReadStream(fileName)
            .pipe(csv())
            .on('data', (data) => {
                //console.log(data);
                writePromiseQueue.push(this.writeData(data));
            })
            .on('end', (data) => {
                // console.log(writePromiseQueue);
                Promise.all(writePromiseQueue)
                    .then(data => {
                        this.copyData();
                        console.log('read and write finished');
                    }, err => {
                        console.error('Unsuccessful read and write operation');
                    })
                    .catch(err => {
                        console.error('Exception Caught');
                    });
            });
    }

    writeData(data) {
        return new Promise((resolve, reject) => {
            let insertQuery = `INSERT INTO test.student(school,name,place) values(
                            ${
                data.map(v => {
                    return "$$" + v + "$$";
                }).join()
                })`;
            console.log(insertQuery);
            client.query(insertQuery, (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    return;
                }
                resolve(result);
            });
        });
    }
    copyData() {
        for (var k = 0; k < (writePromiseQueue.length) / limit; k++) {
            if (k === 0) {
                let insertQueryToOtheTable = `INSERT INTO test.student1 SELECT * FROM test.student LIMIT ${limit}`;
                console.log(insertQueryToOtheTable);
                client.query(copyTo(insertQueryToOtheTable));
            } else {
                let insertQueryToOtheTable = `INSERT INTO test.student1 SELECT * FROM test.student LIMIT 10 OFFSET ${k * limit}`;
                console.log(insertQueryToOtheTable);
                client.query(copyTo(insertQueryToOtheTable));
            }

        }

    }
}
module.exports = ReadCSVData;