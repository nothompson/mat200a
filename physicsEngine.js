let grabPoint = null;
//-------------point struct---------
class pointMass{
  constructor(x,y){
    this.position = createVector(x,y);
    this.velocity = createVector(0,0);
    this.previous= this.position.copy();
    
    //unitless coefficient for bouncing
    this.elasticity = 0.5;
    
    //tangentinal compnent of the velocity, loses speed along collider
    this.friction = 2;
    
    //for collision, x2 for visual diameter
    this.radius = 3;
    
    this.grab = false;
    this.hover = false;
  }
}
//-----constraint struct----
class distanceConstraint{
  constructor(point0, point1, distance){
    this.p0 = point0;
    this.p1 = point1;
    this.distance = distance
  }
}

function cross2D(a,b){
  return a.x * b.y - a.y * b.x;
}
function rotate2D(vec, angle){
  let cosA = cos(angle);
  let sinA = sin(angle);
  return createVector(vec.x * cosA - vec.y * sinA, vec.x * sinA + vec.y * cosA);
}
function getCentroid(points){
  let center = createVector(0,0);
  for(let p of points){
    center.add(p.position);
  }
  center.div(points.length);
  return center;
}

//vertex struct
class myVertex{
  constructor(index, position){
    this.index = index;
    this.position = createVector(position.x, position.y);
  }
}

//softbody struct
class softBody{
  constructor(index){
    this.index = index;
    this.vertices = [];
    this.center =  createVector(0,0);
    this.labels = [];
  }
  addVertices(num){
    for(let i = 0; i < num; i ++)
      this.vertices.push(new myVertex(this.index, createVector(0,0)));
  }
}

//-------------physics engine---------
class engine{
  constructor(){
    this.points = [];
    this.constraints = [];
    this.softBodies = [];
    this.gravity = createVector(0,10);
    this.springForce = 500;
    this.springDamping = 50;
    this.maxSpeed = 3000;
    // this.currentSpeed = 1.5;
  }
  settings(gravity, springForce, springDamping,maxSpeed){
    this.gravity.y = gravity;
    this.springForce = springForce;
    this.springDamping = springDamping;
    this.maxSpeed = maxSpeed;
  }
  clearWorld(){
    this.points.length = 0;
    this.constraints.length = 0;
    this.softBodies.length = 0;
  }
  update(dt){
    
      //euler method 
    for(let p of this.points){
        if (!p.previous) {
    p.previous = p.position.copy(); // only once on first update
  }

  p.previous.set(p.position); // store last frame's position
  p.velocity.add(p5.Vector.mult(this.gravity, dt));
  p.position.add(p5.Vector.mult(p.velocity, dt));

      if (p.grab){
        let mSpeedX = (mouseX - pmouseX);
        let mSpeedY = (mouseY - pmouseY);
        //speed in pixels per frame
        let mouseSpeed = createVector(mSpeedX, mSpeedY);
        //divide by delta time to scale to pixels per second
        p.velocity = (mouseSpeed.copy().div(dt));
        p.position.set(mouseX,mouseY);
      }
    
    
      let collisions = [];
      //will need to add boundary radius soon   
      let c = findCollision(p.position, p.previous, boundary, p.radius, platform)
      //no collision, skip
      if(c.depth < 0) continue;
      //resolve constraint, push mass until no collision is present
      p.position.add(p5.Vector.mult(c.colnormal, c.depth));
      
      //compute normal and tangential velocity
      let vn = p5.Vector.mult(c.colnormal, p.velocity.dot(c.colnormal));
      let vt = p5.Vector.sub(p.velocity, vn);
      
      //bouncing
      vn.mult(-p.elasticity);
      
      //friction 
      vt.mult(exp(-p.friction* dt));
      //apply to velocity
      p.velocity = p5.Vector.add(vn,vt);

  }

  if(gloobis.length > 0){
    for(let g of gloobis){
        if (!g.previous) {
    g.previous = g.pos.copy(); // only once on first update
  }

  g.previous.set(g.pos); // store last frame's position
  g.pos.add(p5.Vector.mult(g.vel, dt));
  // p.velocity.add(p5.Vector.mult(this.gravity, dt));
  // p.position.add(p5.Vector.mult(p.velocity, dt));

  //     if (p.grab){
  //       let mSpeedX = (mouseX - pmouseX);
  //       let mSpeedY = (mouseY - pmouseY);
  //       //speed in pixels per frame
  //       let mouseSpeed = createVector(mSpeedX, mSpeedY);
  //       //divide by delta time to scale to pixels per second
  //       p.velocity = (mouseSpeed.copy().div(dt));
  //       p.position.set(mouseX,mouseY);
  //     }
    
    
      let collisions = [];
      //will need to add boundary radius soon   
      let c = findCollision(g.pos, g.previous, boundary, g.radius, platform)
      //no collision, skip
      if(c.depth < 0) continue;
      //resolve constraint, push mass until no collision is present
      g.pos.add(p5.Vector.mult(c.colnormal, c.depth));
      
      //compute normal and tangential velocity
      let vn = p5.Vector.mult(c.colnormal, g.vel.dot(c.colnormal));
      let vt = p5.Vector.sub(g.vel, vn);
      
         //bouncing
      vn.mult(-g.elasticity);
    
      //apply to velocity
      g.vel = p5.Vector.add(vn,vt);
    }
  }
    
    
    

  for(let c of this.constraints){
      let p0 = world.points[c.p0].position;
      let p1 = world.points[c.p1].position;
      let v0 = world.points[c.p0].velocity;
      let v1 = world.points[c.p1].velocity;
      
      let delta = p5.Vector.sub(p1,p0);
      let distance = delta.mag();
      let direction = delta.copy().div(distance);
      
      let requiredDelta = distance - c.distance;
      let force = direction.copy().mult(-this.springForce * requiredDelta);
      
      v0.sub(p5.Vector.mult(force,dt));
      v1.add(p5.Vector.mult(force,dt));
    
      let vrel = p5.Vector.sub(v1,v0);
      
      let vtrel = direction.copy().mult(vrel.dot(direction));
  
      let damping = vtrel.copy().mult(-this.springDamping);
      
      v0.sub(p5.Vector.mult(damping, dt / 2));
       v1.add(p5.Vector.mult(damping, dt / 2));
    }
    
    //TO DO work on applying force via keyboard for movement
  // if(keyIsPressed){
  //       if(key == "d"){
  //       this.points[0].velocity.add(createVector(1,0));
  //       this.points[0].velocity.mult(this.currentSpeed);
  //     }
  //           if(key == "a"){
  //       this.points[0].velocity.add(createVector(-1,0));
  //       this.points[0].velocity.mult(this.currentSpeed);
  //     }
  //           if(key == "w"){
  //         for(let p of this.points){
  //          p.velocity.add(createVector(0,1));
  //          p.velocity.mult(this.currentSpeed * 2);
  //           }
  //     }
  //           if(key == "s"){
  //         for(let p of this.points){
  //          p.velocity.add(createVector(0,-1));
  //          p.velocity.mult(this.currentSpeed * 2);
  //           }
  //     }
  //   }
    
for (let b of this.softBodies) {
  //reset center at start of loop so it doesnt stray away
  b.center.set(0, 0);

  //add up all vertex positions
  for (let v of b.vertices) {
    b.center.add(this.points[v.index].position);
  }

  //divide by vertex count for average center position
  b.center.div(b.vertices.length);

  //rotation alingment 
  //this is where the "shape matching" comes in, prevents breaking of shape or restructuring
  let A = 0;
  let B = 0;
  for (let v of b.vertices) {
    let r = p5.Vector.sub(this.points[v.index].position, b.center);
    A += r.dot(v.position);
    B += cross2D(r, v.position);
  }
  let angle = -atan2(B, A);
  for (let v of b.vertices) {
    let rotated = rotate2D(v.position, angle);
    let target = p5.Vector.add(b.center, rotated);
    let delta = p5.Vector.sub(target, this.points[v.index].position);
    this.points[v.index].velocity.add(delta.mult(this.springForce * dt));
  }
}
    //clamp speed to world maximum
    for(let p of this.points){
        if (p.velocity.mag() > this.maxSpeed) {
          p.velocity.setMag(this.maxSpeed); 
        }
    }
  }

  //not used as much anymore, structures have more particular starting points
  spawn(num){
    for(let i = 0; i < num; i++){
      this.points.push(new pointMass(random(width), random(height)));
    }
  }
  
  //hover and grab functionallity
  grab(x,y){
    let mouse = createVector(x,y);
    for(let p of this.points){
      if (dist(mouse.x, mouse.y, p.position.x,p.position.y) < p.radius){
        p.hover = true;
      }else{
        p.hover = false;
      }
    }
    if(mouseIsPressed&&!grabPoint){
       for(let p of this.points){
         if(dist(mouse.x, mouse.y, p.position.x,p.position.y) < p.radius){
            grabPoint = p;
           p.grab = true;
           break;
        }
       }
    }
  if(!mouseIsPressed && grabPoint){
    grabPoint.grab = false;
    grabPoint = null;
  }
  
  }

}
//-----------collisions class------------
//if environemnt is just a floor at y =0, collision normal points upwards, and penetration depth is -y
//negative penetration depth means there is no collision
class collision{
  constructor(colnormal = createVector(0,0), depth = -Infinity){
    this.colnormal = colnormal.copy();
    this.depth = depth;
  }
}
//-------world collision function------
//TO DO, allow multiple soft bodies to collide with each other
function findCollision(position, previous, boundary, radius, platform) {
  let collisions = [];

  worldCollision(position, boundary, radius, collisions);
  sweepCollision(position, previous, platform, radius, collisions);

  if (collisions.length === 0) {
    return new collision(); // default: no collision
  }

  // Find the most significant collision (largest depth)
  let significant = collisions[0];
  for (let i = 1; i < collisions.length; i++) {
    if (collisions[i].depth > significant.depth) {
      significant = collisions[i];
    }
  }

  return significant;
}

function worldCollision(position, boundary, radius, collisions) {
  if (position.y + radius > boundary.maxY) {
    collisions.push(new collision(createVector(0, -1), position.y + radius - boundary.maxY));
  } else if (position.x + radius > boundary.maxX) {
    collisions.push(new collision(createVector(-1, 0), position.x + radius - boundary.maxX));
  } else if (position.y - radius < boundary.minY) {
    collisions.push(new collision(createVector(0, 1), boundary.minY - (position.y - radius)));
  } else if (position.x - radius < boundary.minX) {
    collisions.push(new collision(createVector(1, 0), boundary.minX - (position.x - radius)));
  }
}

function sweepCollision(position, previous, platform, radius, collisions) {
  let a = previous;
  let b = position;

  // Top collision
  for(let p of platforms){
  if (a.y < p.y && b.y + radius >= p.y &&
      a.x + radius > p.x && a.x - radius < p.x + p.w) {
    collisions.push(new collision(createVector(0, -1), b.y+ radius - p.y));
  }

  // Bottom collision
  if (a.y > p.y + p.h && b.y - radius <= p.y + p.h &&
      a.x + radius > p.x && a.x - radius < p.x + p.w) {
    collisions.push(new collision(createVector(0, 1), p.y + p.h - (b.y - radius)));
  }

  // Left collision
  if (a.x < p.x && b.x + radius >= p.x &&
      a.y + radius > p.y && a.y - radius < p.y+p.h) {
    collisions.push(new collision(createVector(-1, 0), b.x + radius - p.x));
  }

  // Right collision
  if (a.x > p.x+p.w && b.x - radius <= p.x+p.w &&
      a.y + radius > p.y && a.y - radius < p.y+p.h) {
    collisions.push(new collision(createVector(1, 0), p.x+p.w - (b.x - radius)));
  }
}
}

//copy positions to either current or previous state
function getPositions(target){
  //reset
  target.length = 0;
  for (let p of world.points){
    //get positions
    target.push(p.position.copy());
  }
}
