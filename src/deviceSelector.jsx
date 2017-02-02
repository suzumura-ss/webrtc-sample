import React from 'react';
import {DropdownButton, MenuItem} from 'react-bootstrap';


export default class DeviceSelector extends React.Component {
  constructor() {
    super();
    this.state = {devices: null, audios: null, current: ''};
  }

  componentDidMount() {
    this.interval = setInterval(()=>{
      this.updateDeviceList();
    }, 5000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  trimDeviceLabel(label) {
    return label.replace(/ \([\w\d\:]+\:[\w\d\/]+\)/, '') || 'Default';
  }

  updateDeviceList(selectDefault) {
    const self = this;
    navigator.mediaDevices.enumerateDevices().then((devices)=>{
      const videos = devices.filter(device => device.kind === 'videoinput').sort((a,b)=>(a.label>b.label)? 1: 0)
      const audios = videos.map((device)=>{
        return [device.deviceId, devices.find(dev=> dev.kind === 'audioinput' && this.trimDeviceLabel(dev.label) === this.trimDeviceLabel(device.label) )];
      }).reduce((s, d)=>{
        const videoDeviceId = d[0],
              audioDevice   = d[1];
        if (audioDevice) {
          s[videoDeviceId] = audioDevice;
        }
        return s;
      }, {});
      return [videos, audios];
    }).then((devices)=>{
      self.setState((prevState, props)=>{
        return {devices: devices[0], audios: devices[1]};
      });
    });
  }

  selectDevice(label, deviceId) {
    this.setState((prevState, props)=>{
      return {device: this.trimDeviceLabel(label)};
    });
    if (deviceId) {
      const audio = this.state.audios[deviceId];
      this.props.onSelectDevice(label, deviceId, audio ? audio.deviceId : null);
    }
  }

  render() {
    let devs;
    if (!this.state.devices) {
      this.updateDeviceList(true);
      devs = (<MenuItem header>Loading</MenuItem>)
    } else {
      devs = this.state.devices.map((device, index)=>{
        return (<MenuItem key={index} onClick={()=>{this.selectDevice(device.label, device.deviceId)}}>{this.trimDeviceLabel(device.label)}</MenuItem>);
      });
    }
    return (
      <DropdownButton title={this.state.device || 'Select Camera'} id="deviceList">
        {devs}
        <MenuItem divider />
        <MenuItem key="reload" onClick={()=>{this.updateDeviceList()}}>Reload</MenuItem>
      </DropdownButton>
    );
  }
}
