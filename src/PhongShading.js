import React, { Component } from 'react'
import { mat4, glMatrix } from 'gl-matrix'
import { matIV } from './util/matIV'
import './App.css'

let vertexShaderText = [
'attribute vec3 position;',
'attribute vec3 normal;',
'attribute vec4 color;',
'uniform mat4 mvpMatrix;',
'varying vec3 vNormal;',
'varying vec4 vColor;',
'',
'void main(void)',
'{',
'  vNormal = normal;',
'  vColor = color;',
'  gl_Position = mvpMatrix * vec4(position, 1.0);',
'}',
].join('\n')

let fragmentShaderText = [
'precision mediump float;',
'',
'uniform mat4 invMatrix;',
'uniform vec3 lightDirection;',
'uniform vec3 eyeDirection;',
'uniform vec4 ambientColor;',
'varying vec3 vNormal;',
'varying vec4 vColor;',
'',
'void main(void)',
'{',
'  vec3 invLight = normalize(invMatrix * vec4(lightDirection, 0.0)).xyz;',
'  vec3 invEye = normalize(invMatrix * vec4(eyeDirection, 0.0)).xyz;',
'  vec3 halfLE = normalize(invLight + invEye);',
'  float diffuse = clamp(dot(vNormal, invLight), 0.0, 1.0);',
'  float specular = pow(clamp(dot(vNormal, halfLE), 0.0, 1.0), 50.0);',
'  vec4 destColor = vColor * vec4(vec3(diffuse), 1.0) + vec4(vec3(specular), 1.0) + ambientColor;',
'  gl_FragColor = destColor;',
'}',
].join('\n')

// # added by lancer.xu at 2018-01-02 16:26:49
// gouraud shading 高氏着色
// phong shading   补色着色

// 补色着色　区别与之前的高氏着色器, 把顶点着色器中的处理, 放到了片段着色器中
class PhongShading extends Component {
  constructor(props) {
    super(props)
    this.state = {
      gl: null,
      mMatrix: null,
      vMatrix: null,
      pMatrix: null,
      tmpMatrix: null,
      mvpMatrix: null,
      invMatrix: null,
      index: [],
      lightDirection: [],
      uniLocation: [],
    }
    this.canvas = null
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
    this.canvas = document.getElementById("canvas")
    let gl = this.canvas.getContext('webgl')

    if (!gl) {
      console.log('WebGL not supported, falling back on experimental')
      gl = this.canvas.getContext('experimental-webgl')
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
    attLocation[1] = gl.getAttribLocation(program, 'normal')  // attributeLocation的获取 
    attLocation[2] = gl.getAttribLocation(program, 'color')  // attributeLocation的获取 

    let attStride = [] // 将元素attribute保存到数组中
    attStride[0] = 3
    attStride[1] = 3
    attStride[2] = 4


    let torusData = this.torus(32, 32, 1.0, 2.0)
    let position = torusData[0]
    let normal = torusData[1]
    let color = torusData[2]
    let index = torusData[3]

    let position_vbo = this.create_vbo(position, gl) // 生成VBO
    let normal_vbo = this.create_vbo(normal, gl) // 生成VBO
    let color_vbo = this.create_vbo(color, gl)

    this.setState({
      index,
    }, () => {
      let index_ibo = this.create_ibo(this.state.index, gl) // 生成IBO
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_ibo)
    })


    gl.bindBuffer(gl.ARRAY_BUFFER, position_vbo)  // 绑定VBO  位置情报
    gl.enableVertexAttribArray(attLocation[0])   // 设定attribute属性有効  
    gl.vertexAttribPointer(attLocation[0], attStride[0], gl.FLOAT, gl.FALSE, 0, 0)   // 添加attribute属性 

    gl.bindBuffer(gl.ARRAY_BUFFER, normal_vbo)  // 绑定VBO 法线情报
    gl.enableVertexAttribArray(attLocation[1])   // 设定attribute属性有効  
    gl.vertexAttribPointer(attLocation[1], attStride[1], gl.FLOAT, gl.FALSE, 0, 0)   // 添加attribute属性 

    gl.bindBuffer(gl.ARRAY_BUFFER, color_vbo) // 绑定VBO 颜色情报
    gl.enableVertexAttribArray(attLocation[2])
    gl.vertexAttribPointer(attLocation[2], attStride[2], gl.FLOAT, gl.FALSE, 0, 0)

    this.setState({
      mMatrix: mat4.identity(new Float32Array(16)),  // 各种矩阵的生成和初始化
      vMatrix: mat4.identity(new Float32Array(16)),
      pMatrix: mat4.identity(new Float32Array(16)),
      tmpMatrix: mat4.identity(new Float32Array(16)),
      mvpMatrix: mat4.identity(new Float32Array(16)),
      invMatrix: mat4.identity(new Float32Array(16)),
    }, () => {
      let { vMatrix, pMatrix, tmpMatrix } = this.state
      mat4.lookAt(vMatrix, [0.0, 0.0, 20.0], [0, 0, 0], [0, 1, 0])  // 视图变换坐标矩阵 
      mat4.perspective(pMatrix, 45, this.canvas.width / this.canvas.height, 0.1, 100) // 投影坐标变换矩阵 
      mat4.multiply(tmpMatrix, pMatrix, vMatrix) //  视图变换矩阵 先和投影坐标矩阵相乘 保存起来

      this.setState({
        lightDirection: [-0.5, 0.5, 0.5],
        uniLocation: [
          gl.getUniformLocation(program, 'mvpMatrix'),  // uniformLocation的获取
          gl.getUniformLocation(program, 'invMatrix'),
          gl.getUniformLocation(program, 'lightDirection'),
          gl.getUniformLocation(program, 'eyeDirection'),
          gl.getUniformLocation(program, 'ambientColor'),
        ]
      })
      let count = 0
      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.disable(gl.CULL_FACE)
      this.setLoopRender(count)
    })
  }
  setLoopRender(count, duration = 1000 / 30) {
    let {
      gl,
      mMatrix,
      tmpMatrix,
      mvpMatrix,
      index,
      invMatrix,
      lightDirection,
      uniLocation,
    } = this.state
    gl.clearColor(0.0, 0.0, 0.0, 1.0)  // canvasを初期化 
    gl.clearDepth(1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    count++   // 计数器递增  

    let rad = (count % 360) * Math.PI / 180   // 使用计数器算出角度 

    mat4.identity(mMatrix)
    mat4.rotate(mMatrix, mMatrix, rad, [1, 0, 0]) // 旋转矩阵
    mat4.multiply(mvpMatrix, tmpMatrix, mMatrix)

    mat4.invert(invMatrix, mMatrix) // 根据模型坐标变换矩阵生成逆矩阵

    let eyeDirection = [0.0, 0.0, 20.0]
    let ambientColor = [0.1, 0.1, 0.1, 1.0]

    gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix)
    gl.uniformMatrix4fv(uniLocation[1], false, invMatrix)
    gl.uniform3fv(uniLocation[2], lightDirection)
    gl.uniform3fv(uniLocation[3], eyeDirection)
    gl.uniform4fv(uniLocation[4], ambientColor)

    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0)

    gl.flush() // context刷新

    // 为了循环，进行递归处理
    this.loopRender = setTimeout(() => {
      this.setLoopRender(count, uniLocation[0])
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
    let vbo = gl.createBuffer()  // 生成缓存对象 
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)   // 绑定缓存 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)  // 向缓存中写入数据 
    gl.bindBuffer(gl.ARRAY_BUFFER, null)   // 将绑定的缓存设为无效 
    return vbo  // 返回生成的VBO 
  }
  create_ibo(data, gl){  // IBO的生成函数
    let ibo = gl.createBuffer()   // 生成缓存对象 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)   // 绑定缓存 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW)  // 向缓存中写入数据 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)  // 将缓存的绑定无效化 
    return ibo  // 返回生成的IBO 
  }  
  torus(row, column, irad, orad) {
    var pos = new Array(), nor = new Array(), col = new Array(), idx = new Array()
    for(var i = 0; i <= row; i++) {
      var r = Math.PI * 2 / row * i
      var rr = Math.cos(r)
      var ry = Math.sin(r)
      for(var ii = 0; ii <= column; ii++) {  
        var tr = Math.PI * 2 / column * ii
        var tx = (rr * irad + orad) * Math.cos(tr)
        var ty = ry * irad
        var tz = (rr * irad + orad) * Math.sin(tr)
        var rx = rr * Math.cos(tr)
        var rz = rr * Math.sin(tr)
        pos.push(tx, ty, tz)
        nor.push(rx, ry, rz)
        var tc = this.hsva(360 / column * ii, 1, 1, 1)
        col.push(tc[0], tc[1], tc[2], tc[3])
      }
    }
    for(i = 0; i < row; i++) {
      for(ii = 0; ii < column; ii++) {
        r = (column + 1) * i + ii
        idx.push(r, r + column + 1, r + 1)
        idx.push(r + column + 1, r + column + 2, r + 1)
      }
    }
    return [pos, nor, col, idx]
  } 
  hsva(h, s, v, a) {
    if(s > 1 || v > 1 || a > 1){return;}
    var th = h % 360
    var i = Math.floor(th / 60)
    var f = th / 60 - i
    var m = v * (1 - s)
    var n = v * (1 - s * f)
    var k = v * (1 - s * (1 - f))
    var color = new Array()
    if(!s > 0 && !s < 0) {
      color.push(v, v, v, a)
    } else {
      var r = new Array(v, n, m, m, k, v)
      var g = new Array(k, v, v, n, m, m)
      var b = new Array(m, m, k, v, v, n)
      color.push(r[i], g[i], b[i], a)
    }
    return color
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

export default PhongShading
