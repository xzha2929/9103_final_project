class PerlinEnvironment {
  constructor(options) {
    this.background = options.background;
    this.smallClouds = options.smallClouds;
    this.largeClouds = options.largeClouds;
    this.water = options.water;
    this.sun = options.sun;
    this.grass = options.grass;
    this.landmarks = options.landmarks;
    this.seed = options.seed;

    this.time = 0;
    this.wind = 0;
    this.paused = false;
    this.cloudPhase = 0;
    this.waterPhase = 0;
    this.grassPhase = 0;
  }

  build() {
    randomSeed(this.seed);
    noiseSeed(this.seed);

    // Random values give every seed a repeatable starting variation.
    this.cloudPhase = random(1000);
    this.waterPhase = random(1000);
    this.grassPhase = random(1000);
  }

  update() {
    if (!this.paused) {
      this.time += deltaTime / 1000;
    }
  }

  display() {
    image(this.background, 0, 0, width, height);
    this.drawClouds();
    this.drawSun();
    this.drawWater();
    this.drawMovingShadow();
    image(this.landmarks, 0, 0, width, height);
    this.drawGrass();
  }

  drawClouds() {
    this.drawLargeClouds();
    this.drawSmallClouds();
  }

  drawLargeClouds() {
    push();
    imageMode(CENTER);

    // The broad background cloud only drifts sideways. It does not scale.
    const horizontalDrift =
      sin(this.time * 0.09 + this.cloudPhase) * 4 +
      map(noise(this.cloudPhase + this.time * 0.025), 0, 1, -3, 3);
    translate(
      width / 2 + horizontalDrift + this.wind * 5,
      height / 2
    );
    tint(255, 242);
    image(this.largeClouds, 0, 0, width, height);
    pop();
  }

  drawSmallClouds() {
    push();
    imageMode(CENTER);

    // The separate small clouds move slowly forward and backward in depth.
    const depthCycle = (sin(this.time * 0.11 - HALF_PI) + 1) / 2;
    const easedDepth = depthCycle * depthCycle * (3 - 2 * depthCycle);
    const depthScale = lerp(0.94, 1.075, easedDepth);
    const horizontalDrift = lerp(-10, 12, easedDepth) + this.wind * 7;
    const verticalDrift = map(
      noise(this.cloudPhase + 300, this.time * 0.035),
      0,
      1,
      -3,
      3
    );

    translate(width / 2 + horizontalDrift, height / 2 + verticalDrift);
    scale(depthScale);
    tint(255, 235);
    image(this.smallClouds, 0, 0, width, height);
    pop();
  }

  drawWater() {
    const waterOffsetY = 190;
    const visibleWidth = width * 0.72;

    // The water is intentionally static in this version.
    image(
      this.water,
      0,
      waterOffsetY,
      visibleWidth,
      height,
      0,
      0,
      this.water.width * 0.72,
      this.water.height
    );
  }

  drawGrass() {
    const sourceStripWidth = 8;
    const grassOffsetY = 78;

    // Vertical strips shift sideways to suggest wind passing through the field.
    for (let sourceX = 0; sourceX < this.grass.width; sourceX += sourceStripWidth) {
      const destinationX = map(sourceX, 0, this.grass.width, 0, width);
      const sway =
        sin(this.time * 0.85 + sourceX * 0.018 + this.grassPhase) * 5.2 +
        map(
          noise(this.grassPhase + sourceX * 0.01, this.time * 0.32),
          0,
          1,
          -1.5,
          1.5
        );

      image(
        this.grass,
        destinationX + sway,
        grassOffsetY,
        map(sourceStripWidth + 1, 0, this.grass.width, 0, width),
        height,
        sourceX,
        0,
        sourceStripWidth,
        this.grass.height
      );
    }
  }

  drawSun() {
    // It takes about 35 seconds for the sun to complete this gentle rise.
    const progress = constrain(this.time / 35, 0, 1);
    const easedProgress = progress * progress * (3 - 2 * progress);
    const rise = 70 + lerp(22, -42, easedProgress);

    push();
    tint(255, 245);
    image(this.sun, 0, rise, width, height);
    pop();
  }

  drawMovingShadow() {
    const sunProgress = constrain(this.time / 35, 0, 1);
    const sunEase = sunProgress * sunProgress * (3 - 2 * sunProgress);
    const cloudProgress = constrain(this.time / 45, 0, 1);
    const cloudEase = cloudProgress * cloudProgress * (3 - 2 * cloudProgress);

    // The rising sun shortens the shadow; the passing cloud moves it sideways.
    const shadowX =
      lerp(width * 0.76, width * 0.63, sunEase) +
      lerp(-35, 38, cloudEase) +
      this.wind * 10;
    const shadowY = lerp(height * 0.89, height * 0.86, sunEase);
    const shadowWidth = lerp(width * 0.34, width * 0.22, sunEase);
    const shadowHeight = lerp(62, 38, sunEase);
    const cloudShade = map(
      noise(this.cloudPhase + 700, this.time * 0.045),
      0,
      1,
      15,
      34
    );

    push();
    noStroke();
    blendMode(MULTIPLY);

    // Several transparent shapes create a soft painterly shadow edge.
    fill(72, 69, 96, cloudShade * 0.35);
    ellipse(shadowX, shadowY, shadowWidth * 1.25, shadowHeight * 1.35);
    fill(68, 63, 88, cloudShade * 0.55);
    ellipse(shadowX + 18, shadowY - 3, shadowWidth, shadowHeight);
    fill(58, 57, 82, cloudShade * 0.4);
    ellipse(
      shadowX - shadowWidth * 0.28,
      shadowY + 8,
      shadowWidth * 0.62,
      shadowHeight * 0.72
    );
    blendMode(BLEND);
    pop();
  }

  setWind(value) {
    this.wind = value;
  }

  togglePause() {
    this.paused = !this.paused;
  }

  reset(newSeed) {
    this.seed = newSeed;
    this.time = 0;
    this.build();
  }
}