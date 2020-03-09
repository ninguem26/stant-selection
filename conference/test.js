var axios = require('axios');
var FormData = require('form-data');
var utils = require('./utils');

module.exports.getTracks = function() {
    axios.get('http://localhost:3000/tracks').then(function (response) {
        utils.printTracks(response.data.tracks);
  });
}
module.exports.postTracks = function() {
    var fileName = 'proposals2.txt';
    var formData = new FormData();
    var file = fs.readFileSync('./tests/'+fileName, 'utf-8');

    formData.append("proposals", JSON.stringify({'name': fileName, 'data': file}));
    axios.post('http://localhost:3000/tracks', formData, {
        headers: formData.getHeaders()
    }).then(function(response) {
        console.log(response.data);
        utils.printTracks(response.data.tracks);
    });
}