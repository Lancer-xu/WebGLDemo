import React, { Component } from 'react'
import { mat4, glMatrix } from 'gl-matrix'
import './App.css'

let vertexShaderText = [
'precision mediump float;',
'',
'attribute vec3 vertPosition;',
'attribute vec3 vertColor;',
'varying vec3 fragColor;',
'uniform mat4 mWorld;',
'uniform mat4 mView;',
'uniform mat4 mProj;',
'',
'void main()',
'{',
'  fragColor = vertColor;',
'  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
'}',
].join('\n')

let fragmentShaderText = [
'precision mediump float;',
'',
'varying vec3 fragColor;',
'void main()',
'{',
'  gl_FragColor = vec4(fragColor, 1.0);',
'}',
].join('\n')

class RotatingCube extends Component {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    let gl = this.getGLContext()
    this.initDemo(gl)
  }
  getGLContext() {
    console.info('This is working')
    let canvas = document.getElementById("canvas")
    let gl = canvas.getContext('webgl')

    if (!gl) {
      console.log('WebGL not supported, falling back on experimental')
      gl = canvas.getContext('experimental-webgl')
    }

    if (!gl) {
      console.info('Your browser does not support WebGL')
    }

    return gl
  }
  initDemo(gl) {
    gl.clearColor(0.75, 0.85, 0.8, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.frontFace(gl.CWW)
    gl.cullFace(gl.BACK)

    // create shader
    
    let vertexShader = gl.createShader(gl.VERTEX_SHADER)
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

    gl.shaderSource(vertexShader, vertexShaderText)
    gl.shaderSource(fragmentShader, fragmentShaderText)

    gl.compileShader(vertexShader)
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader))
      return
    }

    gl.compileShader(fragmentShader)
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader))
      return
    }

    let program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('ERROR linking program!', gl.getProgramInfoLog(program))
      return
    }

    gl.validateProgram(program)
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
      console.error('ERROR validating program!', gl.getProgramInfoLog(program))
      return
    }

    // create buffer
    let boxVertices = [
      // X, Y, Z        R, G, B
      // Top
      -1.0, 1.0, -1.0,  0.5, 0.5, 0.5,
      -1.0, 1.0, 1.0,   0.5, 0.5, 0.5,
      1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
      1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
      // Left
      -1.0, 1.0, 1.0,   0.75, 0.25, 0.5,
      -1.0, -1.0, 1.0,  0.75, 0.25, 0.5,
      -1.0, -1.0, -1.0, 0.75, 0.25, 0.5,
      -1.0, 1.0, -1.0,  0.75, 0.25, 0.5,
      // Right
      1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
      1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
      1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
      1.0, 1.0, -1.0,   0.25, 0.25, 0.75,
      // Front
      1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
      1.0, -1.0, 1.0,   1.0, 0.0, 0.15,
      -1.0, -1.0, 1.0,  1.0, 0.0, 0.15,
      -1.0, 1.0, 1.0,   1.0, 0.0, 0.15,
      // Back
      1.0, 1.0, -1.0,   0.0, 1.0, 0.15,
      1.0, -1.0, -1.0,  0.0, 1.0, 0.15,
      -1.0, -1.0, -1.0, 0.0, 1.0, 0.15,
      -1.0, 1.0, -1.0,  0.0, 1.0, 0.15,
      // Bottom
      -1.0, -1.0, -1.0, 0.5, 0.5, 1.0,
      -1.0, -1.0, 1.0,  0.5, 0.5, 1.0,
      1.0, -1.0, 1.0,   0.5, 0.5, 1.0,
      1.0, -1.0, -1.0,  0.5, 0.5, 1.0 
    ]

    let boxIndics = [
      // Top
      0, 1, 2,
      0, 2, 3,
      // Left
      5, 4, 6,
      6, 4, 7,
      // Right
      8, 9, 10,
      8, 10, 11,
      // Front
      13, 12, 14,
      15, 14, 12,
      // Back
      16, 17, 18,
      16, 18, 19,
      // Bottom
      21, 20, 22,
      22, 20, 23
    ]

    let boxVertexBufferObject = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW)

    let boxIndexBufferObject = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndics), gl.STATIC_DRAW)

    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor')
    gl.vertexAttribPointer(
      positionAttribLocation,  // Attribute location
      3, //Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      0 // Offset from the beginning of a single vertex to the attribute
    )
    gl.vertexAttribPointer(
      colorAttribLocation,  // Attribute location
      3, //Number of elements per attribute
      gl.FLOAT, // Type of elements
      gl.FALSE,
      6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
      3 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to the attribute
    )

    gl.enableVertexAttribArray(positionAttribLocation)
    gl.enableVertexAttribArray(colorAttribLocation)

    // Tell OpenGL state machine which program should be active.
    gl.useProgram(program)

    let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld')
    let matViewUniformLocation = gl.getUniformLocation(program, 'mView')
    let matProjUniformLocation = gl.getUniformLocation(program, 'mProj')

    let worldMatrix = new Float32Array(16)
    let viewMatrix = new Float32Array(16)
    let projMatrix = new Float32Array(16)
    mat4.identity(worldMatrix)
    mat4.lookAt(viewMatrix, [0, 0, -8], [0, 0, 0], [0, 1, 0])
    mat4.perspective(projMatrix, glMatrix.toRadian(45), 800 / 600, 0.1, 1000.0)

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix)
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix)
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix)

    let xRotationMatrix = new Float32Array(16)
    let yRotationMatrix = new Float32Array(16)


    // Main render loop
    let identityMatrix = new Float32Array(16)
    mat4.identity(identityMatrix)
    let angle = 0
    let loop = () => {
      angle = performance.now() / 1000 / 6 * 2 * Math.PI
      mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0])
      mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0])
      mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix)
      gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix)
      
      gl.clearColor(0.75, 0.85, 0.8, 1.0)
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT)
      gl.drawElements(gl.TRIANGLES, boxIndics.length, gl.UNSIGNED_SHORT, 0)

      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
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

export default RotatingCube
