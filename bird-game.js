let img;
let nestImg;
let cloudImg;
let birdImg;
let birds = [];// array to hold birds objects.
let windPath = []; // array to hold the wind path.
let score = 0;
let totalBirds = 5;
let goalX = 850;
let goalY = 250;
let goalSize = 100;
let saveBirds = [];
let cloudX = 0;
let cloudSpeed = 1;
let gameOver = false;
let birdUp;
let birdDown;
let birdMid;
let cloudBaseSpeed = 1;
let gameStarted = false;
let isDrawing = false;

function preloadBirdGame() {
  nestImg = loadImage("libraries/nest.png");
  cloudImg = loadImage("libraries/cloud.png");
  birdImg = loadImage("libraries/birds.png");
  birdUp = loadImage("libraries/birdup.png");
  birdDown = loadImage("libraries/birddown.png");
  birdMid = loadImage("libraries/birdmid.png");
}
function drawBirdGame()
{
  image(nestImg, 660, 150, 350, 280);
  moveClouds();
  drawClouds();
  drawSavedBirds();
  // update and display the birds
  for (let bird of birds){// loop through the birds array and update and display each bird
    bird.update();// update the position of the bird and move
    bird.display();// draw the bird on the canvas.
    //calculate distance between bird and nest
    if (gameOver === false){
      checkCloudCollision(bird);
    }
    let distance = dist(
      bird.x, bird.y,
      goalX, goalY,
    );

    //check if the bird reaches the nest and the clouds move faster.
    if (distance < goalSize / 2 && gameOver === false){
      score++;

      saveBirds.push(bird);
      //increase cloud speed after saving a bird
      if (cloudSpeed > 0){
        cloudSpeed = cloudBaseSpeed + score * 0.5;
      }else{
        cloudSpeed = -(cloudBaseSpeed + score *0.5);
      }

      birds = [];
      windPath = [];

      break;
    }
  }
  //draw the wind path
  noFill();
  stroke(255);
  strokeWeight(4);
  beginShape();
  for (let point of windPath){
    vertex(point.x, point.y);//connect the points in the windPath array to create a line.
  }
  endShape();
  //draw UI elements
  drawGameUI();
  if (gameOver === true){
    drawGameOver();
  }
  
  if (score === totalBirds){
    drawVictory();
  }
  if (gameStarted === false){
    drawInstructions();
  }
}
// create birds when mouse is pressed
function birdMousePressed(){
      //start game button
    if(gameStarted === false){
      if(
        mouseX >= 375 &&
        mouseX <= 625 &&
        mouseY >= 640 &&
        mouseY <= 710
      ){
        gameStarted = true;
      }
      return;
    }
  //click try again button, the game begin again.
  if(gameOver === true){
    if(
      mouseX >= 375 &&
      mouseX <= 625 &&
      mouseY >= 520 &&
      mouseY <= 590 
    ){
      birds = [];
      windPath = [];
      gameOver = false;
    }
    return;
  }
  //click play again button, the game begin again.
  if (score === totalBirds){
    if(
      mouseX >= 375 &&
      mouseX <= 625 &&
      mouseY >= 520 &&
      mouseY <= 590
    ){
      restartGame();
    }
    return;
  }
  //check restart button
  if(mouseX >= 450 &&
    mouseX <= 620 &&
    mouseY >= 160 &&
    mouseY <= 225
  )
  {
    restartGame();
    return;
  }
  windPath = [];

  if (birds.length === 0 && score < totalBirds &&
    mouseX >= 100 &&
    mouseX <= 400 &&
    mouseY >= 300 &&
    mouseY<= 700
  ){
    birds.push(new Bird(mouseX, mouseY));
  }
    for (let bird of birds){
      bird.pathIndex = 0;
    }
  }

//draw the wind path when mouse is dragged
function birdMouseDragged(){
  if (gameStarted === false || gameOver === true){
    return;
  }
  isDrawing = true;
  for (let bird of birds){
    bird.moving = false;
  }
  windPath.push({
    x: mouseX,
    y: mouseY,
  })
}
//Make the bird fly only after the mouse is released
function birdMouseReleased(){
  if(gameStarted === false || gameOver === true){
    return;
  }
  
  isDrawing = false;

  if (windPath.length > 0){
    for(let bird of birds){
      bird.pathIndex = 0;
      bird.moving = true;
    }
  }
}

// create bird objects
class Bird {
  constructor(x, y){
    this.x = x;
    this.y = y;
    this.size = random(8, 15);
    this.pathIndex = 0;
    this.moving = false;

  }
  update(){
    //This code, which makes a bird fly along the lines of a drawing, uses AI.
    if (this.moving === true){
      if(this.pathIndex < windPath.length){
        let point = windPath[this.pathIndex];
        this.x = lerp(this.x, point.x, 0.6);
        this.y = lerp(this.y, point.y, 0.6);

        if(abs(this.x - point.x)<2 &&
      abs(this.y - point.y)<2){
        this.pathIndex++;
      }
      }
    }
  }
  display(){
     let wingFrame = frameCount % 24;
     let currentBird = birdMid;
     if (this.moving === true){
      if(wingFrame < 6){
        currentBird = birdUp;
      }else if (wingFrame < 12){
        currentBird = birdMid;
      }else if (wingFrame < 18){
        currentBird = birdDown;
      }else {
        currentBird = birdMid;
      }
     }
     image(currentBird, this.x - 20, this.y - 20, 40, 40);
  }
}

function restartGame(){
  birds = [];
  saveBirds = [];
  windPath = [];
  score = 0;
  cloudX = 0;
  cloudSpeed = cloudBaseSpeed;
  gameOver = false;
}
//draw the UI elements
function drawGameUI(){
//creat a score box
  push();
  noStroke();
  fill(241, 183, 130, 255);
  rect(30, 125, 400, 125, 30);
  fill(20);
  textAlign(LEFT, CENTER);
  textSize(27);
  textStyle(BOLD);
  text("Score: " + score, 60, 165);

  
  textAlign(RIGHT, CENTER);
  text(score + "/" + totalBirds, 400, 165);
  noStroke();
  fill(255, 227, 204);
  rect(50, 190, 355, 30, 15);


//progress bar fill
fill(245, 128, 33);
let progressWidth = 355 * score / totalBirds;
rect(50, 190, progressWidth, 30, 15);
//restart button
fill(245, 128, 33);
rect(450, 160, 170, 65, 20);
fill(255);
textAlign(CENTER, CENTER);
textSize(30);
textStyle(BOLD);
text("Restart", 535, 190);

pop();
}
//create a victory window
function drawVictory(){
  push();

  //victory window
  fill(255, 239, 218);
  rect(250, 300, 500, 350, 30);
  //text
  fill(170, 90, 40);
  textAlign(CENTER, CENTER);
  textSize(42);
  textStyle(BOLD);
  text("Congratulations!", 500, 380);
  //secondary text
  textSize(25);
  textStyle(NORMAL);
  text("You saved 5 birds!", 500, 450);

  //play again button
  fill(245, 128, 33);
  rect(375, 520, 250, 70, 20);
  fill(255);
  textSize(30);
  textStyle(BOLD);
  text("Play Again", 500, 555);
  pop();
}

function drawSavedBirds(){
  for(let i = 0; i < saveBirds.length; i++){
    image(birdImg, 825 + i * 12, 245, 50, 50);
}
}

function drawClouds(){
  image(cloudImg, 200 + cloudX, 300, 650, 350);
}
function moveClouds(){
  cloudX += cloudSpeed;

  if (cloudX >= 100){
    cloudX = 100;
    cloudSpeed = -abs(cloudSpeed);
  }
  if (cloudX <= -100){
    cloudX = -100;
    cloudSpeed = abs(cloudSpeed);
  }
}

function checkCloudCollision(bird){
  if(
    bird.x > 300 + cloudX &&
    bird.x < 750 + cloudX &&
    bird.y > 370 &&
    bird.y < 580
  ){
    gameOver = true;
    bird.moving = false;

    score = 0;
    saveBirds = [];
  }
}

function drawGameOver(){
  push();

  fill(255, 239, 218);
  rect(250, 300, 500, 350, 30);

  fill(170, 90, 40);
  textAlign(CENTER, CENTER);
  textSize(42);
  textStyle(BOLD);
  text("Oh No!", 500, 380);

  textSize(25);
  textStyle(NORMAL);
  text("Your bird hit the cloud!", 500, 450);

  fill(245, 128, 33);
  rect(375, 520, 250, 70, 20);

  fill(255);
  textSize(30);
  textStyle(BOLD);
  text("Try Again", 500, 555);

  pop();
}

function drawInstructions(){
  push();


  fill(255, 239, 218);
  rect(200, 220, 600, 550, 30);

  fill(170, 90, 40);
  textAlign(CENTER, CENTER);
  textStyle(BOLD);
  textSize(48);
  text("Draw the Wind", 500, 295);

  textStyle(NORMAL);
  textSize(22);
  text("Help the little birds find their way home!", 500, 355);

  textSize(23);
  text("1. Click on the left to create a bird.", 500, 430);
  text("2. Draw a wind path to guide it home.", 500, 480);
  text("3. Avoid the moving clouds!", 500, 530);
  text("4. Rescue 5 birds to win!", 500, 580);

  fill(245, 128, 33);
  rect(375, 640, 250, 70, 20);

  fill(255);
  textSize(30);
  textStyle(BOLD);
  text("Start Game", 500, 675);

  pop();
}
