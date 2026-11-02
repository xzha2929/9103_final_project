/*
 * AI acknowledgement:
 * Generated with the help of ChatGPT.
 * This mechanic analyzes audio amplitude and creates
 * forward-moving water waves using image displacement
 * and subtle traveling highlights.
 *
 * External references:
 * https://v1.p5js.org/reference/p5.sound/
 * Uses loadSound(), p5.Amplitude, and userStartAudio().
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip
 * Restricts the animation to the water surface.
 */

class AudioRiver {
  constructor(painting) {
    this.painting = painting;

    this.track = null;
    this.amplitude = null;

    this.ready = false;
    this.failed = false;
    this.busy = false;

    this.message = "Loading audio...";
    this.sensitivity = 5;

    this.level = 0;
    this.phase = 0;

    // Approximate water boundary for the original painting.
    // The indentation excludes the person and the rock.
    this.waterOutline = [
      [0.000, 0.770],
      [0.250, 0.777],
      [0.480, 0.779],
      [0.630, 0.782],
      [0.606, 0.805],
      [0.565, 0.832],
      [0.510, 0.858],
      [0.425, 0.876],
      [0.365, 0.870],
      [0.356, 0.851],
      [0.338, 0.839],
      [0.305, 0.837],
      [0.270, 0.845],
      [0.220, 0.852],
      [0.200, 0.879],
      [0.145, 0.879],
      [0.090, 0.897],
      [0.000, 0.900]
    ];

    // Increase this value for stronger displacement.
    // Values are measured relative to a 1000-pixel-wide canvas.
    this.maximumDisplacement = 24;

    // Number of traveling wave fronts across the water.
    this.waveCount = 3.2;

    // Source pixels sampled from a water-only rectangle.
    // This avoids pulling the person or shoreline into the waves.
    this.texture = this.createWaterTexture();
  }

  createWaterTexture() {
    const source = this.painting;

    return source.get(
      Math.round(source.width * 0.01),
      Math.round(source.height * 0.785),
      Math.round(source.width * 0.17),
      Math.round(source.height * 0.065)
    );
  }

  load(path) {
    this.track = loadSound(
      path,

      () => {
        this.amplitude = new p5.Amplitude(0.65);
        this.amplitude.setInput(this.track);

        this.ready = true;
        this.message = "Ready. Click Play Audio.";
      },

      (error) => {
        this.failed = true;
        this.message =
          "Audio failed to load. Check assets/music.mp3.";

        console.error("Audio loading failed:", error);
      }
    );
  }

  isPlaying() {
    return this.ready && this.track.isPlaying();
  }

  async togglePlayback() {
    if (!this.ready || this.busy) {
      return;
    }

    this.busy = true;

    try {
      await userStartAudio();

      if (this.track.isPlaying()) {
        this.track.pause();
        this.message = "Paused. The water is settling.";
      } else {
        this.track.loop();
        this.message =
          "Playing. Loudness controls wave strength and forward motion.";
      }
    } catch (error) {
      this.message = "Unable to start audio. Please try again.";
      console.error("Audio playback failed:", error);
    } finally {
      this.busy = false;
    }
  }

  update(elapsedMilliseconds) {
    let target = 0;

    if (this.isPlaying()) {
      const amplitude = this.amplitude.getLevel();

      // Compress the response so quieter passages remain visible.
      target = Math.pow(
        constrain(amplitude * this.sensitivity, 0, 1),
        0.75
      );
    }

    const seconds =
      constrain(elapsedMilliseconds, 0, 50) / 1000;

    // Fast attack and slower release produce readable waves.
    const response = target > this.level ? 12 : 3.5;
    const smoothing = 1 - Math.exp(-seconds * response);

    this.level = lerp(this.level, target, smoothing);

    // Positive phase motion moves wave fronts toward the foreground.
    this.phase += seconds * (
      0.65 + this.level * 2.1
    );
  }

  draw() {
    if (this.level < 0.002) {
      return;
    }

    const context = drawingContext;

    context.save();
    this.clipToWater(context);

    this.drawDisplacedWater();
    this.drawWaveHighlights();

    context.restore();
  }

  drawDisplacedWater() {
    const context = drawingContext;

    const top = height * 0.770;
    const bottom = height * 0.905;
    const waterHeight = bottom - top;

    const sourceScaleY = this.painting.height / height;
    const canvasScale = width / 1000;

    // One destination row per pixel prevents gaps between strips.
    const stripHeight = 1;

    for (let y = top; y < bottom; y += stripHeight) {
      const depth = constrain(
        (y - top) / waterHeight,
        0,
        1
      );

      // Compress wave spacing near the horizon.
      const perspectiveDepth = Math.sqrt(depth);
      const angle =
        perspectiveDepth * TWO_PI * this.waveCount
        - this.phase;

      const mainWave = Math.sin(angle);
      const detailWave = Math.sin(angle * 2.3 + 0.7);

      // Keep the horizon stable while strengthening nearby waves.
      const horizonFade = smoothstep(0, 0.13, depth);
      const perspectiveStrength = Math.pow(depth, 0.8);

      const strength =
        this.level
        * horizonFade
        * perspectiveStrength;

      const displacement =
        (
          mainWave * 0.82
          + detailWave * 0.18
        )
        * this.maximumDisplacement
        * canvasScale
        * strength;

      const horizontalShift =
        Math.sin(angle * 0.65)
        * 9
        * canvasScale
        * strength;

      const sourceY = constrain(
        (y + displacement) * sourceScaleY,
        0,
        this.painting.height - sourceScaleY
      );

      // Fade the deformation in with the audio.
      context.globalAlpha = Math.min(1, this.level * 4);

      context.drawImage(
        this.painting.canvas,
        0,
        sourceY,
        this.painting.width,
        sourceScaleY,
        horizontalShift,
        y,
        width,
        stripHeight
      );

      // Add a faint moving water texture near the foreground.
      // The texture is sampled only from water, avoiding land smears.
      if (depth > 0.2) {
        const textureY =
          (
            perspectiveDepth * this.texture.height * 2
            - this.phase * 5
          ) % this.texture.height;

        const wrappedY =
          (textureY + this.texture.height)
          % this.texture.height;

        context.globalAlpha =
          this.level * perspectiveStrength * 0.12;

        context.drawImage(
          this.texture.canvas,
          0,
          Math.floor(wrappedY),
          this.texture.width,
          1,
          0,
          y,
          width,
          stripHeight
        );
      }
    }

    context.globalAlpha = 1;
  }

  drawWaveHighlights() {
    const top = height * 0.770;
    const bottom = height * 0.905;
    const waterHeight = bottom - top;

    push();
    noFill();

    // Each crest emerges near the horizon and advances forward.
    const cycle = this.phase / TWO_PI;

    for (let index = 0; index < 8; index++) {
      const progress =
        ((cycle + index / 8) % 1 + 1) % 1;

      // Squared progress creates perspective:
      // distant crests are closer together.
      const depth = progress * progress;
      const y = top + depth * waterHeight;

      const fade =
        Math.sin(progress * Math.PI)
        * this.level;

      const alpha = fade * 48;
      const segmentWidth =
        lerp(18, 110, depth) * width / 1000;

      strokeWeight(lerp(0.6, 1.8, depth));
      stroke(255, 222, 191, alpha);

      // Broken lines retain a softer, painted appearance.
      for (let segment = 0; segment < 10; segment++) {
        const centerX =
          (
            segment * 0.085
            + Math.sin(index * 2.1) * 0.025
          ) * width;

        beginShape();

        for (let step = 0; step <= 12; step++) {
          const fraction = step / 12;
          const x =
            centerX + fraction * segmentWidth;

          const curve =
            Math.sin(fraction * Math.PI)
            * lerp(0.5, 3, depth);

          vertex(x, y + curve);
        }

        endShape();
      }
    }

    pop();
  }

  clipToWater(context) {
    context.beginPath();

    this.waterOutline.forEach(([nx, ny], index) => {
      const x = nx * width;
      const y = ny * height;

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });

    context.closePath();
    context.clip();
  }
}

// Smoothly transitions from 0 to 1 across the specified range.
function smoothstep(edge0, edge1, value) {
  const amount = Math.max(
    0,
    Math.min(1, (value - edge0) / (edge1 - edge0))
  );

  return amount * amount * (3 - 2 * amount);
}