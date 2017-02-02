import React from 'react';
import ReactDOM from 'react-dom';
import {InputGroup, FormControl, Button, Grid, Row, Col} from 'react-bootstrap';
import ClipboardButton from 'react-clipboard.js';
import ReactTooltip from 'react-tooltip';
import SphereRender from './sphereRender';
import DeviceSelector from './deviceSelector';


class WebRTC extends React.Component {
  constructor() {
    super();
    this.state = {
      roomId: '',
      deviceLabel: ''
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

  onSelectDevice(deviceLabel, videoDeviceId, audioDeviceId) {
    const video = { optional:[ {sourceId: videoDeviceId} ] },
          audio = audioDeviceId ? { optional:[ {sourceId: audioDeviceId} ] } : true;
    navigator.mediaDevices.getUserMedia({video, audio}).then((streamOut)=>{
      this.streamOut = streamOut;
      const videoTrack = streamOut.getVideoTracks()[0],
            audioTrack = streamOut.getAudioTracks()[0],
            videoLabel = videoTrack ? videoTrack.label : undefined,
            audioLabel = audioTrack ? audioTrack.label : undefined;
      this.setState((prevState, props)=>{
        return {deviceLabel, videoLabel, audioLabel};
      });
      this.refs.videoSelf.start(streamOut);
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
    let hideDeviceList, hideControlls;
    if (this.state.deviceLabel) {
      hideDeviceList = {display: 'none'}
      hideControlls  = {}
      console.log({video: this.state.videoLabel, audio: this.state.audioLabel});
    } else {
      hideDeviceList = {}
      hideControlls  = {display: 'none'}
    }
    return(
      <div>
        <div style={hideDeviceList}>
          <DeviceSelector onSelectDevice={(label, videoDeviceId, audioDeviceId)=>this.onSelectDevice(label, videoDeviceId, audioDeviceId)} />
        </div>
        <InputGroup style={hideControlls}>
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
        <Grid>
          <Row>
            <Col xs={12} sm={6} >
              <SphereRender ref='videoSelf'  renderSize={{width:345, height:290}} />
            </Col>
            <Col xs={12} sm={6} >
              <SphereRender ref='videoOther' renderSize={{width:345, height:290}} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}


ReactDOM.render(
  <WebRTC skyway='d4137abc-6c4b-4c26-b8ec-a692a70cb971' roomId={window.location.hash.substr(1)}/>,
  document.getElementById('application')
);
