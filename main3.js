import * as three from './js/three.js';
import { OrbitControls } from './js/OrbitControls.js';
import {GLTFLoader} from './js/GLTFLoader.js';

import { Sky } from './js/Sky.js';
let renderer, camera, scene, light, meshes;
let mixer,mixer2,mixer3;
let plane, model;
let model1;
let pointLight,ambientLight,dirLight;
let spotLight, lightHelper;
let clock = new THREE.Clock();
let axesHelper;
let controls;

initRenderer();
initCamera();
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
    camera.position.set(100,100,50);
    camera.lookAt(100,300,300);
}

function initScene(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
}
/* ------------------场景三要素初始化------------------- */



/* ------------------灯光------------------- */
function initLight(){
    // light = new THREE.HemisphereLight(0xffffff, 0x444444);
    // light.position.set(0, 1, 0);
    // scene.add(light);
    // dirLight = new THREE.DirectionalLight(0xffffff);
    // dirLight.position.set(-3, 10, 10);
    // scene.add(dirLight);

    ambientLight = new THREE.AmbientLight(0xffffff, .8);
    scene.add(ambientLight);

    dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(.1, 1, .95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(30);
    scene.add(dirLight);

    
    


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
    scene.add(plane);


    //小船
    const smallship_loader = new GLTFLoader();
    smallship_loader.load('models/gltb/BoatWSail_small.glb',function(gltf){
        model1 = gltf.scene;
        scene.add(model1);
        model1.position.set(80, 0, 160);
        model1.rotation.y = - 1;
        
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
        model.position.set(20, 0, 150);
        model.rotation.y = - 2;
        //左右为为X轴，右为正；上下为Y轴；为Z轴
        gltf.scene.traverse( function(object){ 
            // console.log(object.type);
            
            if(object.isMesh){
                //console.log(object);
                object.castShadow = true;
            }   
        })
        model.scale.set(10,10,10);
        render();
    });

}

    



// 天空
const sky = new Sky();
sky.scale.setScalar(10000);
scene.add(sky);
const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 20;
skyUniforms['rayleigh'].value = 2;
skyUniforms['mieCoefficient'].value = 0.005;
skyUniforms['mieDirectionalG'].value = 0.8;


    
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
     controls.target.set(80, 0, 160);
     controls.enableDamping = true;
     controls.enablePan = false;
     controls.maxPolarAngle = 1.5;
     controls.minDistance = 50;
     controls.maxDistance = 1200;

     window.addEventListener("keydown",function(e){
        keyDownWalk(e)
    })
     
     controls.update();

 }


function keyDownWalk(e) {
    let keyCode = e.keyCode;
    let position = model1.position, rotation = model1.rotation.y;
    //model1.rotation=controls.rotation;
    //rotation=this.controls.rotation.y;
    switch (keyCode) {
        case 87:        //w
            position.x += 0.1 * Math.cos(rotation);
            position.z += 0.1 * Math.sin(-rotation);
            break;
        case 65:        //a
            position.x += 0.1 * Math.cos(rotation + Math.PI/2);
            position.z += 0.1 * Math.sin(-rotation - Math.PI/2);
            break;
        case 68:        //d
            position.x += 0.1 * Math.cos(rotation - Math.PI/2);
            position.z += 0.1 * Math.sin(-rotation + Math.PI/2);
            break;
        case 83:        //s
            position.x -= 0.1 * Math.cos(rotation);
            position.z -= 0.1 * Math.sin(-rotation);
            break;
        default:
            break;
    }
}

/* ------------------控制器------------------- */



/* ------------------渲染器------------------- */
function render(){
    const time = performance.now() / 3000;
    const delta = clock.getDelta();
    requestAnimationFrame( render );
   
    
    renderer.render(scene,camera);
    

    // mixer.update(delta);
    


}
/* ------------------渲染器------------------- */
