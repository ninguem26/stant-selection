var express = require('express');
var fileupload = require('express-fileupload');
var fs = require('fs');
var utils = require('./utils.js');
var app = express();

app.use(fileupload({
    parseNested: true
}));

app.get("/url", (req, res, next) => {
    res.json(["Tony","Lisa","Michael","Ginger","Food"]);
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
    talks = utils.generateTracks(talks);

    res.json({'talks': talks});
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});