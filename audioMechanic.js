/*
 * AI acknowledgement:
 * Generated with the help of ChatGPT.
 * Audio amplitude controls traveling waves, foam, and spray.
 * The person and rock are restored as a static foreground layer.
 *
 * References:
 * https://v1.p5js.org/reference/p5.sound/
 * Audio playback and amplitude analysis.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 * Image drawing and polygon clipping.
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

    this.waveCount = 5;
    this.maximumDisplacement = 25;

    // Approximate water boundary for the supplied painting.
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

    // Protect the person, rock, and a small surrounding margin.
    this.foregroundOutline = [
      [0.295, 0.780],
      [0.350, 0.780],
      [0.360, 0.825],
      [0.385, 0.850],
      [0.385, 0.905],
      [0.340, 0.915],
      [0.185, 0.915],
      [0.180, 0.860],
      [0.205, 0.835],
      [0.290, 0.830]
    ];
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
      // Start the audio context through a user interaction.
      await userStartAudio();

      if (this.track.isPlaying()) {
        this.track.pause();
        this.message = "Paused. The water is settling.";
      } else {
        this.track.loop();
        this.message =
          "Playing. Loudness controls waves, foam, and spray.";
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
      target = Math.pow(
        constrain(
          this.amplitude.getLevel() * this.sensitivity,
          0,
          1
        ),
        0.8
      );
    }

    const seconds =
      constrain(elapsedMilliseconds, 0, 50) / 1000;

    // Fast attack and slower release prevent abrupt movement.
    const response = target > this.level ? 11 : 3;
    const smoothing = 1 - Math.exp(-seconds * response);

    this.level = lerp(this.level, target, smoothing);

    // Louder audio increases forward movement speed.
    this.phase += seconds * (0.055 + this.level * 0.15);
  }

  draw() {
    if (this.level < 0.002) {
      return;
    }

    const context = drawingContext;

    context.save();

    // Animate only the water, excluding the protected foreground.
    this.clipAnimationRegion(context);

    push();

    try {
      this.drawDisplacement();
      this.drawBreakingWaves();
    } finally {
      pop();
      context.restore();
    }

    // Keep the person and rock unchanged above all animated layers.
    this.drawProtectedForeground();
  }

  addPolygonPath(context, outline) {
    outline.forEach(([nx, ny], index) => {
      const x = nx * width;
      const y = ny * height;

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });

    context.closePath();
  }

  clipAnimationRegion(context) {
    // First restrict drawing to the water.
    context.beginPath();
    this.addPolygonPath(context, this.waterOutline);
    context.clip();

    // Then remove the protected foreground from that region.
    context.beginPath();
    context.rect(0, 0, width, height);
    this.addPolygonPath(context, this.foregroundOutline);
    context.clip("evenodd");
  }

  drawDisplacement() {
    const context = drawingContext;

    const top = height * 0.770;
    const bottom = height * 0.905;
    const waterHeight = bottom - top;

    const sourceScaleY = this.painting.height / height;
    const canvasScale = width / 1000;

    context.save();
    context.globalAlpha = Math.min(1, this.level * 3);

    for (let y = top; y < bottom; y += 1) {
      const depth = constrain(
        (y - top) / waterHeight,
        0,
        1
      );

      const perspective = Math.sqrt(depth);

      const angle =
        (perspective - this.phase)
        * TWO_PI
        * this.waveCount;

      const edgeFade =
        Math.min(1, depth / 0.12)
        * Math.min(1, (1 - depth) / 0.08);

      const strength =
        this.level
        * Math.pow(depth, 0.75)
        * edgeFade;

      // Layered sine waves create a steeper wave face.
      const wave =
        Math.sin(angle)
        + Math.sin(angle * 2 + 0.5) * 0.28;

      const offsetY =
        wave
        * this.maximumDisplacement
        * canvasScale
        * strength;

      const sourceY = constrain(
        (y + offsetY) * sourceScaleY,
        top * sourceScaleY,
        bottom * sourceScaleY - sourceScaleY
      );

      context.drawImage(
        this.painting.canvas,
        0,
        sourceY,
        this.painting.width,
        sourceScaleY,
        0,
        y,
        width,
        1
      );
    }

    context.restore();
  }

  drawBreakingWaves() {
    const top = height * 0.770;
    const waterHeight = height * 0.135;
    const scale = width / 1000;

    for (let index = 0; index < this.waveCount; index++) {
      const progress =
        (this.phase + index / this.waveCount) % 1;

      // Perspective increases wave spacing toward the foreground.
      const depth = progress * progress;
      const baseY = top + depth * waterHeight;

      const life = Math.pow(
        Math.sin(progress * Math.PI),
        0.7
      );

      const strength = this.level * life;
      const perspective = lerp(0.2, 1, depth);

      const crestHeight =
        (2 + this.level * 13)
        * perspective
        * scale;

      const crest = (x) => {
        return baseY
          + Math.sin(x * 0.012 + index * 1.9)
            * crestHeight
          + Math.sin(x * 0.036 + index)
            * crestHeight * 0.22;
      };

      // A soft shadow gives the wave face more depth.
      noFill();
      stroke(65, 112, 135, strength * 65);
      strokeWeight((2 + depth * 6) * scale);

      beginShape();

      for (let x = 0; x <= width; x += 6) {
        vertex(
          x,
          crest(x) + 4 * perspective * scale
        );
      }

      endShape();

      // A translucent ribbon suggests a curling wave crest.
      noStroke();
      fill(225, 237, 221, strength * 37);

      beginShape();

      for (let x = 0; x <= width; x += 6) {
        vertex(x, crest(x));
      }

      for (let x = width; x >= 0; x -= 6) {
        const ribbonWidth =
          (2 + this.level * 8)
          * perspective
          * scale;

        vertex(x, crest(x) + ribbonWidth);
      }

      endShape(CLOSE);

      this.drawFoam(
        index,
        crest,
        strength,
        perspective,
        scale
      );
    }
  }

  drawFoam(index, crest, strength, perspective, scale) {
    const spacing = 13 * scale;
    const sampleCount = Math.ceil(width / spacing);

    for (let sample = 0; sample < sampleCount; sample++) {
      const seed = index * 1000 + sample * 7;
      const variation = this.hash(seed);

      // Break the foam into irregular fragments.
      if (variation < 0.34) {
        continue;
      }

      const x =
        sample * spacing
        + this.hash(seed + 1) * spacing * 0.5;

      const y = crest(x);

      const foamWidth =
        (3 + variation * 11)
        * perspective
        * scale;

      const foamHeight =
        (0.8 + this.hash(seed + 2) * 2)
        * perspective
        * scale;

      noStroke();

      // Warm highlights match the sunset colors.
      fill(255, 239, 209, strength * 160);
      ellipse(x, y, foamWidth, foamHeight);

      // Smaller fragments trail behind the wave crest.
      fill(238, 241, 221, strength * 90);

      ellipse(
        x - 3 * scale,
        y + (3 + variation * 6) * perspective * scale,
        foamWidth * 0.55,
        foamHeight * 0.7
      );

      // Small spray marks appear during louder passages.
      const sprayStrength = constrain(
        (this.level - 0.4) / 0.6,
        0,
        1
      );

      if (sprayStrength > 0 && variation > 0.72) {
        const lift =
          (4 + this.hash(seed + 3) * 15)
          * sprayStrength
          * perspective
          * scale;

        fill(
          255,
          244,
          223,
          strength * sprayStrength * 145
        );

        ellipse(
          x + 2 * scale,
          y - lift,
          (1 + variation) * perspective * scale,
          (2 + variation * 2) * perspective * scale
        );
      }
    }
  }

  drawProtectedForeground() {
    const context = drawingContext;

    context.save();
    context.beginPath();

    this.addPolygonPath(context, this.foregroundOutline);
    context.clip();

    context.globalAlpha = 1;

    context.drawImage(
      this.painting.canvas,
      0,
      0,
      width,
      height
    );

    context.restore();
  }

  hash(value) {
    // Deterministic variation avoids random frame-to-frame flicker.
    const result =
      Math.sin(value * 127.1 + 311.7) * 43758.5453;

    return result - Math.floor(result);
  }
}