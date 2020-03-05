module.exports.duration2number = function (durationString) {
    if(durationString == 'lightning') return 5;

    var number = "";
    for(var i = 0; i < durationString.length; i++) {
        if(!isNaN(parseInt(durationString[i]))) number += durationString[i];
    }
    return parseInt(number);
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

module.exports.generateTracks = function(talks) {
    var tracks = [];
    var id = 1;

    while(talks.length > 0) {
        tracks.push(generateTrack(talks, id++));
    }
    return tracks;
}

function generateTrack(talks, id) {
    var morningSession = generateSession(talks, 9, 12);
    var afternoonSession = generateSession(talks, 13, 17);
    var lunch = {'title': 'Almoço', 'duration': 60, 'beginTime': 720};
    var networkingEvent = {'title': 'Evento de Networking', 'beginTime': 1020};
    return {'id': id, 'talks': morningSession.concat(lunch, afternoonSession, networkingEvent)};
}

function generateSession(talks, beginHour, endHour) {
    var nextTalkTime = beginHour*60;
    var bagSize = (endHour - beginHour)*60;
    var bag = [];
    var i = 0;

    while(i < talks.length) {
        if(talks[i].duration <= bagSize) {
            talks[i].beginTime = nextTalkTime;
            bag.push(talks[i]);
            
            bagSize -= talks[i].duration;
            nextTalkTime += talks[i].duration;
            talks.splice(i, 1);
        } else i++;
    }

    return bag;
}