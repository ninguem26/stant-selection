var express = require('express');
var fileupload = require('express-fileupload');
var fs = require('fs');
var utils = require('./utils.js');
var db = require('./database');

var app = express();

const maxSessionTime = 240;

db.init();

app.use(fileupload({
    parseNested: true
}));

// GET all tracks from the database
app.get("/tracks", (req, res, next) => {
    db.getTracks(function(tracks) {
        res.json({'tracks': utils.db2json(tracks)});
    });
});

// POST new tracks to the tracks database
app.post('/tracks', (req, res, next) => {
    var file = req.body.proposals;
    file = JSON.parse(file);
    fs.writeFileSync('./uploads/proposals.txt', file.data);

    var proposals = fs.readFileSync('./uploads/proposals.txt', 'utf-8').split('\n');
    var talks = [];

    proposals.forEach(function(p) {
        var terms = p.split(' ');
        var duration = utils.duration2number(terms.pop());
        var title = terms.join(' ');

        if(duration <= maxSessionTime) 
            talks.push({'title': title, 'duration': duration});
    });

    talks = utils.sortTalksByDuration(talks, 0, talks.length-1)
    utils.generateTracks(talks, function(tracks) {
        res.json({'tracks': tracks});
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});