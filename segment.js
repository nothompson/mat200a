class segment{
  constructor(x, y, angle, distance, radius, r, g ,b){
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.distance = distance;
    this.radius = radius;
    this.r = r;
    this.g = g;
    this.b = b;
  }
  
  update(prev){
    //tells angle (radians) between two points
    let a = atan2(prev.y - this.y, prev.x - this.x);
    //set class angle to that 
    this.angle = a;
    //does it need to move forward ? calculate distance between current segment and previous
    let d = sqrt(pow(prev.x-this.x,2) + pow(prev.y-this.y,2));
    if(d > this.distance){
      //allows chaining of segments based on our set distance between them
      let delta = d - this.distance;
      //moves forward in that direction
      this.x+= delta*cos(this.angle);
      this.y+= delta*sin(this.angle);
    }
  }
  
 display(){
   //changing coordinate system per segment. 
   push();
   translate(this.x,this.y);
   rotate(this.angle);
   //needs diameter, so 2*radius
   stroke(0);
   strokeWeight(1);
   fill(this.r, this.g, this.b);
   circle(0,0,2*this.radius);
   //debugging direction 
   // line(0,0,this.distance,0);
   pop();
 }
}