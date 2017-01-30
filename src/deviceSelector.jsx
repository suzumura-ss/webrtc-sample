import React from 'react';
import {DropdownButton, MenuItem} from 'react-bootstrap';


export default class DeviceSelector extends React.Component {
  constructor() {
    super();
    this.state = {devices: null, current: ''};
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
    return label.replace(/ \([\w\d\:]+\:[\w\d\/]+\)/, '');
  }

  updateDeviceList(selectDefault) {
    const self = this;
    navigator.mediaDevices.enumerateDevices().then((devices)=>{
      return devices.filter(device => device.kind === 'videoinput').sort((a,b)=>(a.label>b.label)? 1: 0)
    }).then((devices)=>{
      self.setState((prevState, props)=>{
        return {devices};
      });
    });
  }

  selectDevice(label, deviceId) {
    this.setState((prevState, props)=>{
      return {device: this.trimDeviceLabel(label)};
    });
    if (deviceId) {
      this.props.onSelectDevice(label, deviceId);
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
