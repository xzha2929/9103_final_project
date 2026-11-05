let backgroundLayer;
let whiteCloudLayer;
let redHighCloudLayer;
let redMidCloudLayer;
let largeCloudLayer;
let waterLayer;
let sunLayer;
let grassLayer;
let landmarksLayer;

// Complete painting used by the audio water effect.
let paintingLayer;

let environment;
let audioRiver;

let playButton;
let statusElement;
let sensitivityInput;

function preload() {
  backgroundLayer = loadImage(
    "assets/background-no-clouds-v2.png"
  );

  whiteCloudLayer = loadImage(
    "assets/clouds-white-layer.png"
  );

  redHighCloudLayer = loadImage(
    "assets/clouds-red-high-layer.png"
  );

  redMidCloudLayer = loadImage(
    "assets/clouds-red-mid-layer.png"
  );

  largeCloudLayer = loadImage(
    "assets/clouds-large-layer.png"
  );

  waterLayer = loadImage(
    "assets/water-layer.png"
  );

  sunLayer = loadImage(
    "assets/sun-layer.png"
  );

  grassLayer = loadImage(
    "assets/grass-layer.png"
  );

  landmarksLayer = loadImage(
    "assets/landmarks-layer.png"
  );

  paintingLayer = loadImage(
    "assets/sunset.jpg"
  );

  // Load the bird member's images if the function exists.
  if (typeof preloadBirdGame === "function") {
    preloadBirdGame();
  }
}

function setup() {
  const canvas = createCanvas(1200, 923);
  canvas.parent("canvas-container");

  pixelDensity(1);
  frameRate(60);

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

  // Create the audio-controlled water.
  audioRiver = new AudioRiver(paintingLayer);
  audioRiver.load("assets/9103bgm.mp3");

  setupAudioControls();
}

function draw() {
  let windInput = 0;

  if (keyIsDown(65)) {
    windInput -= 1;
  }

  if (keyIsDown(68)) {
    windInput += 1;
  }

  environment.setWind(windInput);
  environment.update();
  environment.display();

  // Draw the audio-controlled water over the environment.
  if (audioRiver) {
    audioRiver.update(deltaTime);
    audioRiver.draw();
  }

  // Draw the bird interaction last.
  if (typeof drawBirdGame === "function") {
    drawBirdGame();
  }

  drawStatus();
  updateAudioInterface();
}

function setupAudioControls() {
  playButton =
    document.getElementById("play-button");

  statusElement =
    document.getElementById("status");

  sensitivityInput =
    document.getElementById("sensitivity");

  if (
    !playButton ||
    !statusElement ||
    !sensitivityInput
  ) {
    console.warn("Audio controls are missing.");
    return;
  }

  playButton.addEventListener(
    "click",
    async () => {
      if (!audioRiver) {
        return;
      }

      const playback =
        audioRiver.togglePlayback();

      updateAudioInterface();

      await playback;

      updateAudioInterface();
    }
  );

  sensitivityInput.addEventListener(
    "input",
    () => {
      if (audioRiver) {
        audioRiver.sensitivity =
          Number(sensitivityInput.value);
      }
    }
  );
}

function updateAudioInterface() {
  if (
    !audioRiver ||
    !playButton ||
    !statusElement
  ) {
    return;
  }

  playButton.disabled =
    !audioRiver.ready ||
    audioRiver.busy;

  let label = "Loading Audio...";

  if (audioRiver.failed) {
    label = "Audio Error";
  } else if (audioRiver.busy) {
    label = "Starting...";
  } else if (audioRiver.ready) {
    label = audioRiver.isPlaying()
      ? "Pause Audio"
      : "Play Audio";
  }

  playButton.textContent = label;
  statusElement.textContent =
    audioRiver.message;
}

function drawStatus() {
  push();

  noStroke();
  fill(20, 18, 22, 175);
  rect(18, 18, 270, 58, 10);

  fill(255);
  textSize(15);

  text(
    environment.paused
      ? "PAUSED"
      : "LAYERED ENVIRONMENT",
    32,
    42
  );

  fill(255, 190, 150);
  textSize(12);

  text(
    `seed ${environment.seed}`,
    32,
    62
  );

  pop();
}

function keyPressed() {
  if (key === "r" || key === "R") {
    environment.reset(
      floor(random(1000, 9999))
    );
  }

  if (key === "p" || key === "P") {
    environment.togglePause();
  }
}

// Pass mouse interaction to the bird mechanic.
function mousePressed() {
  if (
    typeof birdMousePressed === "function"
  ) {
    birdMousePressed();
  }
}

function mouseDragged() {
  if (
    typeof birdMouseDragged === "function"
  ) {
    birdMouseDragged();
  }
}

function mouseReleased() {
  if (
    typeof birdMouseReleased === "function"
  ) {
    birdMouseReleased();
  }
}
