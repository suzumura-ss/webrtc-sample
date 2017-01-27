import React from 'react';
import ReactDOM from 'react-dom';
import {InputGroup, FormControl, Button} from 'react-bootstrap';
import ClipboardButton from 'react-clipboard.js';
import ReactTooltip from 'react-tooltip';


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

  componentDidMount() {
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

  getText() {
    return this.state.roomId;
  }
  onCopyToClipboard() {
    const tt = ReactDOM.findDOMNode(this.refs.copiedTop);
    ReactTooltip.show(tt);
    setTimeout(()=>{
      ReactTooltip.hide(tt);
    }, 3000);
  }

  render() {
    const hideMyRoom = (this.props.roomId)? {display: 'none'}: {}
    return(
      <div>
        <InputGroup>
          <InputGroup>
            <InputGroup.Addon style={hideMyRoom}>Share my room ID</InputGroup.Addon>
            <FormControl style={hideMyRoom} type='text' value={this.state.roomId} readOnly />
            <InputGroup.Addon style={hideMyRoom} ref='copiedTop' data-tip='Copied' data-event='null'>
              <ClipboardButton className='clippy' option-text={()=>this.getText()} onSuccess={()=>this.onCopyToClipboard()}>
                <img src='./assets/svg/clippy.svg' />
              </ClipboardButton>
            </InputGroup.Addon>
            <FormControl ref='roomId' type='text' placeholder='Or Enter room Id' defaultValue={this.props.roomId} onChange={(ev)=>{this.roomId = ev.target.value}} />
            <InputGroup.Button><Button bsStyle='primary' onClick={()=>this.connect()} >CALL</Button></InputGroup.Button>
          </InputGroup>
          <ReactTooltip effect='solid' />
        </InputGroup>
        <table>
          <tbody>
            <tr>
              <td>Me</td>
              <td>Destination</td>
            </tr>
            <tr>
              <td>
                <video ref='videoSelf'  autoPlay muted={true} className='video-self'></video>
              </td>
              <td>
                <video ref='videoOther' autoPlay muted={true} className='video-other'></video>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}


ReactDOM.render(
  <WebRTC skyway='d4137abc-6c4b-4c26-b8ec-a692a70cb971' roomId={window.location.hash.substr(1)}/>,
  document.getElementById('application')
);
