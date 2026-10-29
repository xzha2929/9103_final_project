let img;
let birds = [];// arry to hold birds objects.
function preload(){
  img = loadImage("libraries/images.jpeg");
}

function setup(){
  createCanvas(1000, 1000);
}

function draw(){
  background(255);
  image(img, 0, 100, 1000, 750);
}

function mousePressed(){
  if (birds.length === 0){
    for (let i = 0; i<5; i++){
      birds.push(new Bird(mouseX, mouseY));
    }
  }
}