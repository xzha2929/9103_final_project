let backgroundLayer;
let whiteCloudLayer;
let redHighCloudLayer;
let redMidCloudLayer;
let largeCloudLayer;
let waterLayer;
let sunLayer;
let grassLayer;
let landmarksLayer;
let environment;

function preload() {
  backgroundLayer = loadImage("assets/background-no-clouds-v2.png");
  whiteCloudLayer = loadImage("assets/clouds-white-layer.png");
  redHighCloudLayer = loadImage("assets/clouds-red-high-layer.png");
  redMidCloudLayer = loadImage("assets/clouds-red-mid-layer.png");
  largeCloudLayer = loadImage("assets/clouds-large-layer.png");
  waterLayer = loadImage("assets/water-layer.png");
  sunLayer = loadImage("assets/sun-layer.png");
  grassLayer = loadImage("assets/grass-layer.png");
  landmarksLayer = loadImage("assets/landmarks-layer.png");
}

function setup() {
  const canvas = createCanvas(1200, 923);
  canvas.parent("canvas-container");

  environment = new PerlinEnvironment({
    background: backgroundLayer,
    whiteClouds: whiteCloudLayer,
    redHighClouds: redHighCloudLayer,
    redMidClouds: redMidCloudLayer,
    largeClouds: largeCloudLayer,
    water: waterLayer,
    sun: sunLayer,
    grass: grassLayer,
    landmarks: landmarksLayer,
    seed: 3207,
  });
  environment.build();
}

function draw() {
  environment.setWind(map(constrain(mouseX, 0, width), 0, width, -1, 1));

  environment.update();
  environment.display();
  drawStatus();
}

function drawStatus() {
  push();
  noStroke();
  fill(20, 18, 22, 175);
  rect(18, 18, 270, 58, 10);
  fill(255);
  textSize(15);
  text(environment.paused ? "PAUSED" : "LAYERED ENVIRONMENT", 32, 42);
  fill(255, 190, 150);
  textSize(12);
  text(`seed ${environment.seed}`, 32, 62);
  pop();
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    environment.togglePause();
  }
}

function keyPressed() {
  if (key === "r" || key === "R") {
    environment.reset(floor(random(1000, 9999)));
  }
}