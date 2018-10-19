import React, { Component } from 'react'

import Wrap from './Wrap'
import ClearColor from './ClearColor'
import VedioDemo from './VedioDemo'
import RotatingCube from './RotatingCube'
import Primer from './Primer'
import Colors from './Colors'
import Many from './Many'
import Transform from './Transform'
import UseIBO from './UseIBO'
import Torus from './Torus'
import DirectionalLight from './DirectionalLight'
import SpecularLight from './SpecularLight'
import PhongShading from './PhongShading'
import PointLight from './PointLight'
import Texture from './Texture'
import Scene from './three/Scene'
import './App.css'

class Menu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      demo: <ClearColor />
    }
  }
  setDemo(demo) {
    this.setState({ demo })
  }
  render() {
    return (
      <div className="wrap">
        <ul className="menuList">
          <button onClick={() => this.setDemo(<ClearColor />)}>ClearColor</button>
          <button onClick={() => this.setDemo(<VedioDemo />)}>VedioDemo</button>
          <button onClick={() => this.setDemo(<RotatingCube />)}>RotatingCube</button>
          <button onClick={() => this.setDemo(<Primer />)}>Primer</button>
          <button onClick={() => this.setDemo(<Colors />)}>Colors</button>
          <button onClick={() => this.setDemo(<Many />)}>Many</button>
          <button onClick={() => this.setDemo(<Transform />)}>Transform</button>
          <button onClick={() => this.setDemo(<UseIBO />)}>UseIBO</button>
          <button onClick={() => this.setDemo(<Torus />)}>Torus</button>
          <button onClick={() => this.setDemo(<DirectionalLight />)}>DirectionalLight</button>
          <button onClick={() => this.setDemo(<SpecularLight />)}>SpecularLight</button>
          <button onClick={() => this.setDemo(<PhongShading />)}>PhongShading</button>
          <button onClick={() => this.setDemo(<PointLight />)}>PointLight</button>
          <button onClick={() => this.setDemo(<Texture />)}>Texture</button>
        </ul>
        <Wrap demo={this.state.demo} />
        <ul>
          <button onClick={() => this.setDemo(<Scene />)}>Scene</button>
        </ul>
      </div>
    )
  }
}

export default Menu
