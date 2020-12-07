//// canvas script to be in here
const canvas = document.getElementById("signBox");
const signBox = document.getElementById("signatureBox");
var ctx = canvas.getContext("2d");
console.log(canvas);
console.log(signBox);

const canvasPosLeft = canvas.offsetLeft;
const canvasPosTop = canvas.offsetTop;

ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.strokeStyle = "black";
ctx.lineWidth = 3;

var draw = false;
var startX = 0;
var startY = 0;

canvas.addEventListener("mousedown", (evt) => {
    evt.stopPropagation();
    startX = evt.x - canvasPosLeft;
    startY = evt.y - canvasPosTop;
    draw = true;
    console.log("clicked at: ", startX, startY);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    if (evt.buttons != 1) {
        draw = false;
    }
});

canvas.addEventListener("mousemove", (evt) => {
    evt.stopPropagation();
    if (draw == true) {
        const x = evt.x - canvasPosLeft;
        const y = evt.y - canvasPosTop;

        ctx.lineTo(x, y);
        ctx.stroke();
    }
    if (evt.buttons != 1) {
        draw = false;
    }
});

canvas.addEventListener("mouseup", () => {
    var dataURL = canvas.toDataURL();
    console.log(dataURL);
    signBox.value = dataURL;
});
