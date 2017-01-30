import React from 'react';
import ReactDOM from 'react-dom';


const DefaultRenderSize = {width: 800, height: 600};

export default class SphereRender extends React.Component {
  render() {
    const {width, height} = this.props.renderSize || DefaultRenderSize;
    if (this.controls) {
      this.controls.autoRotate = this.props.autoRotate;
    }
    if (this.renderer) {
      this.renderer.setSize(width, height, true);
    }
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.fov    = this.props.fov;
      this.camera.updateProjectionMatrix();
    }
    if (this.props.deviceId) {
      this.attachDevice(this.props.deviceId);
    }
    return(<div className={this.props.srStyle || 'sphereRender'} />)
  }

  attachDevice(deviceId) {
    navigator.mediaDevices.getUserMedia({
      video: deviceId ? { optional: [{ sourceId: deviceId }] }: true
    }).then((stream)=>{
      this.start(stream);
    });
  }

  start(stream) {
    if (this.video) {
      this.video.pause();
      this.video.setAttribute('src', window.URL.createObjectURL(stream));
      this.video.load();
      this.video.play();
      return;
    }

    const this_element = ReactDOM.findDOMNode(this);
    if (!this_element) {
      setTimeout(()=>{
        this.start(stream);
      }, 100);
      return;
    }

    // create the video tag
    this.video = this_element.appendChild(document.createElement('video'));
    this.video.style = "display: none";
    this.video.src = window.URL.createObjectURL(stream);

    // create a scene
    const scene = new THREE.Scene();

    // attach the video to a texture
    const videoTexture = new THREE.Texture(this.video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    // create a sphere at the origin textured on the inside by the video
    const sphere = new THREE.SphereGeometry(50, 80, 40, 0),
        material = new THREE.MeshBasicMaterial({ map: videoTexture, overdraw: true, side: THREE.FrontSide});
    sphere.scale(-1, 1, 1);
    scene.add(new THREE.Mesh(sphere, material));

    // setup a light and camera inside the sphere
    const {width, height} = this.props.renderSize || DefaultRenderSize;
    const light = new THREE.AmbientLight(0xFFFFFF);
    this.camera = new THREE.PerspectiveCamera(this.props.fov, width / height, 1, 1000);

    scene.add(light);
    scene.add(this.camera);

    // controls for rotating around the origin
    this.controls = new THREE.OrbitControls(this.camera, this_element);
    this.controls.autoRotate = this.props.autoRotate;
    // invert rotation because we're inside the sphere
    this.controls.rotateSpeed = -1.0;
    // camera needs to move off origin to see panning effect
    this.camera.position.z = 1;

    // render
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(width, height, true);
    this_element.appendChild(this.renderer.domElement);

    const self = this;
    (function render() {
      requestAnimationFrame(render);
      self.controls.update();

      // update the video texture
      if (self.video.readyState === self.video.HAVE_ENOUGH_DATA) {
        videoTexture.needsUpdate = true;
      }
      self.renderer.render(scene, self.camera);
    })();
  }
}
