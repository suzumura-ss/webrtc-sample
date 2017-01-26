const peer = new Peer({key: 'd4137abc-6c4b-4c26-b8ec-a692a70cb971', debug: 3});
navigator.mediaDevices.getUserMedia({video: true})
.then((streamOut)=>{
  $('#application').append("<div>onStreamOut</div>");
  $('#streamOut').prop('src', URL.createObjectURL(streamOut));
  var call = peer.call(window.location.hash.substr(1)||'node', streamOut);
  call.on('stream', (streamIn)=>{
    $('#application').append("<div>onStreamIn</div>");
    $('#streamIn').prop('src', URL.createObjectURL(streamIn));
  })
})
