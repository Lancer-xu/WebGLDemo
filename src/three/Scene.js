import React, { Component } from 'react'
import { mat4, glMatrix } from 'gl-matrix'
import { matIV } from '../util/matIV'
import '../App.css'

import * as THREE from 'three'

class Scene extends Component {
  constructor(props) {
    super(props)
    this.canvas = null

    this.stop = this.stop.bind(this)
    this.start = this.start.bind(this)
    this.animate = this.animate.bind(this)
  }
  componentDidMount() {
    this.canvas = document.getElementById("canvas")

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setSize( window.innerWidth, window.innerHeight )
    document.body.appendChild(this.renderer.domElement)

    let geometry = new THREE.BoxGeometry(1, 1, 1)
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    this.cube = new THREE.Mesh(geometry, material)

    this.scene.add(this.cube)
    this.camera.position.z = 5

    this.start()
  }
  componentWillUnmount() {
    this.stop()
    document.body.removeChild(this.renderer.domElement)
  }
  start() {
    if (!this.frame) {
      this.frame = requestAnimationFrame(this.animate)
    }
  }
  stop() {
    cancelAnimationFrame(this.frame)
  }
  animate() {
    this.frame = requestAnimationFrame(this.animate)

    this.cube.rotation.x += 0.02
    this.cube.rotation.y += 0.02

    this.renderer.render(this.scene, this.camera)
  }
  render() {
    return (
      <div>
        <canvas id="canvas" width="800" height="600">
          Your browser does not support HTML5
        </canvas>
      </div>
    )
  }
}

export default Scene
