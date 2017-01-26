const peer = new Peer({key: 'd4137abc-6c4b-4c26-b8ec-a692a70cb971', debug: 3});
peer.on('open', function(id) {
  console.log('My peer ID is: ' + id);
  $('#application').append("<div>" + id + "</div>");
});
peer.on('call', function(call) {
  // Answer the call, providing our mediaStream
  console.log('onCall', call);
  $('#application').append("<div>onCall</div>");
  navigator.mediaDevices.getUserMedia({video: true})
  .then((streamOut)=>{
    $('#streamOut').prop('src', URL.createObjectURL(streamOut));
    call.answer(streamOut);
    $('#application').append("<div>Answered</div>");
   });
   call.on('stream', (streamIn)=>{
     $('#application').append("<div>onStreamIn</div>");
     $('#streamIn').prop('src', URL.createObjectURL(streamIn));
   })
});
