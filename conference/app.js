var express = require('express');
var fileupload = require('express-fileupload');
var fs = require('fs');
var utils = require('./utils.js');
var db = require('./database');

var app = express();

db.init();

app.use(fileupload({
    parseNested: true
}));

app.get("/tracks", (req, res, next) => {
    db.getTracks(function(tracks) {
        res.json({'tracks': utils.db2json(tracks)});
    });
});

app.post('/tracks', (req, res, next) => {
    var file = req.files.proposals;
    
    fs.writeFileSync('./uploads/'+file.name, file.data);
    var proposals = fs.readFileSync('./uploads/'+file.name, 'utf-8').split('\n');
    var talks = [];

    proposals.forEach(function(p) {
        var terms = p.split(' ');
        var duration = utils.duration2number(terms.pop());
        var title = terms.join(' ');
        talks.push({'title': title, 'duration': duration});
    });

    talks = utils.sortTalksByDuration(talks, 0, talks.length-1)
    utils.generateTracks(talks, function(tracks) {
        utils.printTracks(tracks);
        res.json({'tracks': utils.formatTracks(tracks)});
    });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});