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
  let windInput = 0;

  // Hold A to add wind towards the left.
  if (keyIsDown(65)) {
    windInput -= 1;
  }

  // Hold D to add wind towards the right.
  if (keyIsDown(68)) {
    windInput += 1;
  }

  environment.setWind(windInput);
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


function keyPressed() {
  // Create a new seeded random variation.
  if (key === "r" || key === "R") {
    environment.reset(floor(random(1000, 9999)));
  }

  // Pause or resume the environmental animation.
  if (key === "p" || key === "P") {
    environment.togglePause();
  }
}
//when the mouse is pressed, set the wind value based on the mouse position , a and d only provide additional control over the wid direction.