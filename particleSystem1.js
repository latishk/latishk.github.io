/**
 * Created by latish on 12/10/15.
 */
/**
 * Created by latish on 12/10/15.
 */


"use strict";

var maxParticles = 2000,
    particleSize = 2,
    emissionRate = 1,
    objectSize = 1; // drawSize of emitter/field


var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function Particle(point, velocity, acceleration) {
    this.position = point || new Vector(0, 0);
    this.velocity = velocity || new Vector(0, 0);
    this.acceleration = acceleration || new Vector(0, 0);
    this.particleSize = particleSize;
}

Particle.prototype.submitToFields = function (fields) {
    // our starting acceleration this frame
    var totalAccelerationX = 0;
    var totalAccelerationY = 0;

    // for each passed field
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];

        // find the distance between the particle and the field
        var vectorX = field.position.x - this.position.x;
        var vectorY = field.position.y - this.position.y;

        // calculate the force via MAGIC and HIGH SCHOOL SCIENCE!
        var force = field.mass / Math.pow(vectorX*vectorX+vectorY*vectorY,1.5);

        // add to the total acceleration the force adjusted by distance
        totalAccelerationX += vectorX * force;
        totalAccelerationY += vectorY * force;
    }

    // update our particle's acceleration
    this.acceleration = new Vector(totalAccelerationX, totalAccelerationY);    
};

Particle.prototype.move = function () {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity)/2;
};

function Field(point, mass) {
    this.position = point;
    this.setMass(mass);
}

Field.prototype.setMass = function(mass) {
    this.mass = mass || 100;
    this.drawColor = mass < 0 ? "#f00" : "#0f0";
}

function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vector.prototype.add = function(vector) {
    this.x += vector.x;
    this.y += vector.y;
}

Vector.prototype.getMagnitude = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.getAngle = function () {
    return Math.atan2(this.y,this.x);
};

Vector.fromAngle = function (angle, magnitude) {
    return new Vector(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
};

function Emitter(point, velocity, spread) {
    this.position = point; // Vector
    this.velocity = velocity; // Vector
    this.spread = spread || Math.PI / 32; // possible angles = velocity +/- spread
    this.drawColor = "RED"; // So we can tell them apart from Fields later
}

Emitter.prototype.emitParticle = function() {
    // Use an angle randomized over the spread so we have more of a "spray"
    var angle = this.velocity.getAngle() + this.spread - (Math.random() * this.spread * 2);

    // The magnitude of the emitter's velocity
    var magnitude = this.velocity.getMagnitude();

    // The emitter's position
    var position = new Vector(this.position.x, this.position.y);

    // New velocity based off of the calculated angle and magnitude
    var velocity = Vector.fromAngle(angle, magnitude);

    // return our new Particle!
    var p = new Particle(position,velocity); 
    p.particleSize = particleSize;
    return p;
};

function addNewParticles() {
    // if we're at our max, stop emitting.
    if (particles.length > maxParticles) return;

    // emit [emissionRate] particles and store them in our particles array
    for (var j = 0; j < emissionRate; j++) {
        particles.push(emitter.emitParticle());
    }    
}

function plotParticles(boundsX, boundsY) {
    // a new array to hold particles within our bounds
    var currentParticles = [];

    for (var i = 0; i < particles.length; i++) {
        var particle = particles[i];
        var pos = particle.position;

        // If we're out of bounds, drop this particle and move on to the next
        if (pos.x < 0 || pos.x > boundsX || pos.y < 0 || pos.y > boundsY) continue;

        // Update velocities and accelerations to account for the fields
        particle.submitToFields(fields);

        // Move our particles
        particle.move();

        // Add this particle to the list of current particles
        currentParticles.push(particle);
    }

    // Update our global particles reference
    particles = currentParticles;
}

function drawParticles() {
    ctx.fillStyle = 'rgb(0,0,255)';
    for (var i = 0; i < particles.length; i++) {
        var position = particles[i].position;
        ctx.fillRect(position.x, position.y, particles[i].particleSize, particles[i].particleSize);
    }
}

function drawCircle(object) {
    ctx.fillStyle = object.drawColor;
    ctx.beginPath();
    ctx.arc(object.position.x, object.position.y, objectSize*3, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

var particles = [];

var midX = canvas.width / 2;
var midY = canvas.height / 2;

// Add one emitter located at `{ x : 100, y : 230}` from the origin (top left)
// that emits at a velocity of `2` shooting out from the right (angle `0`)
var emitter = new Emitter(new Vector(midX - 150, midY), Vector.fromAngle(6, 1), Math.PI);

// Add one field located at `{ x : 400, y : 230}` (to the right of our emitter)
// that repels with a force of `140`
var fields = [
    new Field(new Vector(midX + 300, midY ), 900),
];

function loop() {
    clear();
    update();
    draw();
    queue();
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
    addNewParticles();
    plotParticles(canvas.width, canvas.height);
}

function draw() {
    drawParticles();
    fields.forEach(drawCircle);
    emitter.drawCircle;

}

function queue() {
    window.requestAnimationFrame(loop);
}

loop();

$(document).ready(function() {
    $(".apply-btn").bind('click', applyChanges);
    $("#option-div input").bind('keydown', function(e) {
        if ( e.keyCode == 13 )
            applyChanges();
    });
});

function applyChanges() {
     var vel = $(".velocity").val()/1.414;
        if ( vel !== 0 ) {
            emitter.velocity.x = vel;
            emitter.velocity.y = vel;
        }
        if ( $(".rate").val() !== "" ) {
            emissionRate = $(".rate").val();
        }
        if ( $(".size").val() !== "" ) {
            particleSize = $(".size").val();
        }
}