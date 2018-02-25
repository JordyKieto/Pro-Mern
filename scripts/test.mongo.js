var db = new Mongo().getDB("playground");

printjson(db.employees.find().pretty());