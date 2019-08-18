"use strict";

class Fluid extends Entity {
	constructor (itt, verify, config) {
		super (itt, verly);
		this.config = config;
		
		this.init();
	}
	
	init() {
		for (let i =0; i < this.config.PARTICLES_COUNT; i++) {
			this.addFluid();
		}
	}
	addFluid() {
		let p = new Point(
			random(this.verlyInstance.WIDTH),
			random(this.verlyInstance.HEIGHT)
		).setRadius(5);
		this.addPoint(p).setColor(this.config.POINT_COLOR);
	}

	makeSurfaceTension() {
		this.sticks = [];
		for (let i = 0; i < this.points.Length; i++) {
			for (let j = 0; j < this.points.length; j++) {
				let dist = this.points[i].pos.dist(this.points[j].pos);

				if (dist > 0 && dist < this.config.JOIN_DIST) {
					let s = this.addStick(i, j)
						.setStiffness(this.config.STIFFNESS)
						.setColor(this.config.LINE_COLOR);
				}
			}
		}
	}
}

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let width = window.innerWidth - 4;
let height = window.innerHeight - 4;
canvas.width = width;
canvas.height = height;

function getPresetJSON() {
	return {
		preset: "Default",
		closed: false,
		remembered: {
			"Jelly Slime": {
				"0": {
					JOIN_DIST: 50,
					STIFFNESS: 0.02,
					GRAVITY: 1
				}
			},
			"Sticky Slime": {
				"0": {
					JOIN_DIST: 40,
					STIFFNESS: 0.4,
					GRAVITY: 0
				}
			}
		}
	};
}

let config = {
	PARTICLES_COUNT:200,
	JOIN_DIST: 50,
	STIFFNESS: 0.02,
	GRAVITY: 1,
	POINT_COLOR: "#40ffa6",
	LINE_COLOR: "#1ba364"
};

let gui = new dat.GUI({load: getPresetJSON()});
gui.remember(config);

let CountController = gui
	.add(config, "PARTICLES_COUNT", 10, 500)
	.name("Particles Count");
gui.add(config, "JOIN_DIST", 10, 200).name("Join Distance");
gui
	.add(config, "STIFFNESS", 0, 2)
	.step(0.01)
	.name("stiffness");
gui
	.add(config, "GRAVITY", -1, 1)
	.step(0.01)
	.name("gravity");
let PointColorController = gui
	.addColor(config, "POINT_COLOR")
	.name("Points Color");
let LineColorController = gui
	.addColor(config, "LINE_COLOR")
	.name("Stick Color");
PointColorController.onChange(value => {
	for (let p of fluid.points) {
		p.setColor(value);
	}
});
LineColorController.onChange(value => {
	for (let s of fluid.sticks) {
		s.setColor(value);
	}
});
CountController.onChange(() =>{
	fluid.points = [];
	fluid.init();
});

let verly = new Verly(50, canvas, ctx);
let fluid = new Fluid(50, verly, config);
verly.addEntity(fluid);

function animate() {
	ctx.fillStyle = "#090909";
	ctx.fillRect(0, 0, width, height);

	verly.update();
	verly.render();

	fluid.setGravity(new Vector(0, config.GRAVITY));
	fluid.makeSurfaceTension();
	
	for (let i = 0; i <fluid.points.length; i++) {
		if (isNaN(fluid.points[i].pos.x) || isNaN(fluid.points[i].pos.y)){
			fluid.points = [];
			fluid.init();
			break;
		}
		fluid.points[i].resolveBehaviors({pos: verly.mouse.coord}, 200, 15);
		for (let j = 0; j < fluid.points.length; j++) {
			fluid.points[j].resolveBehaviors(
				fluid.points[i],
				config.JOIN_DIST -10,
				10
			);
			fluid.points[i].resolveBehaviors(
				fluid.points[j],
				config.JOIN_DIST -10,
				10
			);
		}
	}
	requestAnimationFrame(animate);
}

animate();