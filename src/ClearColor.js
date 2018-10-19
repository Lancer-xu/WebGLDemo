import React, { Component } from 'react'
import './App.css'

let c_width = 0
let c_height = 0

class ClearColor extends Component {
  constructor(props) {
    super(props)
    this.checkKey = this.checkKey.bind(this)
  }
  componentDidMount() {
    this.getGLContext()
    window.onkeydown = this.checkKey
  }
  getGLContext() {
    let ctx = null
    let canvas = document.getElementById("canvas-element-id");
    // if (canvas == null) {
    //   alert("there is no canvas on this page")
    //   return
    // }
    let names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"]
    for (let i = 0; i < names.length; ++i) {
      try {
        ctx = canvas.getContext(names[i])
      }
      catch(e) {}
      if (ctx) break
    }
    return ctx
  }

  checkKey(ev) {
    let gl = this.getGLContext()
    switch(ev.keyCode){
      case 49: { // 1
        gl.clearColor(0.3, 0.7, 0.2, 1.0)
        this.clear(gl)
        break
      }
      case 50: { // 2
        gl.clearColor(0.3, 0.2, 0.7, 1.0)
        this.clear(gl)
        break
      }
      case 51:{ // 3
        let color = gl.getParameter(gl.COLOR_CLEAR_VALUE);
        // Don't get confused with the following line. It
        // basically rounds up the numbers to one decimal cipher
        //just for visualization purposes
        alert('clearColor = (' +
              Math.round(color[0]*10)/10 +
              ',' + Math.round(color[1]*10)/10+
              ',' + Math.round(color[2]*10)/10+')')
        window.focus()
        break
      }
    }
  }
  clear(ctx) {
    ctx.clear(ctx.COLOR_BUFFER_BIT)
    ctx.viewport(0, 0, c_width, c_height)
  }
  initWebGL() {
    // let gl = null
    // gl = this.getGLContext()
  }
  render() {
    return (
      <div>
        <canvas id="canvas-element-id" width="800" height="600">
          Your browser does not support HTML5
        </canvas>
        <p>请按１，２，３</p>
      </div>
    )
  }
}

export default ClearColor
