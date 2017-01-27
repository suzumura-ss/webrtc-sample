import React from 'react';
import ReactDOM from 'react-dom';
import {InputGroup, FormControl, Button} from 'react-bootstrap';
import ClipboardButton from 'react-clipboard.js';
import ReactTooltip from 'react-tooltip';
import SphereRender from './sphereRender';


class WebRTC extends React.Component {
  constructor() {
    super();
    this.state = {
      roomId: ''
    }
  }

  connect() {
    window.location.hash = this.roomId;
    this.call = this.peer.call(this.roomId, this.streamOut);
    this.call.on('stream', (streamIn)=>{
      console.log('connect.onStream');
      this.refs.videoOther.start(streamIn);
    });
  }

  componentDidMount() {
    navigator.mediaDevices.getUserMedia({video: true}).then((streamOut)=>{
      const self = this;
      setTimeout(()=>{
        self.refs.videoSelf.start(streamOut);
        self.streamOut = streamOut;
      }, 1000);
    });
    this.peer = new Peer({key: this.props.skyway, debug: 3});
    this.peer.on('open', (roomId)=>{
      console.log('componentDidMount.onOpen');
      this.setState((prevState, props)=>{
        return {roomId};
      });
    });
    this.peer.on('call', (call)=>{
      // Answer the call, providing our mediaStream
      console.log('componentDidMount.onCall');
      call.answer(this.streamOut);
      call.on('stream', (streamIn)=>{
        console.log('componentDidMount.onCall.onStream');
        this.refs.videoOther.start(streamIn);
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
    if (this.props.roomId) {
      this.roomId = this.props.roomId;
    }
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
                <SphereRender ref='videoSelf'  renderSize={{width:400, height:300}} />
              </td>
              <td>
                <SphereRender ref='videoOther' renderSize={{width:400, height:300}} />
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
