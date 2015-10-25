

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;


var getImageData = function(w,h)
{
	return ctx.getImageData(0,0,canvas.width, canvas.height)
};

(function() {
    var canvas = document.getElementById('canvas'),
            context = canvas.getContext('2d');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
      var w = canvas.width;
      var h = canvas.height;
  		var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);

      canvas.width = window.innerWidth / 2;
      canvas.height = window.innerHeight / 2;

      var offsetX = 0;
      if (w < canvas.width)
      {
        offsetX = (canvas.width - w) / 2;
      }
      
      var offsetY = 0;
      if (h < canvas.height)
      {
        offsetY = (canvas.height - h) / 2;
      }
  		ctx.putImageData(imageData, offsetX, offsetY);


    }
    resizeCanvas();


})();


/*
var img = new Image();
img.src = 'https://mdn.mozillademos.org/files/5397/rhino.jpg';
img.onload = function() {
  draw(this);
};

function draw(img) {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  img.style.display = 'none';
  var imageData = ctx.getImageData(0,0,canvas.width, canvas.height);
  var data = imageData.data;
    

  var invert = function() {
    for (var i = 0; i < data.length; i += 4) {
      data[i]     = 255 - data[i];     // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  var grayscale = function() {
    for (var i = 0; i < data.length; i += 4) {
      var avg = (data[i] + data[i +1] + data[i +2]) / 3;
      data[i]     = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  var grayscalebtn = document.getElementById('grayscalebtn');
  grayscalebtn.addEventListener('click', grayscale);
}
*/


var patternfill = function() {

	var img = new Image();
	img.src = 'macpaintpatterns/' + getRandomInt(1,37) + '.gif';
	img.onload = function() {
	    var canvas = document.getElementById('canvas');
		var ctx = canvas.getContext('2d');
		

		for (var i = 0; i < canvas.width; i += img.width) {
			for (var j = 0; j < canvas.height; j += img.height) {
				ctx.drawImage(img, i, j);
			};
		};
		
	};

}
patternfill(); //onload

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}	


var addRandomNoise = function()
{

	var imageData = getImageData(canvas.width, canvas.height);
	var data = imageData.data;


	var probOfInverting = 0.01;

	for (var i = 0; i < data.length; i += 4) {

		if (Math.random() < probOfInverting)
		{
			data[i]     = 255 - data[i];     // red
			data[i + 1] = 255 - data[i + 1]; // green
			data[i + 2] = 255 - data[i + 2]; // blue
		}
	}
	ctx.putImageData(imageData, 0, 0);
  
}



var threshold = function(pixels, val)
{
  var d = pixels.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var v = (r >= val) ? 255 : 0;
    d[i] = d[i+1] = d[i+2] = v
    d[i+3] = 255; 
  }
  return pixels;
}

var tmpCanvas = document.createElement('canvas');
var tmpCtx = tmpCanvas.getContext('2d');
var tmpImageData = null


var createImageData = function(w,h) {
	if (tmpImageData == null || tmpImageData.width != w || tmpImageData.height != h)
  	{
  		tmpImageData = tmpCtx.createImageData(w,h);
      console.log("creating tmpImageData");
  	}
  	return tmpImageData;
};

var src, output;
var convolve = function(pixels, weights, opaque) {


  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);
  var sw = pixels.width;
  var sh = pixels.height;
  // pad output by the convolution matrix
  var w = sw;
  var h = sh;
  output = createImageData(w, h);
  var dst = output.data;
  // go through the destination image pixels
  var alphaFac = opaque ? 1 : 0;
  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y*w+x)*4;
      // calculate the weighed sum of the source image pixels that
      // fall under the convolution matrix
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<side; cy++) {
        for (var cx=0; cx<side; cx++) {
          var scy = sy + cy - halfSide;
          var scx = sx + cx - halfSide;
          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            var srcOff = (scy*sw+scx)*4;
            var wt = weights[cy*side+cx];
            r += pixels.data[srcOff] * wt;
            g += pixels.data[srcOff+1] * wt;
            b += pixels.data[srcOff+2] * wt;
            a += pixels.data[srcOff+3] * wt;
          }
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
};



var anim = function()
{
  convolveWithMatrix(rand);



  window.requestAnimationFrame(anim);
}
var convolveWithMatrix = function(convolveMatrix)
{

  var imageData = getImageData(canvas.width, canvas.height);

  imageData = convolve(imageData,  

  convolveMatrix, 
  true);

  //imageData = threshold(imageData, 127);
  ctx.putImageData(imageData, 0, 0);
  
}

var genConvolveMatrix = function(range)
{
  var rand =[  (Math.random() - .5) * 2 * range,  (Math.random() - .5) * 2 * range,   (Math.random() - .5) * 2 * range,
     (Math.random() - .5) * 2 * range,   (Math.random() - .5) * 2 * range, (Math.random() - .5) * 2 * range,
      (Math.random() - .5) * 2 * range, (Math.random() - .5) * 2 * range,   (Math.random() - .5) * 2 * range ];

    var sum = rand[0] + rand[1] + rand[2] + rand[3] + rand[4] + rand[0] + rand[5] + rand[6] + rand[7] + rand[8];
    var adjustment = (1 - sum) / 9;
    for (var i = 0; i < rand.length; i++) {
       rand[i] = rand[i] + adjustment;
     };
     return rand;
}

var matrixScale = Math.random() * 5;

var setMatrixScale = function()
{
  document.title = "";
  for (var i = 0; i < Math.ceil(matrixScale * 2); i++) {
    var titleElements = ["▟","▞","▖","▗▘","▙","▚","▛","▜","▝"];

    document.title += titleElements[Math.floor(Math.random() * titleElements.length)];
  };
};
setMatrixScale();




var rand = genConvolveMatrix(matrixScale);
var genConvolve = function(range)
{
    var imageData = getImageData(canvas.width, canvas.height);
  var data = imageData.data;
  
  var color = [data[0],data[1],data[2],data[3]];
  var blank = true;
  for (var i = 0; i < data.length; i += 4) {
    if (color[0] != data[i] || color[1] != data[i+1] || color[2] != data[i+2])
    {
      blank = false;
      break;
    }
  }
  if (blank)
  {
    patternfill();
  }
  rand = genConvolveMatrix(matrixScale);
}

var genConvolveId = setInterval(genConvolve, 10000); 


window.requestAnimationFrame(anim);


canvas.addEventListener('click', genConvolve, false);

var interval = 10000; //10 secs
var lastTime = 0;
var sma3 = simple_moving_averager(3);

window.addEventListener("keypress", function(e) {
  var code = (e.keyCode ? e.keyCode : e.which);
  if (code === 0 || code === 32) {

    var time = Date.now();
    var delta = time - lastTime;

    if (delta > 60000 || lastTime == 0) { //over a minute has elapsed, or first sample
      sma3 = simple_moving_averager(3); //reset sma
    }
    else
    {
      interval = sma3(delta);
      clearInterval(genConvolveId);
      genConvolveId = setInterval(genConvolve, interval); 
      console.log(interval);
    }

 
    lastTime = time;


    genConvolve();
  }
});


function simple_moving_averager(period) {
    var nums = [];
    return function(num) {
        nums.push(num);
        if (nums.length > period)
            nums.splice(0,1);  // remove the first element of the array
        var sum = 0;
        for (var i in nums)
            sum += nums[i];
        var n = period;
        if (nums.length < period)
            n = nums.length;
        return(sum/n);
    }
}
 

window.addEventListener("keypress", function(e) {
  var code = (e.keyCode ? e.keyCode : e.which);
  if (code ===  13) {
    patternfill();

  }
});



window.addEventListener("keypress", function(e) {
  var code = (e.keyCode ? e.keyCode : e.which);
  if (code ===  219 || code === 91) { //[
    matrixScale = Math.max(0.01, matrixScale - 0.2);
    console.log(matrixScale);
    setMatrixScale(); 
  }
});


window.addEventListener("keypress", function(e) {
  var code = (e.keyCode ? e.keyCode : e.which);
  if (code === 221 || code === 93) { //[
    matrixScale = Math.min(5, matrixScale + 0.2); 
    console.log(matrixScale);
    setMatrixScale();
  }
}); 