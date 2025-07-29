/**
 * Convert degrees to radians
 */
export function degToRad(deg) {
	return (deg * Math.PI) / 180;
}

/**
 * Convert a color in hexadecimal notion to RGB values
 */
export function hexToRgb(hex) {
	return [
		((hex >> 16) & 255) / 255,
		((hex >> 8) & 255) / 255,
		(hex & 255) / 255
	]
}

/**
 * Load and parse an OBJ file
 */
export async function loadObj(url) {
	const res = await fetch(url);
	const text = await res.text();
	const lines = text.split('\n');
	const v = [];
	const vn = [];
	const f = [];
	const positions = [];
	const normals = [];

	// Parse the file
	for (const line of lines) {
		const parts = line.split(' ');
		const type = parts.shift();

		if (type === 'v') {
			v.push(...parts.map(parseFloat));
		} else if (type === 'vn') {
			vn.push(...parts.map(parseFloat));
		} else if (type === 'f') {
			f.push(parts);
		}
	}

	// Parse and triangulate faces
	for (const face of f) {
		for (let i = 1; i < face.length - 1; i++) {
			const tri = [face[0], face[i], face[i + 1]];

			for (const vert of tri) {
				const [posIndex, _, normIndex] = vert.split('/').map(i => parseInt(i) - 1);

				positions.push(...v.slice(posIndex * 3, posIndex * 3 + 3));
				normals.push(...vn.slice(normIndex * 3, normIndex * 3 + 3));
			}
		}
	}

	return {
		position: { size: 3, data: new Float32Array(positions) },
		normal: { size: 3, data: new Float32Array(normals) }
	}
}
