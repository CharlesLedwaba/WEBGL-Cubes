const canvas = document.querySelector(`canvas`);
const webgl = canvas.getContext(`webgl`)
    if(!webgl){
        throw new Error("Hey Webgl is not supported")
    }

webgl.clearColor(1,0.2,0.5,1);
webgl.clear(webgl.COLOR_BUFFER_BIT)
webgl.enable(webgl.DEPTH_TEST)


//setting values
var worldMatrix = createmat4();
var worldMatrix2 = createmat4();
var worldMatrix3 = createmat4();
var viewMatrix = createmat4();
var projMatrix = createmat4();


perspective(projMatrix, toRadians(90), canvas.width/canvas.height,0.2, 10000);

let p = 0.4;

let a = [p,p,p];
let b = [p,-p,p];
let c = [-p,-p,p];
let d = [-p,p,p];
let e = [p,p,-p];
let f = [p,-p,-p];
let g = [-p,-p,-p];
let h = [-p,p,-p];  
  
let vertices = new Float32Array([
  a,b,c, a,c,d, e,f,g, e,g,h, //front & back
  a,e,h, a,d,h, b,f,g, b,c,g, //top & bottom
  a,b,f, a,e,f, d,c,g, d,h,g,  //left & right

].flat())
//flat() turns a multi D array to 1D

/*
const vertices = new Float32Array([
    0,1, -1,-1, 1,-1
])*/

const vsBuffer = webgl.createBuffer();
webgl.bindBuffer(webgl.ARRAY_BUFFER, vsBuffer)
webgl.bufferData(webgl.ARRAY_BUFFER,vertices, webgl.STATIC_DRAW);

const colours = new Float32Array([
  //front triangles 
  1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,
  
  //back triangles 
  0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0,
  
  //top triangles 
  0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1,
  
  //bottom triangles 
  1,0,1, 1,0,1, 1,0,1, 1,0,1, 1,0,1, 1,0,1,
  
  //left triangles 
  1,1,0, 1,1,0, 1,1,0, 1,1,0, 1,1,0, 1,1,0,
  
  //right triangles 
  0,1,1, 0,1,1, 0,1,1, 0,1,1, 0,1,1, 0,1,1
  
]);


const fsBuffer = webgl.createBuffer();
webgl.bindBuffer(webgl.ARRAY_BUFFER,fsBuffer);
webgl.bufferData(webgl.ARRAY_BUFFER,colours,webgl.STATIC_DRAW);

const vertexSource = `
    attribute vec3 pos;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;
    attribute vec3 color;
    varying vec3 fragColor;
   // uniform float y;

    void main(){
        gl_Position = mProj * mView * mWorld * vec4(pos,1) /*+ vec4(0,y,0,0)*/;
        gl_PointSize = 10.0;
        fragColor = color;
    }` 

const fragmentSource = `
    precision mediump float;
    varying vec3 fragColor;
    void main(){
       gl_FragColor = vec4(fragColor,1);
    }`

const vertexShader = webgl.createShader(webgl.VERTEX_SHADER)
webgl.shaderSource(vertexShader,vertexSource)
webgl.compileShader(vertexShader)

const fragmentShader = webgl.createShader(webgl.FRAGMENT_SHADER)
webgl.shaderSource(fragmentShader,fragmentSource)
webgl.compileShader(fragmentShader)

const program = webgl.createProgram()
webgl. attachShader(program,vertexShader)
webgl. attachShader(program,fragmentShader)
webgl.linkProgram(program)

const positionLocation = webgl.getAttribLocation(program,`pos`)
webgl.enableVertexAttribArray(positionLocation)
webgl.bindBuffer(webgl.ARRAY_BUFFER,vsBuffer)
webgl.vertexAttribPointer(positionLocation,3, webgl.FLOAT, false, 0, 0)


const colourLocation = webgl.getAttribLocation(program,`color`)
webgl.enableVertexAttribArray(colourLocation)
webgl.bindBuffer(webgl.ARRAY_BUFFER,fsBuffer)
webgl.vertexAttribPointer(colourLocation,3, webgl.FLOAT, false, 0, 0)

webgl.useProgram(program)

//MOVE all OBJECTS UP OR DOWN
//let yMove = 0;

//access elements
let matWorldUniformLocation = webgl.getUniformLocation(program,`mWorld`)
let matViewUniformLocation = webgl.getUniformLocation(program,`mView`)
let matProjUniformLocation = webgl.getUniformLocation(program,`mProj`)

//let yLocation = webgl.getUniformLocation(program,`y`)


//Manipulation of matrix
//the view matrix - translated 
translate(worldMatrix,worldMatrix,[1,1,-1])
//2ND OBJECT
translate(worldMatrix2,worldMatrix2,[-0.5,-1,-0.5])
//3ND OBJECT
translate(worldMatrix3,worldMatrix3,[3,-2,-3])
//CAMERA VIEW
translate(viewMatrix,viewMatrix,[1,0,2])
invert(viewMatrix,viewMatrix)

//perspective matrix 


//Sending matrices to Shader
webgl.uniformMatrix4fv(matWorldUniformLocation,false,worldMatrix);
//webgl.uniformMatrix4fv(matWorldUniformLocation,false,worldMatrix2);
webgl.uniformMatrix4fv(matViewUniformLocation,false,viewMatrix);
webgl.uniformMatrix4fv(matProjUniformLocation,false,projMatrix);


//webgl.drawArrays(webgl.TRIANGLES,0 ,vertices.length/3)
console.log(vertices.length)
let shape;


const select = document.querySelector("select")



draw();
selection();

function draw(){
  webgl.clear(webgl.COLOR_BUFFER_BIT)
  //1ST METHOD OBJECT

  webgl.uniformMatrix4fv(matWorldUniformLocation,false,worldMatrix);
  rotateZ(worldMatrix,worldMatrix,0.04)
  webgl.drawArrays(shape,0 ,108)

  //2ST METHOD OBJECT
  webgl.uniformMatrix4fv(matWorldUniformLocation,false,worldMatrix2);
 // webgl.uniform1f(yLocation,yMove)
  rotateX(worldMatrix2,worldMatrix2,-0.04)
  webgl.drawArrays(webgl.TRIANGLES,0,108)

  //3ST METHOD OBJECT
  webgl.uniformMatrix4fv(matWorldUniformLocation,false,worldMatrix3);
  //webgl.uniform1f(yLocation,yMove)
  rotateX(worldMatrix3,worldMatrix3,0.1)
  webgl.drawArrays(webgl.LINE_STRIP,0,108)
  
  window.requestAnimationFrame(draw)
}


//functions 

function selection(){
  const select = document.querySelector("select")

  select.onchange = function(){
  if(select.value == "TRIANGLES"){
     shape = webgl.TRIANGLE_FAN
     console.log(shape)
  }
  else if(select.value == "LINES"){
   
    shape = webgl.LINE_LOOP
    console.log(shape)
  }
  }
  

}



/*var Sx = 1.0, Sy = 1.5, Sz = 1.0;
         var xformMatrix = new Float32Array([
            Sx,   0.0,  0.0,  0.0,
            0.0,  Sy,   0.0,  0.0,
            0.0,  0.0,  Sz,   0.0,
            0.0,  0.0,  0.0,  1.0  
         ]);*/
//rotate 
function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];  //row 1, column 0 if it makes your code more readable [use it or don't use it]
  var a11 = a[5];  //row 1, column 1
  var a12 = a[6];  //row 1, column 2
  var a13 = a[7];  //row 1, column 3
  var a20 = a[8];  //row 2, column 0
  var a21 = a[9];  //row 2, column 1
  var a22 = a[10]; //row 2, column 2
  var a23 = a[11]; //row 2, column 3

  if (a !== out) {
    // If the source and destination differ, copy the unchanged rows
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}

//z rotate
function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];

  if (a !== out) {
    // If the source and destination differ, copy the unchanged last row
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  } // Perform axis-specific matrix multiplication


  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}


//matrices functions 
//identity matrix function 
function createmat4(){		
	return	new Float32Array([
	1,0,0,0,
	0,1,0,0,
	0,0,1,0,
	0,0,0,1
	]);
	}

//translate matrix function - multiply two matrices with output matrix 
function translate(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;

    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];
      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;
      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
  }
//Perspective Matrix  function 
function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf;
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;

    if (far != null && far !== Infinity) {
      nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }

    return out;
  }

//to radians
function toRadians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

//invert
function invert(out, a) {
  var a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
  var a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
  var a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
  var a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) {
    return null;
  }

  det = 1.0 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}

