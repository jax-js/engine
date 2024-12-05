var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// Structs
class vector {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

// Globals
var delta = 0;
var delta360 = 0;
var FOV = 160;
var cam = new vector(0, 0, 0);
var rot = new vector(0, 0, 0);
var debug = false;

// Key detection
var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }

function keyDown(x) {
  if (pressedKeys[x] === true) {
      return true;
  } else {
      return false;
  }
}

// Model, Poly, Sprite functions
function loadModel(url, _callback) {
  const req = new XMLHttpRequest();

  var verts = [];
  var faces = [];

  req.open('GET', url);
  req.send();
  req.addEventListener('load', function(){
    var r = this.responseText;
    var res = r.split(/\r?\n/);

    for (var i = 0; i < (res.length); i++) {
      if (res[i].charAt(0) == 'v') {
        var vect = new vector(0, 0, 0);
        var line = res[i].split(' ');

        vect.x = parseFloat(line[1]);
        vect.y = parseFloat(line[2]);
        vect.z = parseFloat(line[3]);

        verts.push(vect);
      }

      if (res[i].charAt(0) == 'f') {
        var vect = new vector(0, 0, 0);
        var line = res[i].split(' ');
        var face = [];

        vect.x = parseFloat(line[1]) - 1;
        vect.y = parseFloat(line[2]) - 1;
        vect.z = parseFloat(line[3]) - 1;

        face = [verts[vect.x].x, verts[vect.x].y, verts[vect.x].z,
        verts[vect.y].x, verts[vect.y].y, verts[vect.y].z,
        verts[vect.z].x, verts[vect.z].y, verts[vect.z].z];

        faces.push(face);
      }
    }
  });

  setTimeout(function(){
    _callback(faces);
  }, 1000);
}

function renderModel(model, x, y, z, s, rx, ry, rz) {
  for (var i1 = 0; i1 < model.length; i1++){
    for (var i2 = 0; i2 < (model[i1].length / 3); i2 += 3) {
      // Calculate that shit biaaaatch!!!!!!!!!!!
      var p1 = calculatePoint((model[i1][i2] + x) * s, (model[i1][i2 + 1] + y) * s, (model[i1][i2 + 2] + z) * s, rx, ry, rz);

      if (p1.oz < 5080) { 
        var p2 = calculatePoint((model[i1][i2 + 3] + x) * s, (model[i1][i2 + 4] + y) * s, (model[i1][i2 + 5] + z) * s, rx, ry, rz);
        var p3 = calculatePoint((model[i1][i2 + 6] + x) * s, (model[i1][i2 + 7] + y) * s, (model[i1][i2 + 8] + z) * s, rx, ry, rz);

        // Normals and stuff (Adapted from OneLoneCoder on GitHub)
        var normal = new vector();
        var line1 = new vector();
        var line2 = new vector();

        if (!debug) {
          line1.x = p2.ox - p1.ox;
          line1.y = p2.oy - p1.oy;
          line1.z = p2.oz - p1.oz;

          line2.x = p3.ox - p1.ox;
          line2.y = p3.oy - p1.oy;
          line2.z = p3.oz - p1.oz;

          normal.x = line1.y * line2.z - line1.z * line2.y;
          normal.y = line1.z * line2.x - line1.x * line2.z;
          normal.z = line1.x * line2.y - line1.y * line2.x;

          var l = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
          normal.x /= l; normal.y /= l; normal.z /= l;
        }

        // Draw!! ^_____^
        if (normal.x * (p1.ox) + 
            normal.y * (p1.oy) +
            normal.z * (p1.oz) <= 0 || debug) {
          var lightDir = new vector(0, 0, -1);
          var l = Math.sqrt(lightDir.x*lightDir.x + lightDir.y*lightDir.y + lightDir.z*lightDir.z);
          lightDir.x /= l; lightDir.y /= l; lightDir.z /= l;

          var distance = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;

          var color = 'hsl(0, 0%,' + (distance * 100) + '%)';

          ctx.lineWidth = 1;

          if (debug) {
            ctx.fillStyle = '#00000000';
            ctx.strokeStyle = 'white';
          } else {
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
          }

          ctx.beginPath();
          ctx.moveTo(p1.cx, p1.cy);
          ctx.lineTo(p2.cx, p2.cy);
          ctx.lineTo(p3.cx, p3.cy);
          ctx.lineTo(p1.cx, p1.cy);
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  }
}

function renderSprite(img, x, y, z, s) {
  var p = calculatePoint(x, y * 100, z, 0, 0, 0);

  ctx.drawImage(img, p.cx, p.cy, Math.floor(img.width * ((s * 0.05) * FOV / p.oz)), Math.floor(img.height * ((s * 0.05) * FOV / p.oz)));
}

// Calculate 3D perspective values
function calculatePoint(px, py, pz, rx, ry, rz) {
  var x1 = px;
  var y1 = py * Math.cos(rx) - pz * Math.sin(rx);
  var z1 = py * Math.sin(rx) + pz * Math.cos(rx);

  var x2 = x1 * Math.cos(ry) + z1 * Math.sin(ry);
  var y2 = y1;
  var z2 = z1 * Math.cos(ry) - x1 * Math.sin(ry);

  var x  = x2 * Math.cos(rz) - y2 * Math.sin(rz);
  var y  = x2 * Math.sin(rz) + y2 * Math.cos(rz);
  var z  = z2;

  var calcRotX = (Math.sin(rot.x * -1) * (z + cam.z)) + (Math.cos(rot.x * -1) * (x + cam.x));
  var calcRtZ1 = (Math.cos(rot.x * -1) * (z + cam.z)) - (Math.sin(rot.x * -1) * (x + cam.x));
  
  var calcRotY = (Math.sin(rot.y * -1) * (calcRtZ1)) + (Math.cos(rot.y * -1) * (y + cam.y));
  var calcRotZ = (Math.cos(rot.y * -1) * (calcRtZ1)) - (Math.sin(rot.y * -1) * (y + cam.y));
  
  if (FOV / calcRotZ < 0) {
    return false;
  } else {
    return {
      'cx': Math.floor((calcRotX * FOV / calcRotZ) + FOV),
      'cy': Math.floor((calcRotY * FOV / calcRotZ) + FOV),

      'ox': calcRotX,
      'oy': calcRotY,
      'oz': calcRotZ
    };
  }
}

ctx.imageSmoothingEnabled = false;

var fpsO = new Date();
setInterval(function(){
  // Stats
  var fpsN = new Date();
  var fps = (1000 / (fpsN - fpsO)).toFixed(1);
  fpsO = fpsN;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  draw();

  if(keyDown(37)) rot.x -= 0.01;
  if(keyDown(39)) rot.x += 0.01;
  if(keyDown(38)) rot.y -= 0.01;
  if(keyDown(40)) rot.y += 0.01;

  if ((delta % 15) == 0) {
    if(keyDown(16) && keyDown(49)) debug = !debug;
  }
  
  cam.x += Math.sin(rot.x) * (keyDown(83) - keyDown(87)) * 2;
  cam.z += Math.cos(rot.x) * (keyDown(83) - keyDown(87)) * 2;
  cam.x += Math.cos(rot.x) * (keyDown(65) - keyDown(68)) * 2;
  cam.z += Math.sin(rot.x) * (keyDown(65) - keyDown(68)) * -2;
  
  cam.y += (keyDown(81) - keyDown(69)) * -2;

  ctx.fillStyle = '#FFF';
  ctx.font = "8px Monospace";

  ctx.textAlign = 'left';
  ctx.fillText('FPS      | ' + fps, 8, 15);
  ctx.fillText('Position | X: ' + Math.round(cam.x) + ', Y: ' + Math.round(cam.y) + ', Z: ' + Math.round(cam.z), 8, 25);
  ctx.fillText('Rotation | X: ' + (rot.x).toFixed(2) + ', Y: ' + (rot.y).toFixed(2) + ', Z: ' + (rot.z).toFixed(2), 8, 35);
  ctx.fillText('Debug    | ' + debug + ' (Shift + 1)', 8, 45);

  ctx.fillText('Written by Jean T.', 8, canvas.height - 7);

  if (debug) {
    ctx.fillText('=== Debug Menu ===', 8, canvas.height - 15);
    ctx.fillText('Culled  | undifined' , 8, canvas.height - 35);
    ctx.fillText('Shaded  | undifiend' , 8, canvas.height - 45);
  }

  delta++;
}, false);