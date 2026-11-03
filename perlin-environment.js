class PerlinEnvironment {
  constructor(options) {
    this.background = options.background;
    this.whiteClouds = options.whiteClouds;
    this.redHighClouds = options.redHighClouds;
    this.redMidClouds = options.redMidClouds;
    this.largeClouds = options.largeClouds;
    this.water = options.water;
    this.sun = options.sun;
    this.grass = options.grass;
    this.landmarks = options.landmarks;
    this.seed = options.seed;

    this.time = 0;
    this.largeCloudTime = 0;
    this.largeCloudSpeed = 1;
    this.wind = 0;
    this.paused = false;
    this.cloudPhase = 0;
    this.whiteCloudPhase = 0;
    this.midCloudPhase = 0;
    this.frontCloudPhase = 0;
    this.waterPhase = 0;
    this.grassPhase = 0;
  }

  build() {
    randomSeed(this.seed);
    noiseSeed(this.seed);

    // Random values give every seed a repeatable starting variation.
    this.cloudPhase = random(1000);
    this.whiteCloudPhase = random(1000);
    this.midCloudPhase = random(1000);
    this.frontCloudPhase = random(1000);
    this.waterPhase = random(1000);
    this.grassPhase = random(1000);
  }

  update() {
    if (!this.paused) {
      const seconds = deltaTime / 1000;
      this.time += seconds;
      this.largeCloudTime += seconds * this.largeCloudSpeed;
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
    // Draw from farthest to nearest to create a visible parallax effect.
    this.drawWhiteClouds();
    this.drawLargeClouds();
    this.drawMidClouds();
    this.drawFrontClouds();
  }

  drawWhiteClouds() {
    // Two translucent copies travel in opposite directions. This separates the
    // pale brush marks into a soft, slightly disordered background cloud field.
    const xBack =
      sin(this.time * 0.11 + this.whiteCloudPhase) * 22 -
      this.wind * 7;
    const yBack = map(
      noise(this.whiteCloudPhase, this.time * 0.025),
      0,
      1,
      -4,
      4
    );

    push();
    imageMode(CENTER);
    translate(width / 2 + xBack, height / 2 + yBack);
    tint(255, 126);
    image(this.whiteClouds, 0, 0, width, height);
    pop();

    const xFront =
      cos(this.time * 0.14 + this.whiteCloudPhase + 1.6) * 30 +
      this.wind * 9;
    const yFront = sin(this.time * 0.09 + this.whiteCloudPhase) * 6;

    push();
    imageMode(CENTER);
    translate(width / 2 + xFront, height / 2 + yFront);
    tint(255, 112);
    image(this.whiteClouds, 0, 0, width, height);
    pop();
  }

  drawLargeClouds() {
    push();
    imageMode(CENTER);

    // The enlarged cloud crosses the full canvas from left to right.
    // Starting and ending outside the frame hides the loop reset.
    const travelDuration = 60;
    const travel = (0.18 + this.largeCloudTime / travelDuration) % 1;
    const horizontalDrift = lerp(
      -width * 1.02,
      width * 0.62,
      travel
    );
    const verticalDrift = map(
      noise(this.cloudPhase + 20, this.largeCloudTime * 0.025),
      0,
      1,
      -10,
      10
    );
    const cloudScale =
      1.18 + sin(this.largeCloudTime * 0.06 + this.cloudPhase) * 0.025;

    translate(
      width / 2 + horizontalDrift,
      height / 2 + verticalDrift
    );
    scale(cloudScale);
    tint(255, 238);
    image(this.largeClouds, 0, 0, width, height);
    pop();
  }

  drawMidClouds() {
    push();
    imageMode(CENTER);

    // The middle fragments float more quickly and also bob vertically.
    const x =
      sin(this.time * 0.18 + this.midCloudPhase) * 34 +
      this.wind * 16;
    const y = cos(this.time * 0.13 + this.midCloudPhase) * 10;
    const layerScale =
      1.015 + sin(this.time * 0.065 + this.midCloudPhase) * 0.025;

    translate(width / 2 + x, height / 2 + y);
    scale(layerScale);
    tint(255, 218);
    image(this.redMidClouds, 0, 0, width, height);
    pop();
  }

  drawFrontClouds() {
    push();
    imageMode(CENTER);

    // Nearest cloud pieces have the clearest travel and depth change.
    const depthCycle = (sin(this.time * 0.24 + this.frontCloudPhase) + 1) / 2;
    const easedDepth = depthCycle * depthCycle * (3 - 2 * depthCycle);
    const depthScale = lerp(0.93, 1.10, easedDepth);
    const x = lerp(-58, 58, easedDepth) + this.wind * 20;
    const y =
      sin(this.time * 0.16 + this.frontCloudPhase) * 12 +
      map(noise(this.frontCloudPhase + 40, this.time * 0.04), 0, 1, -4, 4);

    translate(width / 2 + x, height / 2 + y);
    scale(depthScale);
    tint(255, 224);
    image(this.redHighClouds, 0, 0, width, height);
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

  setLargeCloudSpeed(value) {
    this.largeCloudSpeed = constrain(value, 0.2, 2);
  }

  togglePause() {
    this.paused = !this.paused;
  }

  reset(newSeed) {
    this.seed = newSeed;
    this.time = 0;
    this.largeCloudTime = 0;
    this.build();
  }
}