import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import dat from 'dat.gui'
//const gui = new dat.gui.GUI();
import gsap from 'gsap';
const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);
const wolrd = {
    plane : {
        width : 400,
        height : 400,
        heightSegment : 50,
        widthSegment : 50
    }
}
//gui.add(wolrd.plane , 'width' , 1 , 500).onChange(() => generatePlane())
//gui.add(wolrd.plane , 'height' , 1 , 500).onChange(() => generatePlane())
//gui.add(wolrd.plane , 'heightSegment' , 1 , 100).onChange(() => generatePlane())
//gui.add(wolrd.plane , 'widthSegment' , 1 , 100).onChange(() => generatePlane())



const generatePlane = () => {
    planeMesh.geometry.dispose();
    const planeGeometry = new THREE.PlaneGeometry(wolrd.plane.width, wolrd.plane.height, wolrd.plane.widthSegment,wolrd.plane.heightSegment);
    planeMesh.geometry = planeGeometry;

    const { array , count } = planeMesh.geometry.attributes.position;
    for (let i = 0; i < array.length; i += 3) {
        // Adjust the z-value randomly to create bump effects
        const x = array[i]
        const y = array[i + 1];
        const z = array[i + 2];
        array[i] = x + (Math.random() - 0.5) * 3
        array[i + 1] = y + (Math.random() -  0.5) * 3
        array[i + 2] =  z + ( Math.random() - 0.5) * 3 ; 
    }

    const colors = [];
    for(let i = 0 ; i < count ; i++) {
        colors.push(0, 0.19, 0.4 )
    } ;
    planeMesh.geometry.attributes.position.originalPosition = array;
    // console.log(planeMesh.geometry.attributes.position)
    planeMesh.geometry.setAttribute('color' , new THREE.BufferAttribute(new Float32Array(colors) , 3) );
}

// Create plane geometry
const planeGeometry = new THREE.PlaneGeometry(wolrd.plane.width , wolrd.plane.height, wolrd.plane.widthSegment, wolrd.plane.heightSegment);
const planeMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    flatShading: true,
    vertexColors : true
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

const textureLoader = new THREE.TextureLoader();
const sphereTexture = textureLoader.load('https://threejs.org/examples/textures/uv_grid_opengl.jpg'); // Texture for better visibility

const loadingPlaneGeometry = new THREE.PlaneGeometry(3 ,3 ,1 ,1);
const loadingPlaneMaterial = new THREE.MeshBasicMaterial({
    side : THREE.DoubleSide ,
    color : 0x00ff03,
    transparent : true,
    opacity : 0
});
const loadingPlaneMesh = new THREE.Mesh(loadingPlaneGeometry , loadingPlaneMaterial);
loadingPlaneMesh.position.x = -810
loadingPlaneMesh.position.z = 8
loadingPlaneMesh.rotation.y += 80


const sphereGeometry = new THREE.SphereGeometry(0.5, 32 , 32);
const sphereMaterial =  new THREE.MeshStandardMaterial({
    map :sphereTexture ,
    transparent: true,
    opacity: 0.8,         
});

const sphereMesh = new THREE.Mesh(sphereGeometry , sphereMaterial);
loadingPlaneMesh.add(sphereMesh)


scene.add(loadingPlaneMesh)

// creating start geometry
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 100000;
const positions = new Float32Array(starsCount * 3)

for (let i = 0; i < starsCount; i+=3) {
    positions[i] =( Math.random() - 0.5 ) * 2000;
    positions[i + 1] = (Math.random() - 0.5) * 2000;
    positions[i + 2] = (Math.random() - 0.5) * 2000;
}
starsGeometry.setAttribute('position' , new THREE.BufferAttribute(positions , 3));

const starMaterial = new THREE.PointsMaterial({color : 0xffffff , size : 0.9});
const stars = new THREE.Points(starsGeometry , starMaterial);
scene.add(stars)

// creating lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 1);
scene.add(light);
const BackLight = new THREE.DirectionalLight(0xffffff, 1);
BackLight.position.set(0, 0, -1);
scene.add(BackLight);

new OrbitControls(camera , renderer.domElement)
camera.position.z = 50;

generatePlane();

// Mark the position attribute as needing an update
planeMesh.geometry.attributes.position.needsUpdate = true;

// Rotate the plane to get a better view of the bumps
// planeMesh.rotation.x = Math.PI / 4;
const mouse = {
    x : undefined ,
    y : undefined
}
let frame = 0;
const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stars.rotation.x += 0.0001;
    stars.rotation.y += 0.0001;
    sphereMesh.rotation.y += 0.1;
    frame += 0.01;
    const {array , originalPosition} = planeMesh.geometry.attributes.position;
    for (let i = 0; i < array.length; i++) {
        array[i] = originalPosition[i] + Math.cos(frame * (Math.random() - 0.5))   * 0.013
        array[i + 1] = originalPosition[i + 1] + Math.sin(frame * (Math.random() - 0.5))   * 0.013
    }
    planeMesh.geometry.attributes.position.needsUpdate = true
    raycaster.setFromCamera(mouse , camera);
    const intersects = raycaster.intersectObject(planeMesh)
    if(intersects.length > 0) {
        
        const {a , b , c} = intersects[0].face
        const {color} = intersects[0].object.geometry.attributes;
        
        color.setX(a , 0.1)
        color.setY(a , 0.5)
        color.setZ(a , 1)

        color.setX(b , 0.1)
        color.setY(b , 0.5)
        color.setZ(b , 1)

        color.setX(c,0.1)
        color.setY(c,0.5)
        color.setZ(c,1)

        intersects[0].object.geometry.attributes.color = color;
        intersects[0].object.geometry.attributes.color.needsUpdate = true;

        const initialColors = {
            r : 0 ,
            g : 0.19 ,
            b : 0.4
        }

        const hoverColors = {
            r : 0.1 ,
            g : 0.5 ,
            b : 1
        }

        gsap.to(hoverColors , {
            r : initialColors.r,
            g : initialColors.g,
            b : initialColors.b,
            onUpdate : () => {
                color.setX(a , hoverColors.r)
                color.setY(a , hoverColors.g)
                color.setZ(a , hoverColors.b)

                color.setX(b , hoverColors.r)
                color.setY(b , hoverColors.g)
                color.setZ(b , hoverColors.b)

                color.setX(c, hoverColors.r)
                color.setY(c, hoverColors.g)
                color.setZ(c, hoverColors.b)

                intersects[0].object.geometry.attributes.color = color;
                intersects[0].object.geometry.attributes.color.needsUpdate = true;
            }
        })
    }
};

animate();


const moveCamera = () => {
    document.getElementById('container').style.display = "none";

    gsap.to(camera.position , {
        x : 0,
        y : 0 ,
        z : 6,
        onComplete : () => {
            gsap.to(camera.position , {
                z : 8,
                duration : 1 ,
                onComplete : () => {
                    gsap.to(camera.rotation , {
                        x : 1.5,
                        y : 1.5 ,
                        duration : 2,
                        onComplete : () => {
                            gsap.to(camera.position , {
                                x : -800 ,
                                duration : 0.8,
                                onComplete : () => {
                                        window.location.href = "https://srikar-bash.vercel.app/"
                                }
                            })
                        }
                    })
                }
            } ) 

        }
    })

}

const btn = document.getElementById('btn')
btn.addEventListener('click' , moveCamera)

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


addEventListener('mousemove'  , (e) => {
    mouse.x = 2 * (e.clientX / innerWidth) - 1
    mouse.y =  - 2 * (e.clientY / innerHeight) + 1

})

