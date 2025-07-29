import { Camera, Geometry, Mesh, Program, Renderer, Transform } from 'ogl';
import { degToRad, hexToRgb, loadObj } from './utils';
import halfSphere from '/models/half-sphere.obj?url';

const material = {
	vertex: /* glsl */ `
		attribute vec3 position;
		attribute vec3 normal;

		uniform mat4 modelMatrix;
		uniform mat4 projectionMatrix;
		uniform mat4 viewMatrix;

		varying vec3 vNormal;
		varying vec3 vPosition;

		void main() {
			vNormal = mat3(modelMatrix) * normal;
			vPosition = (modelMatrix * vec4(position, 1.0)).xyz;

			gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
		}
	`,
	fragment: /* glsl */ `
		precision highp float;

		uniform vec3 color;
		uniform vec3 ambientColor;
		uniform vec3 lightPos;

		varying vec3 vNormal;
		varying vec3 vPosition;

		void main() {
			vec3 normal = normalize(vNormal);
			vec3 lightDir = normalize(lightPos - vPosition);
			vec3 light = ambientColor + max(dot(normal, lightDir), 0.0);

			gl_FragColor = vec4(color * light, 1.0);
		}
	`
};

export async function renderBackground() {
	const landing = document.getElementById('landing');
	const background = document.getElementById('background');

	let width = landing.clientWidth;
	let height = landing.clientHeight;
	let prevTime = 0;

	// Set up the renderer
	const renderer = new Renderer({ alpha: true, antialias: true, dpr: .25 });
	const gl = renderer.gl;
	const camera = new Camera(gl);

	renderer.setSize(width, height);
	camera.perspective({ aspect: width / height });

	camera.position.z = 100;

	window.addEventListener('resize', () => {
		width = landing.clientWidth;
		height = landing.clientHeight;

		renderer.setSize(width, height);
		camera.perspective({ aspect: width / height });
	});

	// Create three differently colored half spheres
	const objects = [];
	const model = await loadObj(halfSphere);
	const objectColors = [0xa23db8, 0xbf2a82, 0xca2356];
	const ambientColor = hexToRgb(0x202020);
	const lightPos = [5, 20, 20];

	for (let i = 0; i < 3; i++) {
		objects[i] = new Mesh(gl, {
			geometry: new Geometry(gl, model),
			program: new Program(gl, {
				vertex: material.vertex,
				fragment: material.fragment,
				uniforms: {
					color: { value: hexToRgb(objectColors[i]) },
					ambientColor: { value: ambientColor },
					lightPos: { value: lightPos }
				}
			})
		});
	}

	// Build the scene
	const scene = new Transform();
	const orbit = new Transform();

	orbit.addChild(objects[0]);
	orbit.addChild(objects[1]);
	orbit.addChild(objects[2]);

	scene.addChild(orbit);

	orbit.position.z = 1 / 3;

	objects[0].position.set(0, 0, -4 / 3);
	objects[1].position.set(-1, 0, 2 / 3);
	objects[2].position.set(1, 0, 2 / 3);

	orbit.rotation.x = degToRad(45);

	objects[0].rotation.z = degToRad(45);
	objects[2].rotation.z = degToRad(-45);

	function animate(time) {
		const delta = (time - prevTime) / 1000;

		camera.position.z += (20 / 3 - camera.position.z) * 10 * delta;

		objects[0].rotation.y -= .7 * delta;
		objects[0].rotation.z += .5 * delta;
		objects[1].rotation.z += .6 * delta;
		objects[2].rotation.y += .4 * delta;
		objects[2].rotation.z -= .7 * delta;

		orbit.rotation.y -= .3 * delta;
		orbit.rotation.z -= .5 * delta;

		prevTime = time;

		renderer.render({ scene, camera });
		requestAnimationFrame(animate);
	}

	prevTime = performance.now();

	background.appendChild(gl.canvas);
	requestAnimationFrame(animate);
}
