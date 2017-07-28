CanvasRenderingContext2D.prototype.ellipse = function(cx, cy, rx, ry) {
  
  this.save();
  
  try {
    
    this.translate(cx-rx, cy-ry);
    this.scale(rx, ry);
    this.arc(1, 1, 1, 0, 2 * Math.PI, false);
    
  } finally {
    this.restore();
  }
  
};