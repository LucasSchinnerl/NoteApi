sqlite3 = require('sqlite3').verbose();
fs = require('fs');

let db = null;

function main() {
	initDb();
	
	var express = require('express')
	, bodyParser = require('body-parser')
	var restapi = express.Router();
	
	restapi.use(bodyParser.json());
	
	restapi.route('/note')
		.get(noteGET)
		.post(notePOST)
	restapi.route('/note/:key')
		.get(noteGETkey)
		.put(notePUTkey)
		.delete(noteDELETEkey)
	server = express();
	server.use('/api/',restapi);
	server.listen(3000);
}
function noteGET(req,res){
	lLog("Alle Datensätze");
	db.all("SELECT ID, text FROM Note", function (err, rows) {
        if(err) {
            lLog(err);
        } else {
            var notes = [];
            rows.forEach(function(row) {
                var note = { "ID": row.ID, "value":row.text};
                notes.push(note);
            })
            res.json({ "notes":notes});
        }
	})
}
function notePOST(req,res){
	var text = req.body.text;
	db.serialize(() => {
	db.run("INSERT INTO Note(text) VALUES('"+text+"')");
	});
	res.json({"text":text});
}
function noteGETkey(req,res){
	var noteKey = req.params.key;
	lLog("Datensatz mit ID: "+noteKey+" wird angefordert");
	db.get("SELECT ID, text FROM Note WHERE ID = '"+noteKey+"'" , function (err, row) {
		if(err) {
			lLog(err);
		}
		else if(row == undefined){
			var note = ("Error: no value with key "+noteKey);
		}
		else{
			note = {"ID": row.ID, "value":row.text};
		}
		res.json({"note":note});
	
	})
	
}
function notePUTkey(req,res){
	var noteKey = req.params.key;
	var text = req.body.text;
	
	db.serialize(() => {
		db.run("INSERT OR REPLACE INTO Note ('ID', 'text') VALUES ('"+noteKey+"', '"+text+"')", function(err,row) {
			if(err) {
				lLog(err);
			}
		});
	});
	res.json("Updated");
	
}
function noteDELETEkey(req,res){
	var noteKey = req.params.key;
	lLog("Datensatz mit ID: "+noteKey+" löschen");
	if(noteKey!=undefined){
	db.serialize(() =>{
	db.run("DELETE FROM Note WHERE ID = '"+noteKey+"'" , function (err, row) {
		if(err) {
			lLog(err);
		}
	})
	})
	res.json("Complete");
	}
	else{
		res.json("Kein Datensatz mit dieser ID vorhanden");
	}
}

function lLog (message) {
	console.log("LOG: " , message);
}

function initDb() {
	lLog("Init of db goes here");
	db = new sqlite3.Database("data/db.sqlite");
//|int primary_key id|text note_text|;
if (!fs.existsSync("data/db.sqlite")){
	db.serialize(() => {
		db.run("CREATE TABLE IF NOT EXISTS 'Note'(ID INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL)");
		db.run("INSERT INTO Note(text) VALUES ('Testnote 1')");
		db.run("INSERT INTO Note(text) VALUES ('Testnote 2')");
		db.run("INSERT INTO Note(text) VALUES ('Testnote 3')");
});
}
else{
	lLog("Database already existend")
	db = new sqlite3.Database("data/db.sqlite");
	lLog("Loading DB2");
}
}
main();