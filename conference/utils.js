var db = require('./database');

module.exports.toHour = function(minutes) {
    var hours = minutes/60;
    minutes = minutes % 60;

    if(minutes < 10) {
        minutes = '0' + minutes;
    }

    return parseInt(hours) + ':' + minutes;
}

module.exports.duration2number = function (durationString) {
    if(durationString == 'lightning') return 5;

    var number = "";
    for(var i = 0; i < durationString.length; i++) {
        if(!isNaN(parseInt(durationString[i]))) number += durationString[i];
    }
    return parseInt(number);
}

module.exports.number2duration = function (number) {
    if(number == 5) return 'lightning';

    return number + 'min';
}

module.exports.formatTracks = function(tracks) {
    for(var i = 0; i < tracks.length; i++) {
        var track = tracks[i];

        for(var j = 0; j < tracks[i].talks.length; j++) {
            var talk = track.talks[j];

            tracks[i].talks[j] = {
                'title': talk.title, 
                'duration': talk.duration ? this.number2duration(talk.duration) : "",
                'beginTime': this.toHour(talk.beginTime)
            }
        }
    }
    return tracks;
}

module.exports.sortTalksByDuration = function(talks, begin, end) {
    var m = parseInt((begin + end)/2);
    var pivot = talks[m];
    var i = begin;
    var j = end;

    while(i <= j) {
        while(talks[i].duration > pivot.duration) i++;
        while(pivot.duration > talks[j].duration) j--;
        
        if(i <= j) {
            swap(talks, i, j);
            i++;
            j--;
        }
    }

    if(begin < j) talks = this.sortTalksByDuration(talks, begin, j);
    if(i < end) talks = this.sortTalksByDuration(talks, i, end);

    return talks;
}

function swap(a, i, j) {
    var aux = a[i];
    a[i] = a[j];
    a[j] = aux;
}

module.exports.generateTracks = function(talks, callback) {
    return db.lastId(function(id) {
        var tracks = [];

        id++;
        while(talks.length > 0) {
            tracks.push(generateTrack(talks, id++));
        }
        return callback(tracks);    
    });
}

function generateTrack(talks, id) {
    var morningSession = generateSession(talks, 9, 12, id);
    var lunch = {'title': 'Almoço', 'duration': 60, 'beginTime': 720};
    db.insertTrack(id, lunch);
    var afternoonSession = generateSession(talks, 13, 17, id);
    var networkingEvent = {'title': 'Evento de Networking', 'beginTime': 1020};
    return {'id': id, 'talks': morningSession.concat(lunch, afternoonSession, networkingEvent)};
}

function generateSession(talks, beginHour, endHour, trackId) {
    var nextTalkTime = beginHour*60;
    var bagSize = (endHour - beginHour)*60;
    var bag = [];
    var i = 0;

    while(i < talks.length) {
        if(talks[i].duration <= bagSize) {
            talks[i].beginTime = nextTalkTime;
            bag.push(talks[i]);
            db.insertTrack(trackId, talks[i]);
            
            bagSize -= talks[i].duration;
            nextTalkTime += talks[i].duration;
            talks.splice(i, 1);
        } else i++;
    }

    return bag;
}

module.exports.printTracks = function(tracks) {
    tracks.forEach(track => {
        console.log('Track ' + String.fromCharCode(64 + track.id) + ':');
        track.talks.forEach(talk => {
            var begin = this.toHour(talk.beginTime);
            var duration = talk.duration ? this.number2duration(talk.duration) : '';
            console.log(begin + ' ' + talk.title + ' ' + duration);
        });
    });
}

module.exports.db2json = function(tracks) {
    var json = [];
    var lastTrackId = 0;

    while(tracks.length > 0) {
        var track = tracks.shift();

        if(lastTrackId != track.track_id) {
            if(json[lastTrackId-1])
                json[lastTrackId-1].talks.push({'title': 'Evento de Networking', 'beginTime': 1020});

            lastTrackId = track.track_id;
            json[lastTrackId-1] = {'id': lastTrackId, 'talks': []};
        }

        json[lastTrackId-1].talks.push({
            'title': track.title, 
            'duration': this.number2duration(track.duration), 
            'beginTime': this.toHour(track.beginTime)
        });
    }
    json[json.length-1].talks.push({'title': 'Evento de Networking', 'beginTime': "17:00"});

    return json;
}