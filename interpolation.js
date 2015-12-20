/**
 * Created by latish on 12/19/15.
 */
var scene, camera, renderer;
var updaterId;
var timeoutId;
var lastUpdate = 0;
var fps = 50;

var cube;
var input;
var index = 0;
var mode = linear_mode;
var mapping = "linear";

function init() {
    var WIDTH = window.innerWidth - 100;
    var HEIGHT = window.innerHeight - 100;

    // Set up the scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        35,             	// Field of view
        WIDTH / HEIGHT,      // Aspect ratio
        0.1,            	// Near plane
        10000           	// Far plane
    );
    camera.position.set( 25, 25, 80 );
    camera.lookAt( scene.position );

    // light up the scene
    var light = new THREE.PointLight( "white" );
    light.position.set( 75, 15, 0 );
    //scene.add( light );

    var light = new THREE.PointLight( "white" );
    light.position.set( 15, 75, 15 );
    //scene.add( light );

    var light = new THREE.PointLight( "white" );
    light.position.set( 0, 15, 75 );
    scene.add( light );

    var light = new THREE.PointLight( "white" );
    light.position.set( -75, -15, 0 );
    //scene.add( light );

    var light = new THREE.PointLight( "white" );
    light.position.set( -15, -75, -15 );
    //scene.add( light );

    var light = new THREE.PointLight( "white" );
    light.position.set( 0, -15, -75 );
    //scene.add( light );

    // Set up the renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( WIDTH, HEIGHT );
    document.body.appendChild( renderer.domElement );

    renderer.setClearColor( "white", 1);

    // Create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize', function() {
        var WIDTH = window.innerWidth - 100;
        var HEIGHT = window.innerHeight - 100;
        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
    });
};

function addCube() {
    var geometry = new THREE.BoxGeometry( 5, 5, 5 );
    // var material = new THREE.MeshLambertMaterial( { color: 0xFFFF00 } );
    var materials = [
        new THREE.MeshLambertMaterial( { color: 0x929494 } ),
        new THREE.MeshLambertMaterial( { color: 0x929494 } ),
        new THREE.MeshLambertMaterial( { color: 0x929494 } ),
        new THREE.MeshLambertMaterial( { color: 0x929494 } ),
        new THREE.MeshLambertMaterial( { color: 0x929494 } ),
        new THREE.MeshLambertMaterial( { color: 0x929494 } ),
    ];
    var material = new THREE.MeshFaceMaterial(materials);

    var cube_mesh = new THREE.Mesh( geometry, material );

    scene.add( cube_mesh );

    return cube_mesh;
};

function startAnimation(duration) {
    window.clearTimeout(timeoutId);
    updaterId = window.setInterval(update, 1000 / fps);
    lastUpdate = new Date().getTime();
    timeoutId = window.setTimeout(stopAnimation, duration);
    console.log("Animation Started..");
};

function stopAnimation() {
    window.clearInterval(updaterId);
    console.log("Animation stopped.");
};

function updateScene() {
    renderer.render( scene, camera );
};

function getKeyframeInterval() {
    // refresh t after every 1 sec ~ fps/2 margin for error
    var defaultInterval = (1000 - (fps / 2));
    return defaultInterval;
};

function getU(t) {
    // reference http://upshots.org/actionscript/jsas-understanding-easing
    // http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm
    var t2 = t * t;
    var t3 = t2 * t;
    var t4 = t2 * t2;
    var t5 = t3 * t2;

    var b = 0;
    var c = 1;

    if (mapping == "linear") {
        return t;
    }
    if (mapping == "slow-in,slow-out") {
        return b + (c * ((6 * t5) + (-15 * t4) + (10 * t3)));
    }
    if (mapping == "slow-in,fast-out") {
        return b + (c * t3);
    }
};

function update() {
    var t = new Date().getTime() - lastUpdate;
    if (t >= getKeyframeInterval()) {
        //console.log(t);
        lastUpdate = new Date().getTime();
        index = (index + 1) % input.length;
        t = new Date().getTime() - lastUpdate;
    }

    var u = getU(t / 1000);

    var currentPoint = mode(input, index, u);

    cube.position.copy(currentPoint.position);
    cube.quaternion.copy(currentPoint.quaternion);

    updateScene();
};

function getInput() {
    // input for file or hardcoded;
    var raw_input = [
        "0.0 0.0 0.0 0.0 1.0 1.0 -1.0 0.0",
        "1.0 4.0 0.0 0.0 1.0 1.0 -1.0 30.0",
        "2.0 8.0 0.0 0.0 1.0 1.0 -1.0 90.0",
        "3.0 12.0 12.0 12.0 1.0 1.0 -1.0 180.0",
        "4.0 12.0 18.0 18.0 1.0 1.0 -1.0 270.0",
        "5.0 18.0 18.0 18.0 0.0 1.0 0.0 90.0",
        "6.0 8.0 18.0 18.0 0.0 0.0 1.0 90.0",
        "7.0 25.0 12.0 12.0 1.0 0.0 0.0 0.0",
        "8.0 25.0 0.0 18.0 1.0 0.0 0.0 0.0",
        "9.0 25.0 1.0 18.0 1.0 0.0 0.0 0.0"
    ];

    var parsedInput = [];

    for (var i = 0; i < raw_input.length; i++) {
        var parsed = raw_input[i].split(" ");
        parsedInput[i] = {
            keyframe : parseFloat(parsed[0]),
            position : new THREE.Vector3(parseFloat(parsed[1]), parseFloat(parsed[2]), parseFloat(parsed[3])),
            quaternion : new THREE.Quaternion(),
            axis : new THREE.Vector3(parseFloat(parsed[4]), parseFloat(parsed[5]), parseFloat(parsed[6])),
            angle : parseFloat(parsed[7])
        };
        parsedInput[i].quaternion.setFromAxisAngle(parsedInput[i].axis, parsedInput[i].angle);
        parsedInput[i].quaternion.normalize();
    }

    return parsedInput;
};

function generateControlPoints(input_arr) {
    for (var i = 0; i < input_arr.length; i++) {
        var p0 = i == 0 ? input_arr.length - 1 : i - 1;
        var p1 = i;
        var p2 = i == input_arr.length - 1 ? 0 : i + 1;

        var controlPointAfter = {
            position: new THREE.Vector3(),
            quaternion: new THREE.Quaternion()
        };
        controlPointAfter.position.subVectors(input_arr[p1].position, input_arr[p0].position);
        controlPointAfter.position.add(input_arr[p1].position);
        controlPointAfter.position.lerp(input_arr[p2].position, 0.5);

        THREE.Quaternion.slerp(input_arr[p1].quaternion, input_arr[p2].quaternion, controlPointAfter.quaternion, 0.25);

        var controlPointBefore = {
            position: new THREE.Vector3(),
            quaternion: new THREE.Quaternion()
        };
        controlPointBefore.position.subVectors(input_arr[p1].position, controlPointAfter.position);
        controlPointBefore.position.add(controlPointBefore.position);

        THREE.Quaternion.slerp(input_arr[p0].quaternion, input_arr[p1].quaternion, controlPointBefore.quaternion, 0.75);

        input_arr[i].controlPointBefore = controlPointBefore;
        input_arr[i].controlPointAfter = controlPointAfter;
    }
};



function tcb(input_arr, index, u, KBt, KBc, KBb) {
    // reference http://news.povray.org/povray.binaries.tutorials/attachment/%3CXns91B880592482seed7@povray.org%3E/Splines.bas.txt

    var cA = (1 - KBt) * (1 + KBc) * (1 + KBb);
    var cB = (1 - KBt) * (1 - KBc) * (1 - KBb);
    var cC = (1 - KBt) * (1 - KBc) * (1 + KBb);
    var cD = (1 - KBt) * (1 + KBc) * (1 - KBb);

    var basisMatrix = math.matrix([
        [-cA, 4 + cA - cB - cC, -4 + cB + cC - cD, cD],
        [2 * cA, -6 - (2 * cA) + (2 * cB) + cC, 6 - (2 * cB) - cC + cD, -cD],
        [-cA, cA - cB, cB, 0],
        [0, 2, 0, 0]
    ]);
    basisMatrix = math.multiply(basisMatrix, 0.5);

    var p0 = input_arr[index == 0 ? input_arr.length - 1 : index - 1];
    var p1 = input_arr[index];
    var p2 = input_arr[index == input_arr.length - 1 ? 0 : index + 1];
    var p3 = input_arr[index == input_arr.length - 2 ? 1 : index == input_arr.length - 1 ? 0 : index + 2];

    var geometry = math.matrix([
        [p0.position.x, p0.position.y, p0.position.z],
        [p1.position.x, p1.position.y, p1.position.z],
        [p2.position.x, p2.position.y, p2.position.z],
        [p3.position.x, p3.position.y, p3.position.z],
    ]);

    var S = math.matrix([u * u * u, u * u, u, 1]);
    var C = math.multiply(basisMatrix, geometry);
    var P = math.multiply(S, C);

    var newQuaternion = new THREE.Quaternion();
    THREE.Quaternion.slerp(p1.quaternion, p2.quaternion, newQuaternion, u);
    newQuaternion.normalize();

    return {
        position: new THREE.Vector3(P.get([0]), P.get([1]), P.get([2])),
        quaternion: newQuaternion
    };
};

function catmullRom_mode(input_arr, index, u) {
    var KBt = parseFloat(document.getElementById("KBt").value);
    var KBc = parseFloat(document.getElementById("KBc").value);
    var KBb = parseFloat(document.getElementById("KBb").value);

    if (KBt != 0 || KBc != 0 || KBb != 0) {
        return tcb(input_arr, index, u, KBt, KBc, KBb);
    }

    // This part could be made obselete

    var basisMatrix = math.matrix([
        [-1, 3, -3, 1],
        [2, -5, 4, -1],
        [-1, 0, 1, 0],
        [0, 2, 0, 0]
    ]);
    basisMatrix = math.multiply(basisMatrix, 0.5);

    var p0 = input_arr[index == 0 ? input_arr.length - 1 : index - 1];
    var p1 = input_arr[index];
    var p2 = input_arr[index == input_arr.length - 1 ? 0 : index + 1];
    var p3 = input_arr[index == input_arr.length - 2 ? 1 : index == input_arr.length - 1 ? 0 : index + 2];

    var geometry = math.matrix([
        [p0.position.x, p0.position.y, p0.position.z],
        [p1.position.x, p1.position.y, p1.position.z],
        [p2.position.x, p2.position.y, p2.position.z],
        [p3.position.x, p3.position.y, p3.position.z],
    ]);

    var S = math.matrix([u * u * u, u * u, u, 1]);
    var C = math.multiply(basisMatrix, geometry);
    var P = math.multiply(S, C);

    var newQuaternion = new THREE.Quaternion();
    THREE.Quaternion.slerp(p1.quaternion, p2.quaternion, newQuaternion, u);
    newQuaternion.normalize();

    return {
        position: new THREE.Vector3(P.get([0]), P.get([1]), P.get([2])),
        quaternion: newQuaternion
    };
};

function linear_mode(input_arr, index, u) {
    var initial_keyframe = input_arr[index];
    var final_keyframe = input_arr[(index + 1) % input_arr.length];

    var current_keyframe = new THREE.Vector3();
    current_keyframe.lerpVectors(initial_keyframe.position, final_keyframe.position, u);

    var newQuaternion = new THREE.Quaternion();
    THREE.Quaternion.slerp(initial_keyframe.quaternion, final_keyframe.quaternion, newQuaternion, u);
    newQuaternion.normalize();

    return {
        position: current_keyframe,
        quaternion: newQuaternion
    };
};

var activateInterpolation = function(btn) {
    switch (btn.value) {
        case "L":
            mode = linear_mode;
            break;
        case "C":
            mode = catmullRom_mode;
            break;
        case "D":
            mode = deCasteljau_mode;
            break;
    }
};

var activateMapping = function(btn) {
    mapping = btn.value;
};

window.onload = function() {
    init();

    cube = addCube();
    input = getInput();
    generateControlPoints(input);
    updateScene();

    startAnimation(10000);

};