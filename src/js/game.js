'use strict';

const game = document.getElementById('game');

let ship;
let asteroids = [];
let lasers = [];
let stars = [];
let shield;
let energy = 100;
let score = 0;
let colorBg = '#171c27';
let colorLaser = '#18ffff';
let minAsteroidSize = 8;

function setup() {
  let canvas = createCanvas(windowWidth * 0.75, windowHeight * 0.75);
  canvas.parent(game);
  ship = Ship();
  shield = Shield();
  for (let i = 0; i < 5; i++) {
    asteroids.push(Asteroid());
  }

  for (let i = 0; i < width / 10; i++) {
    stars.push(Star());
  }
  fill(colorBg);
}

function draw() {
  clear();
  for (let i = 0; i < stars.length; i++) {
    stars[i].render();
  }

  for (let i = 0; i < asteroids.length; i++) {
    if (ship.hit(asteroids[i])) {
      energy -= 0.5;
    }
    asteroids[i].render();
    asteroids[i].update();
    asteroids[i].wraparound();
  }

  for (let i = 0; i < lasers.length; i++) {
    lasers[i].render();
    lasers[i].update();

    if (lasers[i].isOffscreen()) {
      lasers.splice(i, 1);
    }
    else {
      for (let j = asteroids.length - 1; j >= 0; j--) {
        if (lasers[i].hit(asteroids[j])) {
          if (asteroids[j].size > minAsteroidSize) {
            let newAsteroids = asteroids[j].split();
            asteroids = asteroids.concat(newAsteroids);
          }
          score += Math.floor(40 - asteroids[j].size);
          console.log(score);
          lasers.splice(i, 1);
          asteroids.splice(j, 1);
          break;
        }
      }
    }
  }

  ship.render();
  ship.turn();
  ship.update();
  ship.wraparound();

  shield.render();
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
  let isDying = false;

  function render() {
    push();
    translate(pos.x, pos.y);
    rotate(heading + Math.PI / 2);
      console.log(isDying)
    if (isDying) {
      stroke(255, random(0, 255));
    }
    else {
      stroke(255);
    }
    beginShape();
    vertex(-size * 0.75, size);
    vertex(0, size * 0.25);
    vertex(size * 0.75, size);
    vertex(0, -size);
    endShape(CLOSE);
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

  function wraparound() {
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
    if (d < size + asteroid.size) {
      isDying = true;
      return true;
    }
    else {
      isDying = false;
      return false;
    }
  }

  return {
    render: render,
    setRotation: setRotation,
    turn: turn,
    update: update,
    boost: boost,
    hit: hit,
    wraparound: wraparound,
    pos: pos,
    size: size,
    heading: _ => heading // ???
  }
}

function Asteroid(pos, size) {
  let sizeMin = 15;
  let sizeMax = 40;
  let vertexPoints = random(12, 25);
  let offset = [];
  let velocity = p5.Vector.random2D();

  pos = pos ? pos.copy() : createVector(random(width), random(height));
  size = size ? size * 0.5 : random(sizeMin, sizeMax);

  // TODO: smaller ones should move faster
  velocity.mult(sizeMax / (3 * size));

  for (let i = 0; i < vertexPoints; i++) {
    offset.push(random(-size * 0.2, size * 0.2));
  }

  function render() {
    push();
    translate(pos.x, pos.y);
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

  function wraparound() {
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
    wraparound: wraparound,
    pos: pos,
    size: size
  }
}

function Laser(start, angle) {
  let pos = createVector(start.x, start.y);
  let size = 20;
  let velocity = p5.Vector.fromAngle(angle);
  velocity.mult(10);

  function update() {
    pos.add(velocity);
  }

  function render() {
    push();
    stroke(colorLaser);
    strokeWeight(1);
    // point(pos.x, pos.y);
    line(pos.x, pos.y, pos.x + size * Math.cos(angle), pos.y + size * Math.sin(angle));
    pop();
  }

  function hit(asteroid) {
    let d = dist(pos.x, pos.y, asteroid.pos.x, asteroid.pos.y);
    return d < asteroid.size;
  }

  function isOffscreen() {
    return (pos.x > width || pos.x < 0 || pos.y > height || pos.y < 0);
  }

  return {
    render: render,
    update: update,
    hit: hit,
    isOffscreen: isOffscreen
  }
}

function Star() {
  let pos = createVector(random(width), random(height));
  let alpha = random(50, 255);
  let weight = random(1, 4);

  function render() {
    push();
    stroke(255, alpha);
    strokeWeight(weight);
    point(pos.x, pos.y);
    pop();
  }

  return {
    render: render
  }
}

function Shield() {
  let pos = {
    x: 20,
    y: height - 20
  }

  function render() {
    push();
    stroke(colorLaser);
    strokeWeight(4);
    line(pos.x, pos.y, pos.x + energy, pos.y);
    pop();
  }

  return {
    render: render
  }
}
