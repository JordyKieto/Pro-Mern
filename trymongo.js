'use strict';
// All calls to driver are async, deal with it using;
//      callbacks paradigm
//      promises
//      co module & generator functions
const MogoClient = require('mongodb');

// command line arguments are available in the array process.argv

function usage() {
    console.log('Usage:');
    console.log('node', __filename, '<option>');
    console.log('Where option is one of:');
    console.log('   callbacks   Use the callbacks paradigm')
    console.log('   promises    Use the Promises paradigm')
    console.log('   generator   Use the Generator paradigm')
    console.log('   async       Use the async module')
}

if (process.argv.length < 3) {
    console.log("Incorrect number of arguments");
    usage();
} else {
    if (process.argv[2] === 'callbacks') {
        testWithCallbacks();
    } else if (process.argv[2] === 'promises') {
        testWithPromises();
    } else if (process.argv[2] === 'generator') {
        testWithGenerator();
    } else if (process.argv[2] === 'async') {
        testWithAsync();
    } else {
        console.log("Invalid option:", process.argv[2]);
        usage();
    }
}

// callbacks are the oldest way od dealing with async code
// first param expects errors, second expects results of operation

// the problem with this paradigm is how deeply nested it becomes as you chain methods
// callback hell brings also has alot of repeating

function testWithCallbacks() {
    MongoClient.connect('mongodb://localhost/playground', function(err, db) {
        db.collection('employees').insertOne({id: 1, name: 'A. Callback'},
        function(err, result) {
            console.log("Result of insert:", result.insertId);
            db.collection('employees').find({id: 1}).toArray(function(err, docs) {
                console.log('Result of find:', docs);
                db.close();
            });
        });
    });
}

// promises allow nesting to be avoided, and the chain becomes seemingly sequential
// the result of every call is a promise, which you can attatch a then
// final catch() consumes ALL errors at ANY stage
function testWithPromises() {
    let db;
  MongoClient.connect('mongodb://localhost/playground').then(connection => { db = connection;
  // Read about the spread operator
 // return db.collection('employees')...
 insertOne({id: 1, name: 'B. Promises'});
    }).then(result => {
        console.log("Result of insert:", result.insertedId);
        return db.collection('employees').find({id: 1}).toArray();

    }).then(docs => {
       console.log('Result of find:', docs);
       db.close();
    }).catch(err => {
       console.log('ERROR', err);
    });
}

// ES2015 introduces generator functions that can be exited temporarily
// and called again. Exits are done using yield statement

// Between multiple calls, the function retains the execution state
// Declared using an asterisk after the function keyword like function*()

// A module called co takes advntage of generators & promises to make async look sequential
//    asks you to sequence the async calls within one function
//    then co module makes multiple calls to the function, where each
//    async step temporarily exits the function

function testWithGenerator() {
    const co = require('co');
    co(function*() {
        const db = yield MongoClient.connect('mongodb://localhost/playground');

   //     const result = yield db.collection('employees')...
   insertOne({id: 1,
        name: 'C. Generator'});
        console.log('Result of insert:', result.insertedId);

        const docs = yield db.collection('employees').find({id: 1}).toArray();
        console.log('Result of find:', docs);

        db.close();
    }).catch(err => {
        console.log('ERROR', err);
    });
}

// ever yieldy async call is preceeded by, which causes a temporary return from function
// after which the function can be continued from where it left off

// Async module is another way. 
//  waterfall lets you pipe the results of one asynchronous call into anther
//  takes an array of functions; each function is passed the results of previous and a callback
// EACH FUNCTION IN THE ARRAY MUST TAKE THIS CALLBACK
//      which takes an err and results as it's parametre
// Since all driver methods follow the same callback convention
// of error and results, it's easy to pass callbacks through the waterfall

function testWithAsync() {
    const async = require('async');
    let db;
    async.waterfall([
        // this is the callback function that we pass
        next => {
            MongoClient.connect('mongodb://localhost/playground', next)
        },
        (connection, next) => {
            db = connection;
            db.collection('employees').insertOne({id: 1, name: 'D. Async'}, next);
        },
        (insertResult, next) => {
            console.log('Insert result:', insertResult.insertedId);
            db.collection('employees').find({id: 1}).toArray(next);
        },
        (docs, next) => {
            console.log('Result of find:', docs);
            db.close();
            // only in the last function do we explicitely call the callback with a null
            next(null, 'All done');
        }
    ], (err, result) => {
        if(err)
            console.log('ERROR', err);
        else
            console.log(result);
    });
}