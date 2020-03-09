var db = require('./database');

module.exports.toHour = function(minutes) {
    var hours = parseInt(minutes/60);
    minutes = minutes % 60;

    if(minutes < 10) minutes = '0' + minutes;
    if(hours < 10) hours = '0' + hours;

    return hours + ':' + minutes;
}

module.exports.duration2number = function(durationString) {
    if(durationString == 'lightning') return 5;

    var number = durationString.split('m');
    return parseInt(number[0]);
}

module.exports.number2duration = function(number) {
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
        do {
            tracks.push(generateTrack(talks, id++));
        } while(talks.length > 0);
        
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
    var i = 0;
    tracks.forEach(track => {
        console.log('Track ' + String.fromCharCode(65 + i++) + ':');
        track.talks.forEach(talk => {
            var begin = this.toHour(talk.beginTime);
            var duration = talk.duration ? this.number2duration(talk.duration) : '';
            console.log(begin + ' ' + talk.title + ' ' + duration);
        });
    });
}

module.exports.db2json = function(tracks) {
    var json = [];
    var trackId = 1;
    var netEvent = {'title': 'Evento de Networking', 'beginTime': 1020}

    while(tracks.length > 0) {
        var track = tracks.shift();

        if(trackId != track.track_id) {
            json[trackId-1].talks.push(netEvent);
            trackId = track.track_id;
        }

        if(!json[trackId-1])
            json[trackId-1] = {'id': trackId, 'talks': []};

        json[trackId-1].talks.push({
            'title': track.title, 
            'duration': track.duration, 
            'beginTime': track.beginTime
        });
    }
    json[json.length-1].talks.push(netEvent);

    return json;
}