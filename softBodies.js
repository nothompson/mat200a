class blob {
  constructor(width, height, radius, num) {
    //drawing
    this.points = [];
    this.indices = [];
    this.constraints = [];
    this.num = num;
    this.radius = radius;

    //jumping conditions
    this.grounded = false;

    //combat conditions
    this.HP = 100;
    this.maxHP = 100;
    this.attacked = false;
    this.attackBoost = 0;
    this.attackTimer = 30 + this.attackBoost;
    this.jumpBoost = 0;
    this.hurt = false;
    this.graceBoost = 0;
    this.hurtTimer = 90 + this.graceBoost;

    this.speedBoost = 0;

    this.gracePeriod = false;
    this.gracePeriodTimer = 120 + this.graceBoost;

    this.canExit = false;
    this.entered = false; 
    this.exited = false;

    for (let i = 0; i < num; i++) {
      let angle = (TWO_PI * i) / num;
      let x = myWidth + myX + radius * cos(angle);
      let y = myHeight + myY - radius * sin(angle);
      let p = new pointMass(x, y);
      world.points.push(p);
      this.points.push(p);
      this.indices.push(world.points.length - 1);
    }

    let centroid = getCentroid(this.points);
    let centroidPoint = new pointMass(centroid.x, centroid.y);
    this.points.push(centroidPoint);
    world.points.push(centroidPoint);
    this.indices.push(world.points.length - 1);

    const addConstraints = (a, b, dist) => {
      let c = new distanceConstraint(a, b, dist);
      world.constraints.push(c);
      this.constraints.push(c);
    };

    for (let i = 0; i < num; i++) {
      let currentIndex = this.indices[i];
      let nextIndex = this.indices[(i + 1) % num];
      let current = world.points[currentIndex];
      let next = world.points[nextIndex];
      let distance = p5.Vector.dist(current.position, next.position);

      addConstraints(currentIndex, nextIndex, distance);

      addConstraints(currentIndex, this.indices[num], radius);
    }

    let soft = new softBody(0);

    for (let i = 0; i < this.points.length; i++) {
      let offset = p5.Vector.sub(this.points[i].position, centroid);
      soft.vertices.push(new myVertex(this.indices[i], offset));
    }
    world.softBodies.push(soft);
    
    // this.points[this.num].radius = 30;
  }
  display(positions, editMode) {
    //ensure it doesnt crash when theres nothing on screen yet
    if (!positions || positions.length < this.points.length) return;
      if(editMode == true){
        this.debugMode(positions);
      }
      else if (this.attacked == true) {
       this.attackMode(positions);
      } else if (this.hurt == true) {
        this.hurtMode(positions);
      }
      else{
        this.passiveMode(positions);
      }
    if(this.gracePeriod){
      this.graceShield();
    }
  }

update(blob){
  jumping(this.points, blob);
  this.graceState();
}

graceState(){
  if (this.gracePeriod){
    this.gracePeriodTimer--;
    if (this.gracePeriodTimer <= 0) {
      this.gracePeriod = false;
      this.entered = false; 
      this.exited = false;
      this.gracePeriodTimer = 120 + this.graceBoost; // reset grace period timer
      console.log("Grace period ended");
    }
  }
}
expand(factor){
  for(let c of this.constraints){
    c.distance *= factor;
  }
}

attackMode(positions){
  fill(100,130,20);
  stroke(0);
  strokeWeight(3);
  this.genDisplay(positions);
        this.points[this.num].radius = 10;
      
         let centroid = getCentroid(this.points);
    
    let anchor1 = positions[0];
    let anchor2 = positions[1];
    
    let direction = p5.Vector.sub(anchor2,anchor1).normalize();
    
    let perpendicularBasis = createVector(-direction.y, direction.x);
    
    let pos1 = p5.Vector.add(centroid, p5.Vector.add(p5.Vector.mult(perpendicularBasis, 1),p5.Vector.mult(direction, 15)));
    let pos2 = p5.Vector.add(centroid, p5.Vector.add(p5.Vector.mult(perpendicularBasis, 1),p5.Vector.mult(direction, -15)));
    let pos3 = p5.Vector.add(centroid, p5.Vector.add(p5.Vector.mult(perpendicularBasis, 7),p5.Vector.mult(direction, 0)));
    
// right eye
stroke(0);
strokeWeight(2);
fill(255);
push();
translate(pos1.x, pos1.y);
rotate(direction.heading()); // rotate to face direction
arc(0, 0, 10, 10, PI + HALF_PI + QUARTER_PI, PI, CHORD);
pop();

// left eye (mirrored)
push();
translate(pos2.x, pos2.y);
rotate(direction.heading());
scale(-1, 1); // mirror horizontally
arc(0, 0, 10, 10, PI + HALF_PI + QUARTER_PI, PI, CHORD); // same arc
pop();

    strokeWeight(2)
        fill(0);
    ellipse(pos3.x,pos3.y,10);
}

passiveMode(positions){
    fill(20, 180, 80);
    stroke(0);
        strokeWeight(2);
    this.genDisplay(positions);

    this.points[this.num].radius = 1;
      
    let centroid = getCentroid(this.points);
    
    let anchor1 = positions[0];
    let anchor2 = positions[1];
    
    let direction = p5.Vector.sub(anchor2,anchor1).normalize();
    
    let perpendicularBasis = createVector(-direction.y, direction.x);
    
    let pos1 = p5.Vector.add(centroid, p5.Vector.add(p5.Vector.mult(perpendicularBasis, 1),p5.Vector.mult(direction, 15)));
    let pos2 = p5.Vector.add(centroid, p5.Vector.add(p5.Vector.mult(perpendicularBasis, 1),p5.Vector.mult(direction, -15)));
    let pos3 = p5.Vector.add(centroid, p5.Vector.add(p5.Vector.mult(perpendicularBasis, 5),p5.Vector.mult(direction, 0)));
    
    stroke(0);
    strokeWeight(2);
    let eyeball = (this.points.some(p => p.grab) ? 15 : 10);
    strokeWeight(this.points.some(p => p.grab) ? 5 : 3);
        fill(255)
    ellipse(pos1.x,pos1.y,eyeball);
    ellipse(pos2.x,pos2.y,eyeball);
    strokeWeight(2)
    let mouth =  (this.points.some(p => p.grab) ? 10 : 5);
        fill(0);
    ellipse(pos3.x,pos3.y,mouth);
}

hurtMode(positions){
 fill(120, 180, 70, 130);
    stroke(20);
        strokeWeight(2);
    this.genDisplay(positions);

    this.points[this.num].radius = 1;
      
    let centroid = getCentroid(this.points);
    
    let anchor1 = positions[0];
    let anchor2 = positions[1];
    
    let direction = p5.Vector.sub(anchor2,anchor1).normalize();
    
    let perpendicularBasis = createVector(-direction.y, direction.x);
    
    let pos1 = p5.Vector.add(centroid, p5.Vector.add(p5.Vector.mult(perpendicularBasis, 1),p5.Vector.mult(direction, 15)));
    let pos2 = p5.Vector.add(centroid, p5.Vector.add(p5.Vector.mult(perpendicularBasis, 1),p5.Vector.mult(direction, -15)));
    let pos3 = p5.Vector.add(centroid, p5.Vector.add(p5.Vector.mult(perpendicularBasis, 5),p5.Vector.mult(direction, 0)));
    
// right eye
stroke(0);
strokeWeight(2);
fill(255);
push();
translate(pos1.x, pos1.y);
rotate(direction.heading()); // rotate to face direction
scale(-1,1);
arc(0, 0, 10, 10, PI + HALF_PI + QUARTER_PI, PI, CHORD);
pop();

// left eye (mirrored)
push();
translate(pos2.x, pos2.y);
rotate(direction.heading());
arc(0, 0, 10, 10, PI + HALF_PI + QUARTER_PI, PI, CHORD); // same arc
pop();

strokeWeight(2)
fill(0);
ellipse(pos3.x,pos3.y,10);

}

genDisplay(positions){
      for (let s of world.softBodies) {
          point(s.center.x, s.center.y);
        }
        beginShape();
        
        for (let i = 0; i < this.num; i++) {
          if (!positions[i]){
            console.log("Position not found for index: " + i);
             continue;
          }
          let p = positions[i];
          vertex(p.x, p.y);
        }
        endShape(CLOSE);
}

debugMode(positions){
  //        draw a line from each set of points that are constrained
            this.points[this.num].radius = 5;
        for (let c of this.constraints) {
          stroke(0);
          strokeWeight(2);
          line(
            positions[c.p0].x,
            positions[c.p0].y,
            positions[c.p1].x,
            positions[c.p1].y
          );
        }
        //this is for the "head" or zeroth point index
        strokeWeight(this.points[this.num].radius * 3);
        //if hovered then change to red
        stroke(
          this.points[this.num].hover ? color(255, 0, 0) : color(0, 255, 0)
        );
        point(
          positions[this.num].x,
          positions[this.num].y
        );
        //show which point is being hovered, helpful when adding points to structures
        if (this.points[this.num].hover == true) {
          for (let s of world.softBodies) {
            strokeWeight(2);
            stroke(0);
            fill(255, 255, 255);
            textSize(30);
            //some structures benefit from a labeling system, if its present use that. otherwise just show which index the point is (in this case always the 0th)
            text(
              s.labels[0] ?? "point: " + this.num,
              positions[this.num].x,
              positions[this.num].y - 30
            );
          }
        }
        //hover and text display for all the other points
        for (let p = 0; p < this.points.length - 1; p++) {
          strokeWeight(this.points[p].radius * 2);
          stroke(this.points[p].hover ? color(255, 0, 0) : 0);
          point(positions[p].x, positions[p].y);
          if (this.points[p].hover == true) {
            for (let s of world.softBodies) {
              strokeWeight(2);
              stroke(0);
              fill(255, 255, 255);
              textSize(30);
              text(
                s.labels[p] ?? "point: " + p,
                positions[p].x,
                positions[p].y - 30
              );
            }
          }
        }
}

graceShield(){
  fill(0,50,200, 100);
  stroke(0, 50, 200, 150);
  strokeWeight(2);
  circle(this.points[this.num].position.x, this.points[this.num].position.y, 50);
}

attackState() {
  if (this.attacked) {
    this.attackTimer--;
    if (this.attackTimer <= 0) {
      this.attacked = false;
      this.attackTimer = 0; // avoid negative values 
      this.expand(0.5); // shrink back to normal size
    }
  }
}

isHurt(gloobis){
if(!this.gracePeriod){
  for(let g of gloobis){
    if(g.pos.dist(this.points[this.num].position) < 15 && !this.hurt){
      this.hurt = true;
      this.HP -= 25;
      console.log(`Blob hurt! Current HP: ${this.HP}`);
    }
  }
    if (this.hurt) {
    this.hurtTimer--;
    if (this.hurtTimer <= 0) {
      this.hurt = false;
      this.hurtTimer = 90 + this.graceBoost; // reset hurt timer
    }
  }
}
}

healthDisplay(img){
  // textSize(20);
  // fill(255);
  // stroke(0);
  // strokeWeight(2);
  // text(`Health: ${this.HP}`, myX + 70, 30);
  let numHearts = (this.HP / 25);
  let offset = 0;
  for(let i = 1; i <= numHearts; i++){
    offset += 50;
    image(img, myX + 50 + offset, 10, 30, 30)
  }
}

exit(door){
  let buffer = 30;
  if (this.points[this.num].position.x > door.x - buffer &&
      this.points[this.num].position.x < door.x + door.w + buffer &&
      this.points[this.num].position.y > door.y - buffer &&
      this.points[this.num].position.y < door.y + door.h + buffer) {
        this.canExit = true;
        textSize(20);
        fill(255);
        stroke(0);
        strokeWeight(2);
        text("Exit?", door.x + door.w/2, door.y - 25);

console.log("Checking exit proximity...");
console.log("Blob pos:", this.points[this.num].position.x, this.points[this.num].position.y);
console.log("Door pos:", door.x, door.y, door.w, door.h);
console.log("Can exit:", this.canExit);
  }
  else{
    this.canExit = false;
  }
}

enter(x,y){
  if(this.exited){
    this.exited = false;
    this.setPosition(x,y);
    this.gracePeriod = true;
  }
}

setPosition(x, y) {
  // Set the position of the blob's centroid
  for (let p of this.points) {
    p.position.set(x, y);
    p.previous.set(x, y);
}
}

hasEntered(){
    if(this.entered){
    this.gracePeriod = true;
  }
}

healthPickup(pickups){
  for(let h of pickups){
    if(!h.pickedUp && h.position.dist(this.points[this.num].position) < h.radius){
       if(this.HP < this.maxHP){
      h.picked();      // Mark it as picked
      this.regen(25);    // Trigger health regen ONCE
      }
    }
  }
}

initiateBoon(pots){
  for(let p of pots){
    p.prompted = false;
    if(!p.accepted && p.position.dist(this.points[this.num].position) < p.radius + 25 && !this.canExit){
      // console.log("fudmama")
      p.prompt();
      p.prompted = true;
    }
  }
}

regen(x){
  this.HP += x;
}

degen(x){
  this.HP -= x;
}

death(){
  if(this.HP <= 0){
    return true
  }
  return false
}

//end of blob character class
}

function isGrounded(points){
      for(let p of points){
        if (p.position.y + p.radius >= myHeight + myY){
      return true
    }
  }
  for(let plat of platforms){
    for(let p of points){
     if (p.previous.y <= plat.y + plat.h   && p.position.y + p.radius >= plat.y&&
                             p.previous.x > plat.x && p.previous.x - p.radius < plat.x + plat.w ){ 
   return true
    }
      }
  }
  return false
}

function jumping(points, blob){
  let grounded = isGrounded;
  let lrMovement = createVector(0,0);
    let jump = createVector(0,0);

      if(keyIsPressed&& key == "d"){
      lrMovement.add(createVector(1,0))
        }
      if(keyIsPressed&& key == "a"){
        // p.velocity.mult(0.5);
      lrMovement.add(createVector(-1,0))
    }
          if(keyIsPressed&& key == "w" && grounded(points)== true){
      jump.add(0,-500 - blob.jumpBoost);
        for (let p of points){
          p.velocity.add(jump);
        }
        }
    for(let p of points){
      lrMovement.setMag(15 + blob.speedBoost);
      p.velocity.add(lrMovement);
    }
}