
var size = 150 + Math.ceil(300 * Math.random());
console.log("size " + size);


var Canvas = require('canvas')
  , Image = Canvas.Image
  , canvas = new Canvas(size, size)
  , ctx = canvas.getContext('2d');



ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

ctx.filter = 'nearest';
ctx.patternQuality = 'nearest';
ctx.antialias = 'none';


var getImageData = function(w,h)
{
	return ctx.getImageData(0,0,canvas.width, canvas.height)
};

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

var tmpCanvas = new Canvas(canvas.width, canvas.height);
var tmpCtx = tmpCanvas.getContext('2d');
var tmpImageData = null


var createImageData = function(w,h) {
	if (tmpImageData == null || tmpImageData.width != w || tmpImageData.height != h)
  	{
  		tmpImageData = tmpCtx.createImageData(w,h);
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


var onload = function()
{
  var GIFEncoder = require('gifencoder');
var fs = require('fs');

var encoder = new GIFEncoder(canvas.width, canvas.height);
// stream the results as they are available into myanimated.gif
encoder.createReadStream().pipe(fs.createWriteStream('temp.gif'));

encoder.start();
encoder.setRepeat(0);   // 0 for repeat, -1 for no-repeat
var delay = 10 + Math.random() * 500;
console.log("delay " + delay);
encoder.setDelay(delay);  // frame delay in ms
encoder.setQuality(10); // image quality. 10 is default.


if (Math.random() > 0.5)
{
  addRandomNoise();
}

  genConvolve();
  console.log(rand);
  var frames = 300 * Math.random();
  console.log("frames: " + frames);
  for (var i = 0; i < frames; i++) {
    convolveWithMatrix(rand);
    encoder.addFrame(ctx);
    console.log("frame " + i);
  };

encoder.finish();
uploadToTumblr(encoder.out.getData());


}



var getMatrixString = function()
{
  outp = " ";
  for (var i = 0; i < Math.ceil(matrixScale * 2); i++) {
    var titleElements = ["▟","▞","▖","▗▘","▙","▚","▛","▜","▝"];

    outp += titleElements[Math.floor(Math.random() * titleElements.length)];
  };
  outp += "\n[" + rand.join(", ") + "]";
  return outp; 
};

var uploadToTumblr = function(image)
{
  var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: process.env.TUMBLR_CONSUMER_KEY,
  consumer_secret: process.env.TUMBLR_CONSUMER_SECRET,
  token: process.env.TUMBLR_ACCESS_TOKEN,
  token_secret: process.env.TUMBLR_ACCESS_TOKEN_SECRET
});


var options = 
{
  caption: getMatrixString(),
  data : "temp.gif", 
  link : "http://v21.io/%E2%96%9B%E2%96%9A%E2%96%9E%E2%96%97/",
  tags : "gif, epilepsy warning"
}

client.photo("dkmfxr0axh7rumhs3ppv", options, function(err, resp)
  {
    if (err) throw err;
    console.log("success");
  });

// dkmfxr0axh7rumhs3ppv
}



var patternfill = function() {
var fs = require("fs")
  fs.readFile(__dirname + '/macpaintpatterns/' + getRandomInt(1,37) + '.gif', function(err, squid){
    if (err) throw err;
    img = new Image;
    img.src = squid;
    ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);
    for (var i = 0; i < canvas.width; i += img.width) {
        for (var j = 0; j < canvas.height; j += img.height) {
          ctx.drawImage(img, i, j);
        };
      };

      onload();
    });


    
    


}
patternfill(); //onload




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


