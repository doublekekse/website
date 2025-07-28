import { AmbientLight, DirectionalLight, Group, Mesh, MeshLambertMaterial, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import halfSphere from '/models/half-sphere.obj?url';

const landing = document.getElementById('landing');
const background = document.getElementById('background');

let width = landing.clientWidth;
let height = landing.clientHeight;
let prevTime = performance.now();

const renderer = new WebGLRenderer({ alpha: true, antialias: true });
const camera = new PerspectiveCamera(45, width / height, 1, 1000);

renderer.setSize(width, height);
renderer.setAnimationLoop(wait);

window.addEventListener('resize', () => {
	width = landing.clientWidth;
	height = landing.clientHeight;

	camera.aspect = width / height;

	renderer.setSize(width, height);
	camera.updateProjectionMatrix();
});

background.appendChild(renderer.domElement);

const loader = new OBJLoader();
const scene = new Scene();
const ambientLight = new AmbientLight(0xffffff, .125);
const directionalLight = new DirectionalLight(0xffffff, 1);
const orbit = new Group();
const objects = [];

loader.load(halfSphere, obj => {
	obj.scale.set(1.5, 1.5, 1.5);

	objects[0] = obj.clone();
	objects[1] = obj.clone();
	objects[2] = obj.clone();

	objects[0].traverse(child => {
		if (child instanceof Mesh) {
			child.material = new MeshLambertMaterial({ color: 0xa23db8 });
		}
	});

	objects[1].traverse(child => {
		if (child instanceof Mesh) {
			child.material = new MeshLambertMaterial({ color: 0xbf2a82 });
		}
	});

	objects[2].traverse(child => {
		if (child instanceof Mesh) {
			child.material = new MeshLambertMaterial({ color: 0xca2356 });
		}
	});

	buildScene();
});

function buildScene() {
	camera.position.set(0, 0, 100);

	directionalLight.position.set(5, 20, 20);

	objects[0].position.set(0, 0, -1.5);
	objects[1].position.set(-1.5, 0, 1.5);
	objects[2].position.set(1.5, 0, 1.5);

	const center = new Vector3()
		.add(objects[0].position)
		.add(objects[1].position)
		.add(objects[2].position)
		.multiplyScalar(1 / 3);

	objects[0].position.sub(center);
	objects[1].position.sub(center);
	objects[2].position.sub(center);

	orbit.position.copy(center)

	objects[0].rotation.z = -45;
	objects[2].rotation.z = 45;

	orbit.rotation.x = 45;

	orbit.add(...objects);

	scene.add(ambientLight);
	scene.add(directionalLight);
	scene.add(orbit);

	renderer.setAnimationLoop(animate);
}

function wait(time) {
	prevTime = time;
}

function animate(time) {
	const delta = (time - prevTime) / 1000;

	camera.position.z += (10 - camera.position.z) * 10 * delta;

	objects[0].rotation.y -= .7 * delta;
	objects[0].rotation.z += .5 * delta;
	objects[1].rotation.z += .6 * delta;
	objects[2].rotation.y += .4 * delta;
	objects[2].rotation.z -= .7 * delta;

	orbit.rotation.y -= .3 * delta;
	orbit.rotation.z -= .5 * delta;

	renderer.render(scene, camera);

	prevTime = time;
}
