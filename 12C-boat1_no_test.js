import * as THREE from './js/three.js';
import { OrbitControls } from './js/OrbitControls.js';
import {GLTFLoader} from './js/GLTFLoader.js';
import { Water } from './js/Water.js';
const waterTexture = document.getElementById("img-material")
const lensflareTexture0 = document.getElementById("img-material-1")
const lensflareTexture1 = document.getElementById("img-material-2")
import { Sky } from './js/Sky.js';
import { Lensflare, LensflareElement } from './js/Lensflare.js';
import { PointerLockControls } from './js/PointerLockControls.js';
//第一视角


let renderer, camera, scene, light, meshes;
let mixer,mixer2,mixer3,mixer4;
let plane, model;
let model1;
let pointLight,ambientLight,dirLight;
let clock = new THREE.Clock();
let axesHelper;
let controls, controls_boat;

const objects = [];

let raycaster;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;


let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();


// var username = prompt("Username, please.")
// var serverPath = "https://kaoyan1.eu.pythonanywhere.com/threejs/get_mousedata";

// $.getJSON(serverPath,
//          {username: username,
//           timeMark: Date.now(),
//           objname: "homepage",
//           action: "landing",
//           x: 0,
//           y: 0 },
//          function(data) {console.log(data)}
//         )

// function mousetrack (event) {
    
//    $.getJSON(serverPath,
//          {username: username,
//           timeMark: Date.now(),
//           objname: "view",
//           action: event.type,
//           x: event.clientX,
//           y: event.clientY },
//          function(data) {console.log(data)})
// }

// function keyboardtrack (event) {
// console.log(event.key)
//     $.getJSON(serverPath,
//           {username: username,
//            timeMark: Date.now(),
//            objname: "keypress",
//            action: event.key,
//            x: 0,
//            y: 0 },
//           function(data) {console.log(data)})

// } 



initRenderer();
initCamera();

const vec1 = new THREE.Vector3(160,30,200);//终点flag坐标
function dist(x0,y0,z0){
    const vec2 = new THREE.Vector3(x0, y0, z0);

    var distance = vec1.distanceTo(vec2); //到终点的距离

    if (distance <= 30){
        console.log('Arrive!!');
        controls.lock();
        $("body").html('<center>Thank you!</center>');
    }
    console.log(distance);
}

const vec_boat = new THREE.Vector3(20, 0, 70);
// function dist_boat(x0,y0,z0,keypress){

//     const vec2 = new THREE.Vector3(x0, y0, z0);
//     var distance_boat = vec2.distanceTo(vec_boat); 
//     console.log(distance_boat);

//     $.getJSON(serverPath,
//         {username: username,
//          timeMark: Date.now(),
//          objname: "boat_distance",
//          action: keypress,
//          x: distance_boat,
//          y: 0 },
//         function(data) {console.log(data)}
//        )

// }


initScene();
 
initLight();
initMeshes();

enableShadow();

initAxesHelper();
initControls();


window.addEventListener('resize', function(){//渲染结果随着窗体的变化而变化（浏览器变窄了，渲染窗口也变窄）
    camera.aspect = window.innerWidth/this.window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, this.window.innerHeight);
})


/* ------------------场景三要素初始化------------------- */
function initRenderer() {
    renderer = new THREE.WebGL1Renderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}

function initCamera(){
    camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(-170,50,145);
    camera.lookAt(200,8,200);
    
}

function initScene(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xCAE1FF);
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
}
/* ------------------场景三要素初始化------------------- */



/* ------------------灯光------------------- */
function initLight(){
    ambientLight = new THREE.AmbientLight(0xffffff, .8);
    scene.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(.1, 1, .95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(30);
    scene.add(dirLight);

    // 太阳点光源
    pointLight = new THREE.PointLight(0xffffff, 1.2, 2000);
    pointLight.color.setHSL(.995, .5, .9);
    pointLight.position.set(0, 45, -2000);
    const textureLoader = new THREE.TextureLoader();
    const textureFlare0 = textureLoader.load(lensflareTexture0);
    const textureFlare1 = textureLoader.load(lensflareTexture1);
    // 镜头光晕
    const lensflare = new Lensflare();
    lensflare.addElement(new LensflareElement( textureFlare0, 600, 0, pointLight.color));
    lensflare.addElement(new LensflareElement( textureFlare1, 60, .6));
    lensflare.addElement(new LensflareElement( textureFlare1, 70, .7));
    lensflare.addElement(new LensflareElement( textureFlare1, 120, .9));
    lensflare.addElement(new LensflareElement( textureFlare1, 70, 1));
    pointLight.add(lensflare);
    scene.add(pointLight);
}
/* ------------------灯光------------------- */



/* ------------------加载3维模型------------------- */
function initMeshes(){
    //plane
    plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5000, 5000),
    new THREE.MeshPhongMaterial({
        color:0x999999,
        transparent: true
    })
    );
    plane.rotation.x = - Math.PI / 2;
    //scene.add(plane);

    //model
    //flag
    const flag_loader = new GLTFLoader();
    flag_loader.load('models/gltb/low_poly_golf_flag_animated.glb',function(gltf){
        model = gltf.scene;
        scene.add(model);
        model.position.set(160, 30, 200);
        model.rotation.y = 90;
        mixer4 = new THREE.AnimationMixer(model);
        mixer4.clipAction(gltf.animations[0]).play();
        gltf.scene.traverse( function(object){ 
            // console.log(object.type);
            
            if(object.isMesh){
                //console.log(object);
                object.castShadow = true;
                object.material.roughness = .6;
            }   
        })
        model.scale.set(20,20,20);
        //模型放大
        render();
    });


    //二号小岛
    const island_loader_2 = new GLTFLoader();
    island_loader_2.load('models/gltb/island.glb',function(gltf){
        model = gltf.scene;
        scene.add(model);
        model.position.set(200, -0.5, 200);
        model.rotation.y = - 10;
        gltf.scene.traverse( function(object){ 
            if(object.isMesh){
                object.material.roughness = .6;
            }   
        })

        model.scale.set(20,20,20);
        
    });


    //小船
    const smallship_loader = new GLTFLoader();
    smallship_loader.load('models/gltb/BoatWSail_small.glb',function(gltf){
        model1 = gltf.scene;
        scene.add(model1);
        model1.position.set(-150, 0, 150);
        model1.rotation.y = -30;
        
        gltf.scene.traverse( function(object){ 
            // console.log(object.type);
            
            if(object.isMesh){
                //console.log(object);
                object.castShadow = true;
            }   
        })
        model1.scale.set(22,22,22);

        render();
    });

    //大船
    const bigship_loader = new GLTFLoader();
    bigship_loader.load('models/gltb/Sail ship_big.glb',function(gltf){
        model = gltf.scene;
        scene.add(model);
        model.position.set(20, 0, 70);
        model.rotation.y = - 30;
        gltf.scene.traverse( function(object){ 
            // console.log(object.type);
            
            if(object.isMesh){
                //console.log(object);
                object.castShadow = true;
            }   
        })
        model.scale.set(10,10,10);
        //render();
    });


    //火烈鸟
    const bird_loader = new GLTFLoader();
    bird_loader.load('models/gltb/flamingo.glb',function(gltf){
        const mesh = gltf.scene.children[0];
        mesh.scale.set(.35, .35, .35);
        mesh.position.set(100, 80, 300);
        mesh.rotation.y = - 1;
        mesh.castShadow = true;
        scene.add(mesh);

        const bird2 = mesh.clone();
        bird2.position.set(150, 80, 500);
        scene.add(bird2);

        mixer = new THREE.AnimationMixer(mesh);
        mixer.clipAction(gltf.animations[0]).setDuration(1.2).play();
        //this.mixers.push(mixer);

        mixer2 = new THREE.AnimationMixer(bird2);
        mixer2.clipAction(gltf.animations[0]).setDuration(1.8).play();
        //this.mixers.push(mixer2);


        // scene.add(gltf.scene);
         gltf.scene.traverse( function(object){ 
             console.log(object.type);
            
             if(object.isMesh){
                 console.log(object);
                 object.castShadow = true;
             }   
         })

        console.log(gltf);

        render();

    });

}

// 海
 const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
 //const waterGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
 const water = new Water(waterGeometry, {
     textureWidth: 512,
     textureHeight: 512,
     //transparent: true,
     waterNormals: new THREE.TextureLoader().load(waterTexture,  texture => {
     texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
     }),
     sunDirection: new THREE.Vector3(),
     sunColor: 0xfffff0,
     waterColor: 0x0072ff,
     distortionScale: 4,
     fog: scene.fog !== undefined
 });
 water.rotation.x = - Math.PI / 2;
 //water.depthTest = false;
// water.opacity = .2;
 //water.position.set(0, -5000, 0);
 scene.add(water);

// 天空
const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);
const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 20;
skyUniforms['rayleigh'].value = 2;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;

// 太阳
const sun = new THREE.Vector3();
const pmremGenerator = new THREE.PMREMGenerator(renderer);
const phi = THREE.MathUtils.degToRad(88);
const theta = THREE.MathUtils.degToRad(180);
sun.setFromSphericalCoords( 1, phi, theta );
sky.material.uniforms['sunPosition'].value.copy( sun );
water.material.uniforms['sunDirection'].value.copy(sun).normalize();
scene.environment = pmremGenerator.fromScene(sky).texture;

const manager = new THREE.LoadingManager();
manager.onProgress = async(url, loaded, total) => {
  if (Math.floor(loaded / total * 100) === 100) {
    this.setState({ loadingProcess: Math.floor(loaded / total * 100) });
    Animations.animateCamera(camera, controls, { x: 0, y: 40, z: 140 }, { x: 0, y: 0, z: 0 }, 4000, () => {
      this.setState({ sceneReady: true });
    });
  } else {
    this.setState({ loadingProcess: Math.floor(loaded / total * 100) });
  }
};
    
/* ------------------加载3维模型------------------- */




/* ------------------坐标轴------------------- */
function initAxesHelper(){
    axesHelper = new THREE.AxesHelper(1);
    scene.add(axesHelper);
}
/* ------------------坐标轴------------------- */




/* ------------------阴影------------------- */
function enableShadow(){
    renderer.shadowMap.enabled = true;
    dirLight.castShadow = true;
    pointLight.castShadow = true;
    //ambientLight.castShadow = true;
    plane.receiveShadow = true; 


};
/* ------------------阴影------------------- */



/* ------------------控制器------------------- */
 function initControls(){
    controls = new PointerLockControls( camera, document.body );
    controls.enableDamping = true;
    //controls_boat = new OrbitControls( camera, renderer.domElement );
    const blocker = document.getElementById( 'blocker' );
    const instructions = document.getElementById( 'instructions' );

    instructions.addEventListener( 'click', function () {

        controls.lock();

    } );

    controls.addEventListener( 'lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';

    } );

    controls.addEventListener( 'unlock', function () {

        blocker.style.display = 'block';
        instructions.style.display = '';

    } );

    
    scene.add( controls.getObject() );

    const onKeyDown = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                //model1.position.x += 2 ;

                model1.position.x = camera.position.x+11 ;
                model1.position.z = camera.position.z+2.5 ;
                dist(model1.position.x,camera.position.y,model1.position.z); 
                dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyW_down'); 
                
                //model1.position.x += 0.1 * Math.cos(model1.rotation);
                //model1.position.z += 0.1 * Math.sin(-model1.rotation);
                
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;

                //var direction = new THREE.Vector3();
                //camera.getWorldDirection( direction );
                //model1.position.add( direction );

                //model1.translateX( 2 );
                
                model1.position.x = camera.position.x+5 ;
                model1.position.z = camera.position.z+10 ;
                dist(model1.position.x,camera.position.y,model1.position.z); 
                dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyA_down'); 
                //model.rotateY = 900;
                //model1.position.x = camera.position.x+11 ;
                //model1.position.z = camera.position.z+2.5 ;

                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;

                model1.position.x = camera.position.x-8 ;
                model1.position.z = camera.position.z-1 ;
                dist(model1.position.x,camera.position.y,model1.position.z); 
                dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyS_down'); 
                //model1.translateZ( -3 );

                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;

                model1.position.x = camera.position.x-1 ;
                model1.position.z = camera.position.z-5 ;
                dist(model1.position.x,camera.position.y,model1.position.z); 
                dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyD_down'); 
                //model1.translateX( -2.2 );

                break;

        }

    };

    const onKeyUp = function ( event ) {

        switch ( event.code ) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyW_up'); 
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyA_up'); 
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyS_up'); 
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyD_up'); 
                break;

        }

    };

    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );

    raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    

 }
/* ------------------控制器------------------- */





/* ------------------渲染器------------------- */
function render(){
    requestAnimationFrame( render );

    const time = performance.now();
    const delta = clock.getDelta();

    //var distance = vec1.distanceTo(vec2); 
        
    // var distance = Math.sqrt((camera.position.x - 160) * (camera.position.x - 160) + (camera.position.y - 30) * (camera.position.y - 30) + (camera.position.z - 200) * (camera.position.z - 200)); 

    // if (distance < 100){
    //     controls.lock();
    // }
    
    if ( controls.isLocked === true ) {

        raycaster.ray.origin.copy( controls.getObject().position );
        raycaster.ray.origin.y -= 10;

        const intersections = raycaster.intersectObjects( objects, false );

        const onObject = intersections.length > 0;

        const delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );
        direction.normalize(); // this ensures consistent movements in all directions

        if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

        if ( onObject === true ) {

            velocity.y = Math.max( 0, velocity.y );
            

        }

        controls.moveRight( - velocity.x * delta );
        controls.moveForward( - velocity.z * delta );

        controls.getObject().position.y += ( velocity.y * delta ); // new behavior

        if ( controls.getObject().position.y < 10 ) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            

        }

    }

    prevTime = time;

    

	renderer.render(scene,camera);

    // const loopTime = 10 * 1000; // loopTime: 循环一圈的时间
    // let time_2 = Date.now();
	// let t = (time_2 % loopTime) / loopTime; // 计算当前时间进度百分比
	// setTimeout(function() {
            
    //         var nPos = new THREE.Vector3(camera.position.x,camera. position.y, camera.position.z);
    //         //model1.lookAt(nPos);
    //         // 返回点t在曲线上位置切线向量

	// }, 2000)


    mixer.update(delta);
    mixer2.update(delta);
    mixer4.update(delta);

    
}
/* ------------------渲染器------------------- */



window.addEventListener("mousemove", mousetrack, false);
