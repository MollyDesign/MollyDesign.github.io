import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'three/examples/jsm/objects/Water';
const waterTexture = document.getElementById("img-material")
const lensflareTexture0 = document.getElementById("img-material-1")
const lensflareTexture1 = document.getElementById("img-material-2")
import { Sky } from 'three/examples/jsm/objects/Sky';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';



let renderer, camera, scene, light, meshes;
let mixer,mixer2,mixer3,mixer4;
let plane, model;
let model1;
let pointLight,ambientLight,dirLight;
let clock = new THREE.Clock();
let axesHelper;
let controls;

var username = prompt("Username, please.")
var serverPath = "https://kaoyan1.eu.pythonanywhere.com/threejs/get_mousedata";

$.getJSON(serverPath,
         {username: username,
          timeMark: Date.now(),
          objname: "homepage",
          action: "landing",
          x: 0,
          y: 0 },
         function(data) {console.log(data)}
        )

function mousetrack (event) {
    
   $.getJSON(serverPath,
         {username: username,
          timeMark: Date.now(),
          objname: "view",
          action: event.type,
          x: event.clientX,
          y: event.clientY },
         function(data) {console.log(data)})
}


initRenderer();
initCamera();


const vec1 = new THREE.Vector3(160,30,200);//终点flag坐标
function dist(x0,y0,z0){
    const vec2 = new THREE.Vector3(x0, y0, z0);

    var distance = vec1.distanceTo(vec2); //到终点的距离

    if (distance <= 31){
        console.log('Arrive!!');
        $("body").html('<center>Thank you!</center>');
    }
    console.log(distance);
}

const vec_boat = new THREE.Vector3(20, 0, 70);
function dist_boat(x0,y0,z0,keypress){

    const vec2 = new THREE.Vector3(x0, y0, z0);
    var distance_boat = vec2.distanceTo(vec_boat); 
    console.log(distance_boat);

    $.getJSON(serverPath,
        {username: username,
         timeMark: Date.now(),
         objname: "boat_distance",
         action: keypress,
         x: distance_boat,
         y: 0 },
        function(data) {console.log(data)}
       )

}


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
    renderer = new THREE.WebGL1Renderer({ alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);
}

function initCamera(){
    camera = new THREE.PerspectiveCamera(40,window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(300,120,505);
    camera.lookAt(200,8,200);
}

function initScene(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xCAE1FF);
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
        model.rotation.y = 45;
        mixer4 = new THREE.AnimationMixer(model);
        mixer4.clipAction(gltf.animations[0]).play();
        gltf.scene.traverse( function(object){ 
            // console.log(object.type);
            
            if(object.isMesh){
                //console.log(object);
                //object.castShadow = true;
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
        model.position.set(200, -1, 200);
        model.rotation.y = - 10;
        gltf.scene.traverse( function(object){ 
            if(object.isMesh){
                object.material.roughness = .6;
            }   
        })

        model.scale.set(20,20,20);
        render();
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

    //decoration flag on big boat
    const deco_loader = new GLTFLoader();
    deco_loader.load('models/gltb/minemarkerflag_animated.glb',function(gltf){
        model = gltf.scene;
        scene.add(model);
        model.position.set(-1, 10, 65);
        model.rotation.y = - 30;
        mixer3 = new THREE.AnimationMixer(model);
        mixer3.clipAction(gltf.animations[0]).play();
        gltf.scene.traverse( function(object){ 
            // console.log(object.type);
            
            if(object.isMesh){
                //console.log(object);
                object.castShadow = true;
            }   
        })
        model.scale.set(.2,.2,.2);
        //render();
    });

    //火烈鸟
    const bird_loader = new GLTFLoader();
    bird_loader.load('models/gltb/flamingo.glb',function(gltf){
        const mesh = gltf.scene.children[0];
        mesh.scale.set(.35, .35, .35);
        mesh.position.set(-100, 80, -300);
        mesh.rotation.y = - 1;
        mesh.castShadow = true;
        scene.add(mesh);

        const bird2 = mesh.clone();
        bird2.position.set(150, 80, -500);
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
     controls = new OrbitControls(camera, renderer.domElement);
     controls.target.set(160, 30, 200);
     controls.enableDamping = true;
     controls.autoRotate=false;
     controls.enablePan = false;
     controls.maxPolarAngle = 1.5;
     //controls.minDistance = 50;
     //controls.maxDistance = 1200;

    window.addEventListener("keydown",function(e){
        keyDownWalk(e)
    })

    window.addEventListener("keyup",function(e){
        keyUpPalse(e)
    })
     
    controls.update();

 }


function keyDownWalk(e) {
    let keyCode = e.keyCode;
    let position = model1.position, rotation = model1.rotation.y;
    
    switch (keyCode) {

        case 87:        //w
            position.x += 1.5 * Math.cos(rotation - Math.PI/2);
            position.z += 1.5 * Math.sin(-rotation + Math.PI/2);
            dist(model1.position.x,model1.position.y,model1.position.z); 
            dist_boat(model1.position.x,model1.position.y,model1.position.z,'KeyW_down'); 

            break;
        case 65:        //a
            position.x += 1.5 * Math.cos(rotation);
            position.z += 1.5 * Math.sin(-rotation);
            dist(model1.position.x,model1.position.y,model1.position.z); 
            dist_boat(model1.position.x,model1.position.y,model1.position.z,'KeyA_down'); 

            break;
        case 68:        //d
            position.x -= 1.5 * Math.cos(rotation);
            position.z -= 1.5 * Math.sin(-rotation);
            dist(model1.position.x,model1.position.y,model1.position.z); 
            dist_boat(model1.position.x,model1.position.y,model1.position.z,'KeyD_down'); 

            break;
        case 83:        //s
            position.x += 1.5 * Math.cos(rotation + Math.PI/2);
            position.z += 1.5 * Math.sin(-rotation - Math.PI/2);
            dist(model1.position.x,model1.position.y,model1.position.z); 
            dist_boat(model1.position.x,model1.position.y,model1.position.z,'KeyS_down'); 

            break;
        default:
            break;
    }
}

function keyUpPalse(e) {
    let keyCode = e.keyCode;
    switch (keyCode) {

        case 87:        //w
            dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyW_up'); 

            break;
        case 65:        //a
            dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyA_up'); 

            break;
        case 68:        //d
            dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyD_up'); 

            break;
        case 83:        //s
            dist_boat(model1.position.x,camera.position.y,model1.position.z,'KeyS_up'); 

            break;
        default:
            break;
    }
}

/* ------------------控制器------------------- */



/* ------------------渲染器------------------- */
function render(){
    //const time = performance.now() / 3000;
    const delta = clock.getDelta();
    requestAnimationFrame( render );
   
    //camera.lookAt(model1.position);
    // spotLight.rotation.y += 0.01;
	// spotLight.position.x = Math.cos( time ) * 25;
	// spotLight.position.z = Math.sin( time ) * 25;

	renderer.render(scene,camera);
    //lightHelper.update();

    mixer.update(delta);
    mixer2.update(delta);
    mixer3.update(delta);
    mixer4.update(delta);
}
/* ------------------渲染器------------------- */

window.addEventListener("mousemove", mousetrack, false);
window.addEventListener("mousedown", mousetrack, false);
window.addEventListener("mouseup", mousetrack, false);