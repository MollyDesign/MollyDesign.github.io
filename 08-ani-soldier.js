import * as THREE from './js/three';
import { OrbitControls } from './js/OrbitControls';
import {GLTFLoader} from './js/GLTFLoader.js';

let renderer, camera, scene, light, meshes;
let mixer;
let plane, model;
let dirLight;
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
    // camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, this.window.innerHeight);
})


/* ------------------场景三要素初始化------------------- */
function initRenderer() {
    renderer = new THREE.WebGL1Renderer();
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.body.appendChild(renderer.domElement);
}

function initCamera(){
    camera = new THREE.PerspectiveCamera(40,window.innerWidth/window.innerHeight, 1, 20000);
    camera.position.set(0,600,1600);
    camera.lookAt(0,1,0);
}

function initScene(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    //scene.fog= new THREE.Fog(0xa0a0a0, 10, 50);//场景虚化
}
/* ------------------场景三要素初始化------------------- */



/* ------------------灯光------------------- */
function initLight(){
    light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 1, 0);
    scene.add(light);
    dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-3, 10, 10);
    scene.add(dirLight);
}
/* ------------------灯光------------------- */



/* ------------------加载3维模型------------------- */
function initMeshes(){
    //plane
    plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({
        color:0x999999
    })
    );
    plane.rotation.x = - Math.PI / 2;
    scene.add(plane);

    //model
    const loader = new GLTFLoader();
    loader.load('models/gltb/island_dqz.glb',function(gltf){
        scene.add(gltf.scene);

        
        gltf.scene.traverse( function(object){ 
            // console.log(object.type);
            
            if(object.isMesh){
                //console.log(object);
                object.castShadow = true;
            }   
        })

        //让模型动起来
        // const clip = gltf.animations[3];
        // mixer = new THREE.AnimationMixer(gltf.scene);
        // const action = mixer.clipAction(clip);
        // action.play();
        // console.log(gltf);

        render();
    });



}
    
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
    plane.receiveShadow = true; 


};
/* ------------------阴影------------------- */



/* ------------------控制器------------------- */
function initControls(){
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1, 0);
    controls.update();
}
/* ------------------控制器------------------- */



/* ------------------渲染器------------------- */
function render(){

    let delta = clock.getDelta();
    requestAnimationFrame( render );
    renderer.render(scene,camera);

    // mixer.update(delta);
}
/* ------------------渲染器------------------- */
