var mysql = require('mysql');

var con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stant'
});

function init() {
  con.connect(function(err) {
    if (err) throw err;
  
    var sql = 'CREATE TABLE IF NOT EXISTS tracks (' +
      'id INT PRIMARY KEY AUTO_INCREMENT,' +
      'track_id INT NOT NULL,' +
      'title VARCHAR(255) NOT NULL,' +
      'duration INT NOT NULL,' +
      'beginTime INT NOT NULL);';
  
    con.query(sql, function (err, result) {
      if (err) throw err;
    });
  });
}

function insertTrack(trackId, talk) {
  var sql = 'INSERT INTO tracks  (track_id, title, duration, beginTime)' + 
            'VALUES ("'+trackId+'","'+talk.title+'","'+talk.duration+'","'+talk.beginTime+'")';
  con.query(sql, function (err, result) {
    if (err) throw err;
  });
}

function executeQuery(sql, callback) {
  con.query(sql, function (err, rows, fields) {
      if(err)
          callback(err);
      else
          callback(null, rows, fields);
  });
}

function lastId(callback) {
  return executeQuery('SELECT track_id AS trackId FROM tracks ORDER BY id DESC', function(err, results, fields) {
    if(!err) {
      if(results[0]) 
        return callback(results[0].trackId);
      else
      return callback(0);
    }
    else 
      console.log(err);
  });
}

function getTracks(callback) {
  return executeQuery('SELECT * FROM tracks', function(err, results, fields) {
    if(!err) {
      return callback(results);
    }
    else 
      console.log(err);
  });
}

module.exports = {
    con : con,
    init : init,
    insertTrack : insertTrack,
    lastId : lastId,
    getTracks : getTracks
}