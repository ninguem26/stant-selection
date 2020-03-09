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
    //var lunch = {'title': 'Almoço', 'duration': 60, 'beginTime': 720};
    //db.insertTrack(id, lunch);
    var afternoonSession = generateSession(talks, 13, 17, id);
    var networkingEvent = {'title': 'Evento de Networking', 'beginTime': 1020};
    //return {'id': id, 'talks': morningSession.concat(lunch, afternoonSession, networkingEvent)};
    return {'id': id, 'talks': morningSession.concat(afternoonSession)};
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

module.exports.printSession = function(talks, beginHour, endHour) {
    var bagSize = (endHour - beginHour)*60;
    var i = 0;

    while(i < talks.length) {
        if(talks[i].duration <= bagSize) {
            var begin = this.toHour(talks[i].beginTime);
            var duration = talks[i].duration ? this.number2duration(talks[i].duration) : '';
            console.log(begin + ' ' + talks[i].title + ' ' + duration);
            
            bagSize -= talks[i].duration;
            talks.splice(i, 1);
        } else i++;
    }
}

module.exports.printTracks = function(tracks) {
    var i = 0;
    if(tracks.length > 0) {
        tracks.forEach(track => {
            console.log('Track ' + String.fromCharCode(65 + i++) + ':');
            this.printSession(track.talks, 9, 12);
            console.log('12:00 Almoço 60min');
            this.printSession(track.talks, 13, 17);
            console.log('17:00 Evento de Networking');    
        });
    } else {
        console.log('Track A:');
        console.log('12:00 Almoço 60min');
        console.log('17:00 Evento de Networking');
    }
}

module.exports.db2json = function(tracks) {
    var json = [];
    var trackId = 1;
    var netEvent = {'title': 'Evento de Networking', 'beginTime': 1020}

    while(tracks.length > 0) {
        var track = tracks.shift();

        if(trackId != track.track_id) {
            //json[trackId-1].talks.push(netEvent);
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
    //if(json.length > 0) json[json.length-1].talks.push(netEvent);

    return json;
}