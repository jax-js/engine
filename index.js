// Models
var mo_title;
loadModel('./models/title.obj', function(faces){
    mo_title = faces;
});  

var mo_ship;
loadModel('./models/ship.obj', function(faces){
    mo_ship = faces;
});  

// Sprites
var sp_exhaust = new Image();
sp_exhaust.src = './sprites/exhaust.png';

// Positions
var ship = new vector(3, 3, 0);
var shipRot = new vector(0, 1.5708, 0);

cam = new vector(10, -145, 1070);
rot = new vector(0, 0.30, 0);

// Render scene
function draw() {
	renderSprite(sp_exhaust, 0, 0, 0, 80);
    renderModel(mo_title, 0, 0, 0, 100, 0, 3.14159 + Math.sin(delta * 0.005) * 0.2, 0);

    renderModel(mo_ship, ship.x, ship.y, ship.z, 100, shipRot.x, shipRot.y, shipRot.z);
    ship.Y -= 0.1;
}