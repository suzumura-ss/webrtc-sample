import React from 'react';
import ReactDOM from 'react-dom';
import {InputGroup, FormControl, Button} from 'react-bootstrap';


class WebRTC extends React.Component {
  constructor() {
    super();
    this.state = {
      roomId: ''
    }
  }

  connect() {
    navigator.mediaDevices.getUserMedia({video: true}).then((streamOut)=>{
      this.refs.videoSelf.src = URL.createObjectURL(streamOut);
      this.call = this.peer.call(this.roomId, streamOut);
      this.call.on('stream', (streamIn)=>{
        this.refs.videoOther.src = URL.createObjectURL(streamIn);
      });
    });
  }

  open() {
    this.peer = new Peer({key: this.props.skyway, debug: 3});
    this.peer.on('open', (roomId)=>{
      console.log('listen.onOpen');
      this.setState((prevState, props)=>{
        console.log('listen.setState');
        return {roomId};
      });
    });
    this.peer.on('call', (call)=>{
      console.log('listen.onCall');
      // Answer the call, providing our mediaStream
      navigator.mediaDevices.getUserMedia({video: true}).then((streamOut)=>{
        console.log('listen.call.onStreamOut');
        this.refs.videoSelf.src = URL.createObjectURL(streamOut);
        call.answer(streamOut);
      });
      call.on('stream', (streamIn)=>{
        console.log('listen.call.onStream');
        this.refs.videoOther.src = URL.createObjectURL(streamIn);
      });
    });
  }

  render() {
    if (!this.peer) {
      this.open();
    }
    return(
      <div>
        <InputGroup>
          <InputGroup>
            <InputGroup.Addon>room ID</InputGroup.Addon>
            <FormControl type='text' value={this.state.roomId} placeholder='share on listen' />
          </InputGroup>
          <InputGroup>
            <FormControl ref='roomId' type='text' placeholder='roomId' onChange={(ev)=>{this.roomId = ev.target.value}} />
            <InputGroup.Button><Button onClick={()=>this.connect()} >CALL</Button></InputGroup.Button>
          </InputGroup>
        </InputGroup>
        <video ref='videoSelf'  autoPlay muted={true} className='video-self'></video>
        <video ref='videoOther' autoPlay muted={true} className='video-other'></video>
      </div>
    );
  }
}


ReactDOM.render(
  <WebRTC skyway='d4137abc-6c4b-4c26-b8ec-a692a70cb971'/>,
  document.getElementById('application')
);
