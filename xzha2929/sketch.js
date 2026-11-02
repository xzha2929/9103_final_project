let img;
let nestImg;
let birds = [];// array to hold birds objects.
let windPath = []; // array to hold the wind path.
let score = 0;
let totalBirds = 5;
let goalX = 850;
let goalY = 250;
let goalSize = 100;
let saveBirds = [];



function drawClouds(){
push();
noStroke();
fill(120, 120, 120, 230);//use ai for the RGB values for gray.
//draw clouds as an obstacle.
//cloud 1
ellipse(430, 350, 110, 65);
ellipse(485, 325, 150, 95);
ellipse(550, 355, 95, 55);
//cloud 2
ellipse(610, 510, 65, 40);
ellipse(650, 490, 95, 65);
ellipse(695, 515, 75, 45);
pop();
}

function preload(){
  img = loadImage("libraries/images.jpeg");
  nestImg = loadImage("libraries/nest.png");
}

function setup(){
  createCanvas(1000, 1000);
}

function draw(){
  background(255);
  image(img, 0, 100, 1000, 750);
  image(nestImg, 660, 150, 350, 280);
  drawClouds();
  drawSavedBirds();
  // update and display the birds
  for (let bird of birds){// loop through the birds array and update and display each bird
    bird.update();// update the position of the bird and move
    bird.display();// draw the bird on the canvas.
    //calculate distance between bird and nest
    let distance = dist(
      bird.x, bird.y,
      goalX, goalY,
    );

    //check if the bird reaches the nest
    if (distance < goalSize / 2){// check the distance.
      score++;

      saveBirds.push(bird);

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
  if (score === totalBirds){
    drawVictory();
  }
}
// create birds when mouse is pressed
function mousePressed(){
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
function mouseDragged(){
  windPath.push({
    x: mouseX,
    y: mouseY,
  })
}
//Make the bird fly only after the mouse is released
function mouseReleased(){
  if (windPath.length>0){
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
    fill(0);
    noStroke();
    circle(this.x, this.y, this.size);
  }
}

function restartGame(){
  birds = [];
  saveBirds = [];
  windPath = [];
  score = 0;
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
  //draw background
  noStroke();
  fill(0, 0, 0, 120);
  rect(0, 0, 1000, 1000);
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
  text("You save 5 birds!", 500, 450);

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

    fill(40);
    noStroke();

    circle(875 + i * 12, 285, 12);
  }
}