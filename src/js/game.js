'use strict';

const game = document.getElementById('game');

let ship;
let asteroids = [];
let lasers = [];

function setup() {
  let canvas = createCanvas(600, 400);
  canvas.parent(game);
  ship = Ship();
  for (let i = 0; i < 5; i++) {
    asteroids.push(Asteroid());
  }
}

function draw() {
  background(33);
  ship.render();
  ship.turn();
  ship.update();
  ship.edges();

  for (let i = 0; i < asteroids.length; i++) {
    if (ship.hit(asteroids[i])) {
      console.log('died');
    }
    asteroids[i].render();
    asteroids[i].update();
    asteroids[i].edges();
  }

  for (let i = 0; i < lasers.length; i++) {
    lasers[i].render();
    lasers[i].update();

    if (lasers[i].invisible()) {
      lasers.splice(i, 1);
    }
    else {
      for (let j = asteroids.length - 1; j >= 0; j--) {
        if (lasers[i].hit(asteroids[j])) {
          if (asteroids[j].size > 10) {
            let newAsteroids = asteroids[j].split();
            asteroids = asteroids.concat(newAsteroids);
          }
          // increase score
          asteroids.splice(j, 1);
          lasers.splice(i, 1);
          break;
        }
      }
    }
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    ship.boost(true);
  }
  if (keyCode === RIGHT_ARROW) {
    ship.setRotation(0.1);
  }
  else if (keyCode === LEFT_ARROW) {
    ship.setRotation(-0.1);
  }
  if (key === ' ') {
    lasers.push(Laser(ship.pos, ship.heading()));
  }
}

function keyReleased() {
  ship.setRotation(0);
  ship.boost(false);
}

function Ship() {
  let pos = createVector(width / 2, height / 2);
  let size = 20;
  let heading = 0; //angle
  let rotation = 0;
  let velocity = createVector(1, 0);
  let isBoosting = false;

  function render() {
    push();
    translate(pos.x, pos.y);
    rotate(heading + Math.PI / 2);
    noFill();
    stroke(255);
    triangle(-size, size, size, size, 0, -size);
    pop();
  }

  function update() {
    if (isBoosting) {
      thrust();
    }
    pos.add(velocity);
    velocity.mult(.99);
  }

  function boost(bool) {
    isBoosting = bool;
  }

  function thrust() {
    let force = p5.Vector.fromAngle(heading);
    force.mult(0.1);
    velocity.add(force);
  }

  function setRotation(angle) {
    rotation = angle;
  }

  function edges() {
    if (pos.x > width + size) {
      pos.x = -size;
    }
    else if (pos.x < -size) {
      pos.x = width + size;
    }
    if (pos.y > height + size) {
      pos.y = -size;
    }
    else if (pos.y < -size) {
      pos.y = height + size;
    }
  }

  function turn() {
    heading += rotation;
  }

  function hit(asteroid) {
    let d = dist(pos.x, pos.y, asteroid.pos.x, asteroid.pos.y);
    return d < size + asteroid.size;
  }

  return {
    render: render,
    setRotation: setRotation,
    turn: turn,
    update: update,
    boost: boost,
    hit: hit,
    edges: edges,
    pos: pos,
    size: size,
    heading: _ => heading // ???
  }
}

function Asteroid(pos, size) {
  if (pos) {
    pos = pos.copy();
  }
  else {
    pos = createVector(random(width), random(height));
  }
  if (size) {
    size = size * 0.5
  }
  else {
    size = random(15, 40);
  }


  let vertexPoints = random(15, 25);
  let offset = [];
  let velocity = p5.Vector.random2D();

  for (let i = 0; i < vertexPoints; i++) {
    offset.push(random(-size / 4, size / 4));
  }

  function render() {
    push();
    translate(pos.x, pos.y);
    noFill();
    stroke(255);
    beginShape();
    for (let i = 0; i < vertexPoints; i++) {
      let angle = map(i, 0, vertexPoints, 0, TWO_PI);
      let x = (size + offset[i]) * cos(angle);
      let y = (size + offset[i]) * sin(angle);
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }

  function update() {
    pos.add(velocity);
  }

  function edges() {
    if (pos.x > width + size) {
      pos.x = -size;
    }
    else if (pos.x < -size) {
      pos.x = width + size;
    }
    if (pos.y > height + size) {
      pos.y = -size;
    }
    else if (pos.y < -size) {
      pos.y = height + size;
    }
  }

  function split() {
    let asteroids = [];
    asteroids[0] = Asteroid(pos, size);
    asteroids[1] = Asteroid(pos, size);
    return asteroids;
  }

  return {
    render: render,
    update: update,
    split: split,
    edges: edges,
    pos: pos,
    size: size
  }
}

function Laser(start, angle) {
  let pos = createVector(start.x, start.y);
  let velocity = p5.Vector.fromAngle(angle);
  velocity.mult(10);

  function update() {
    pos.add(velocity);
  }

  function render() {
    push();
    stroke(255);
    strokeWeight(4);
    point(pos.x, pos.y);
    pop();
  }

  function hit(asteroid) {
    let d = dist(pos.x, pos.y, asteroid.pos.x, asteroid.pos.y);
    return d < asteroid.size;
  }

  function invisible() {
    return (pos.x > width || pos.x < 0 || pos.y > height || pos.y < 0);
  }

  return {
    render: render,
    update: update,
    hit: hit,
    invisible: invisible
  }
}
