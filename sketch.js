//mat200C week 7 final project update
//noah thompson spring 2025

//press 1 for square, 2 for wheel, 3 for humanoid 

//following this custom soft body physics blog post in c++
//https://lisyarus.github.io/blog/posts/soft-body-physics.html

//help from chatgpt for c++ to js conversion

//soft body engine benefits from point mass rather than solids
//points dont have rotation or angular velocity


//collisions
let boundary;
let editMode= false;
let gloobis = [];
let noiseGrid = [];
let platforms = [];
let healthPickups = [];
let pots = [];
//drawing softbodies
let world, num, spacing, character,b;
let blobBool;
let blobs = [];

//debug
let mode;
let mousePosition;

//engine settings
let gravity,springForce,springDamping,maxSpeed;
let gravLog, forceLog,dampLog,speedLog;
let spring;

//updated timestep for variable frame rate
let t;
let dt;
let accum;
let currentTime, previousTime;
let currentPositions = []
let previousPositions = [];

// let grapples = [];

//noise generation
let gap, offset;
let xScale;
let yScale;
let scaledW;
let scaledH;

//level management
let stage = 1;
let doors = [];
let leftDoorBool = false;
let rightDoorBool = false;
let entranceIndex;
let exitIndex;
let entered;
let bgKey;
let COLOR;

let flood;
let pot;
let flowers;
let manic;

let borderFloor;
let borderCeiling;
let borderLeft;
let borderRight;
let border;

let backgrounds = [];
let backgroundIndex;

let myWidth;
let myX;
let myHeight; 
let myY;

let d,dPress, a, aPress, w,wPress, sb, sbPress, r, rPress, lessGas, noGas, moreGas, pog, heart, entranceDoor, exitDoor;



function preload(){
  flood = loadImage("/images/floodBG.png");
  pot = loadImage("/images/potBG.png");
  flowers = loadImage("/images/flowersBG.png");
  manic = loadImage("/images/manicBG.png");


  border = loadImage("/images/border.png")
  borderFloor = loadImage("/images/borderFloor.png")
  borderCeiling = loadImage("/images/borderCeiling.png")
  borderLeft = loadImage("/images/borderLeft.png")
  borderRight = loadImage("/images/borderRight.png")

  d = loadImage("/images/d.png");
  dPress = loadImage("/images/dPress.png")

   a = loadImage("/images/a.png");
  aPress = loadImage("/images/aPress.png")

   w = loadImage("/images/w.png");
  wPress = loadImage("/images/wPress.png")

   sb = loadImage("/images/sb.png");
  sbPress = loadImage("/images/sbPress.png")

   r = loadImage("/images/r.png");
  rPress = loadImage("/images/rPress.png")

  lessGas = loadImage("/images/lessGas.png");
  noGas = loadImage("/images/noGas.png");
  moreGas = loadImage("/images/moreGas.png");

  pog = loadImage("/images/pog.png");
  heart = loadImage("/images/heart.png");
  entranceDoor = loadImage("/images/entranceDoor.png");
  exitDoor = loadImage("/images/exitDoor.png");



  
  


}

function displayBackgrounds(index){
  if (index <= 0.25){
    image(flood, myX, myY, myWidth,myHeight)
    // console.log(index)
  }
  else if (index >= 0.25 && index <= 0.5){
    image(pot, myX,myY,myWidth,myHeight)
    //  console.log(index)
  }
  else if (index >= 0.5 && index <= 0.75){
    image(manic, myX,myY,myWidth,myHeight)
    //  console.log(index)
  }
    else if (index >= 0.75 && index <= 1.0){
    image(flowers, myX,myY,myWidth,myHeight)
    //  console.log(index)
  }
}

function setup() {
  myWidth = windowWidth - 100;
  myX = 50;
  myHeight = windowHeight -  200;
  myY = 50;

  console.log("window: " + windowWidth, windowHeight);
  
  console.log("play: " + (myWidth + myX), myHeight + myY);

  textAlign(CENTER);

  mousePosition = createVector(0,0);
  createCanvas(windowWidth, windowHeight);
  boundary = {minX: myX, maxX: windowWidth - 50, minY: myY, maxY: windowHeight - 150};
  world = new engine();


  spacing = 20;
  num = 20;

  backgroundIndex = random(0,1);
  COLOR = new colorHandler(0,0,0,backgroundIndex);
  
  newLevel = new level(backgroundIndex);

  newLevel.generateLevel(COLOR);

  blobs.push(new blob(myWidth/2, myHeight/2, spacing, num));
  blobBool = true;
  newLevel.positionBlob(blobs[0]);

  previousTime = millis() / 1000.0;
  
  t = 0.0;
  dt = 1.0/60.0;
  accum = 0.0;
  
  gravity = 1000;
  springDamping = 50;
  maxSpeed = 3000;
  spring = 500;
}

function draw() {
  mousePosition.set(mouseX,mouseY);

  COLOR.update(backgroundIndex);

  currentTime = millis() / 1000.0;
  let frame = currentTime - previousTime;
  if(frame > 0.25){
    frame = 0.25;
  }

  previousTime = currentTime;
  
  if(keyIsDown(81) && spring > 100){
    spring -= 50;
  }
  
    
  if(keyIsDown(69) && spring <= 650){
    spring += 50;
  }

  
  accum += frame;
  
  while(accum >= dt){
    getPositions(previousPositions);
    world.update(dt);
    getPositions(currentPositions);
    accum -= dt;
  }
  
  let alph = accum / dt;
  let interp = [];

  for(let i = 0; i < previousPositions.length; i++){
    interp[i] = p5.Vector.lerp(previousPositions[i], currentPositions[i], alph);
  }
  
  
  world.settings(gravity, spring,springDamping, maxSpeed);
  world.grab(mouseX,mouseY);
  // background(220);
  // image(pot, 0,0, width,height);
  // displayBackgrounds(backgroundIndex);
  newLevel.displayBG();

  // circle(mousePosition.x,mousePosition.y, 20)
  
  for (let p of platforms){
    p.display();
  }

   for (let d of newLevel.doors){
    d.display(entranceDoor, exitDoor);
  }

image(border, 0,myHeight + myY, width,myY * 3);

image(border, 0, 0, width, myY);
image(border, 0, 0, myX, height);
image(border, width - myX, 0, myX, height);

// image(border, 0, 0, width, height);

  if(blobBool == true){
    for(let b of blobs){
      if(!b.death()){
        b.attackState();
        b.isHurt(gloobis);
        b.display(interp, editMode);
        b.update(b);
        b.healthDisplay(heart);
        b.enter(newLevel.doors[newLevel.entranceIndex].x, newLevel.doors[newLevel.entranceIndex].y);
        b.healthPickup(healthPickups);
      }
    }
  }

for(let g of gloobis){
    if(blobs.length >= 1 && g.killed == false){
      g.flock(gloobis, blobs[0].points[num].position, platforms);
    }
    
    g.update();
    g.display();
    g.isKilled(blobs[0]);
     if(g.killed == true){
      let index = gloobis.indexOf(g);
      if(index > -1){
        gloobis.splice(index, 1);
      }
  }
}

for(let h of healthPickups){
  h.display(heart);
  if(h.pickedUp == true){
       let index = healthPickups.indexOf(h);
      if(index > -1){
        healthPickups.splice(index, 1);
      }
  }
}



newLevel.displayUI(editMode, pots, blobs[0]);

if(blobs[0].death()){
  deathScreen();
}

for (let p of pots){
  p.display(pog);
    if(p.accepted == true){
      let index = pots.indexOf(p);
      if(index > -1){
        pots.splice(index, 1);
      }
  }
}

blobs[0].initiateBoon(pots);
blobs[0].exit(newLevel.doors[newLevel.exitIndex]);

image(borderFloor, 0 + 100,myHeight , width - 200,myY * 5);



if(keyIsDown(65)){
  image(aPress, width/2 - width/5, myHeight + myY * 2.5, 50, 50)
}
else{
  image(a, width/2 - width/5, myHeight + myY * 2.5, 50, 50)
}

if(keyIsDown(68)){
image(dPress, width/2 - width/11, myHeight + myY * 2.5, 50, 50)
}
else{
  image(d, width/2 - width/11, myHeight + myY * 2.5, 50, 50)
}

if(keyIsDown(87)){
  image(wPress, width/2 - width/7, myHeight + myY * 2.25, 50, 50)
}
else{
  image(w, width/2 - width/7, myHeight + myY * 2.25, 50, 50)
}

if(keyIsDown(82)){
image(rPress, width/2 - 30, myHeight + myY, 120,120);
}
else{
image(r, width/2 - 30, myHeight + myY, 120,120);
}

if(blobs[0].attacked){
  image(sbPress, width /2 + 120, myHeight + myY*1.2, 100,100)
}else{
  image(sb, width /2 + 120, myHeight + myY*1.2, 100, 100)
}

if(keyIsDown(81)){
  image(lessGas, width /2 - width/5.14, myHeight + myY - 10, width /8,80);
}
else if(keyIsDown(69)){
  image(moreGas, width /2 - width/5.14, myHeight + myY - 10, width /8,80);
}
else{
  image(noGas, width /2 - width/5.14, myHeight + myY - 10, width /8,80);
}

if(editMode == true){
  editBorder();
  stroke(0);
  strokeWeight(2);
  fill(255);
  text(`{${mousePosition.x}, ${mousePosition.y}}`, mousePosition.x, mousePosition.y);
  cursor('grab');
}

//end draw

}


function keyPressed() {

  if (blobs[0].death()) {
    location.reload();
  }

  if (key === " " && !blobs[0].attacked && !blobs[0].hurt) {
    blobs[0].attacked = true;
    blobs[0].attackTimer = 30 + blobs[0].attackBoost; // duration of attack
    blobs[0].expand(2.0);
  }

  if((key === 'r' || key == "R") && blobs[0].canExit == true){
      blobs[0].exited = true; // Set the exited flag to true
      COLOR.randomize();
      newLevel.generateLevel(COLOR);
      blobs[0].canExit = false;
      
      console.log("R pressed. canExit:", blobs[0].canExit);
  }

  if(pots.length > 0){
    if((key === 'r' || key == "R") && pots[0].prompted == true){
      pots[0].accepted = true;
      pots[0].applyBoon(blobs[0]);
    }
  }


if(editMode == false && key == "c" || key =="C"){
  editMode= true;
  
}
  else if(editMode == true && key == "c" || key =="C"){
  editMode= false;
      noCursor();
}
}

function mouseClicked() {

}