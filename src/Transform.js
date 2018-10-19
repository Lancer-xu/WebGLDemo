import React, { Component } from 'react'
import { mat4, glMatrix } from 'gl-matrix'
import { matIV } from './util/matIV'
import './App.css'

let vertexShaderText = [
'attribute vec3 position;',
'attribute vec4 color;',
'uniform mat4 mvpMatrix;',
'varying vec4 vColor;',
'',
'void main(void)',
'{',
'  vColor = color;',
'  gl_Position = mvpMatrix * vec4(position, 1.0);',
'}',
].join('\n')

let fragmentShaderText = [
'precision mediump float;',
'varying vec4 vColor;',
'void main(void)',
'{',
'  gl_FragColor = vColor;',
'}',
].join('\n')

class Transform extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gl: null,
      mMatrix: null,
      vMatrix: null,
      pMatrix: null,
      tmpMatrix: null,
      mvpMatrix: null,
    }
  }
  componentDidMount() {
    // let gl = this.getGLContext()
    // this.setPrimer(gl)
    this.setState({
      gl: this.getGLContext(),
    }, () => {
      this.setPrimer()
    })
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
  setPrimer() {
    let { gl } = this.state
    gl.clearColor(0.0, 0.0, 0.0, 1.0)

    gl.clearDepth(1.0)   // 设定canvas初始化时候的深度 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)   // canvas的初始化 

    let vertexShader = gl.createShader(gl.VERTEX_SHADER)
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(vertexShader, vertexShaderText)
    gl.shaderSource(fragmentShader, fragmentShaderText)

    gl.compileShader(vertexShader)   // 编译着色器  
    gl.compileShader(fragmentShader)   // 编译着色器  

    if (gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {   // 判断一下vertexShader着色器是否编译成功 
      console.info("vertexShader编译着色器成功")
    } else {  
      console.error(gl.getShaderInfoLog(vertexShader))   
    }
    if (gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {   // 判断一下fragmentShader着色器是否编译成功 
      console.info("fragmentShader编译着色器成功")
    } else {  
      console.error(gl.getShaderInfoLog(fragmentShader))   
    }
    let program = this.create_program(vertexShader, fragmentShader, gl)

    let attLocation = []
    attLocation[0] = gl.getAttribLocation(program, 'position')  // attributeLocation的获取 
    attLocation[1] = gl.getAttribLocation(program, 'color')  // attributeLocation的获取 

    let attStride = [] // 将元素attribute保存到数组中
    attStride[0] = 3
    attStride[1] = 4
    let vertex_position = [   // 保存顶点的位置情报的数组
      0.0, 1.0, 0.0,  
      1.0, 0.0, 0.0,  
      -1.0, 0.0, 0.0  
    ]

    let vertex_color = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0
    ]
    
    let position_vbo = this.create_vbo(vertex_position, gl) // 生成VBO
    let color_vbo = this.create_vbo(vertex_color, gl)

    gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo)  // 绑定VBO
    gl.enableVertexAttribArray(attLocation[0])   // 设定attribute属性有効  
    gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, gl.FALSE, 0, 0)   // 添加attribute属性 

    gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo) // VBO绑定(位置情报)
    gl.enableVertexAttribArray(attLocation[1])
    gl.vertexAttribPointer(attLocation[1], attStride[1], gl.FLOAT, gl.FALSE, 0, 0)


    // let mMatrix = mat4.identity(new Float32Array(16)) // 各种矩阵的生成和初始化  
    // let vMatrix = mat4.identity(new Float32Array(16))  
    // let pMatrix = mat4.identity(new Float32Array(16))
    // let tmpMatrix = mat4.identity(new Float32Array(16))
    // let mvpMatrix = mat4.identity(new Float32Array(16))

    this.setState({
      mMatrix: mat4.identity(new Float32Array(16)),
      vMatrix: mat4.identity(new Float32Array(16)),
      pMatrix: mat4.identity(new Float32Array(16)),
      tmpMatrix: mat4.identity(new Float32Array(16)),
      mvpMatrix: mat4.identity(new Float32Array(16)),
    }, () => {
      let { vMatrix, pMatrix, tmpMatrix } = this.state
      mat4.lookAt(vMatrix, [0.0, 0.0, 10.0], [0, 0, 0], [0, 1, 0])  // 视图变换坐标矩阵 
      mat4.perspective(pMatrix, 45, 800 / 600, 0.1, 100) // 投影坐标变换矩阵 
      mat4.multiply(tmpMatrix, pMatrix, vMatrix) //  视图变换矩阵 先和投影坐标矩阵相乘 保存起来

      let uniLocation = gl.getUniformLocation(program, 'mvpMatrix') // uniformLocation的获取 

      let count = 0

      this.setLoopRender(count, uniLocation)
    })
  }
  setLoopRender(count, uniLocation, duration = 1000 / 30) {
    let { gl, mMatrix, tmpMatrix, mvpMatrix } = this.state
    gl.clearColor(0.0, 0.0, 0.0, 1.0)  // canvasを初期化 
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    count++   // 计数器递增  

    let rad = (count % 360) * Math.PI / 180   // 使用计数器算出角度 

    let x = Math.cos(rad) // 模型1按照一个圆形轨道进行旋转 
    let y = Math.sin(rad)
    mat4.identity(mMatrix)
    mat4.translate(mMatrix, mMatrix, [x - 0.8, y + 0.2, 0.0])

    mat4.multiply(mvpMatrix, tmpMatrix, mMatrix)   // 完成模型1的坐标变换矩阵，并进行绘图 
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    mat4.identity(mMatrix)  // 模型2沿Y轴进行旋转 
    mat4.translate(mMatrix, mMatrix, [0, 0, 0.0])
    mat4.rotate(mMatrix, mMatrix, rad, [0, 1, 0])

     
    mat4.multiply(mvpMatrix, tmpMatrix, mMatrix) // 完成模型2的坐标变换矩阵，并进行绘图 
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    let s = Math.sin(rad) + 1.0  // 模型3进行放大缩小  
    mat4.identity(mMatrix)
    mat4.translate(mMatrix, mMatrix, [-0.2, -0.2, 0.0])
    mat4.scale(mMatrix, mMatrix, [s, s, 0.0])

    mat4.multiply(mvpMatrix, mMatrix, tmpMatrix) // 完成模型3的坐标变换矩阵，并进行绘图  
    gl.uniformMatrix4fv(uniLocation, false, mvpMatrix)
    gl.drawArrays(gl.TRIANGLES, 0, 3)

    gl.flush() // context刷新

    // 为了循环，进行递归处理
    this.loopRender = setTimeout(() => {
      this.setLoopRender(count, uniLocation)
    }, duration)
  }
  create_program(vs, fs, gl) {
    var program = gl.createProgram()   // 程序对象的生成 
    gl.attachShader(program, vs)   // 向程序对象里分配着色器 
    gl.attachShader(program, fs)  

    gl.linkProgram(program)   // 将着色器连接 

    if(gl.getProgramParameter(program, gl.LINK_STATUS)) {   // 判断着色器的连接是否成功  
      gl.useProgram(program)   // 成功的话，将程序对象设置为有效 
      return program   // 返回程序对象 
    } else {  
      console.error(gl.getProgramInfoLog(program))   // 如果失败，弹出错误信息 
    }
  }  
  create_vbo(data, gl) {
    var vbo = gl.createBuffer()  // 生成缓存对象 
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)   // 绑定缓存 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)  // 向缓存中写入数据 
    gl.bindBuffer(gl.ARRAY_BUFFER, null)   // 将绑定的缓存设为无效 
    return vbo  // 返回生成的VBO 
  }
  render() {
    return (
      <div>
        <canvas id="canvas" width="800" height="600">
          Your browser does not support HTML5
        </canvas>
        <p></p>
      </div>
    )
  }
}

export default Transform
