/*
 * AI acknowledgement:
 * This code was generated with the help of ChatGPT.
 * It loads the painting, connects the controls, and calls
 * the independent AudioRiver mechanic.
 *
 * External reference:
 * https://p5js.org/reference/
 * Standard canvas, image loading, and drawing functions.
 */

let painting = null;
let audioRiver = null;

let playButton;
let statusElement;
let sensitivityInput;

function setup() {
  const canvas = createCanvas(1000, 797);
  canvas.parent("canvas-container");

  pixelDensity(1);
  frameRate(60);

  playButton = document.getElementById("play-button");
  statusElement = document.getElementById("status");
  sensitivityInput = document.getElementById("sensitivity");

  playButton.addEventListener("click", async () => {
    if (!audioRiver) {
      return;
    }

    const playback = audioRiver.togglePlayback();

    updateInterface();
    await playback;
    updateInterface();
  });

  sensitivityInput.addEventListener("input", () => {
    if (audioRiver) {
      audioRiver.sensitivity = Number(sensitivityInput.value);
    }
  });

  // Load asynchronously so errors can be displayed in the interface.
  loadImage(
    "assets/painting.jpg",

    (loadedImage) => {
      painting = loadedImage;

      resizeCanvas(
        1000,
        Math.round(1000 * painting.height / painting.width)
      );

      audioRiver = new AudioRiver(painting);
      audioRiver.sensitivity = Number(sensitivityInput.value);
      audioRiver.load("assets/music.mp3");

      updateInterface();
    },

    (error) => {
      statusElement.textContent =
        "Image failed to load. Check assets/painting.jpg and use Live Server.";

      playButton.textContent = "Image Error";
      console.error("Image loading failed:", error);
    }
  );

  describe(
    "A sunset painting with water ripples controlled by " +
    "the loudness and frequency content of an audio track."
  );
}

function draw() {
  background(34, 40, 49);

  if (!painting || !audioRiver) {
    return;
  }

  // Redraw the original every frame to prevent accumulated distortion.
  image(painting, 0, 0, width, height);

  audioRiver.update(deltaTime);
  audioRiver.draw();

  updateInterface();
}

function updateInterface() {
  if (!audioRiver) {
    return;
  }

  playButton.disabled =
    !audioRiver.ready || audioRiver.busy;

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

  if (playButton.textContent !== label) {
    playButton.textContent = label;
  }

  if (statusElement.textContent !== audioRiver.message) {
    statusElement.textContent = audioRiver.message;
  }
}
