// to connect to the database from a Nodejs program
// mongoclient lets us act as client
const MongoClient = require('mongodb').MongoClient;
// the parameter tothe connect function is URL like string
// starting with mondodb:// followed by the server name & then database name

MongoClient.connect('mongodb://localhost/playground', function(err, db) {
    // once you aquire a connection call the colection() method
    // find() returns a cursor we can iterate over
    db.collection('employees').find().toArray(function(err, docs) {
        // notice how we can use Node again for console.log()
        console.log('Result of find:', docs);
        db.close();
    });
});

// all calls to driver are asynchronous 
// callbacks are provided to every MongoDB driver method