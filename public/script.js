//// canvas script to be in here
const canvas = document.getElementById("signature");
var ctx = canvas.getContext("2d");
console.log(canvas);
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.strokeStyle = "black";
ctx.lineWidth = 3;

var draw = false;
var startX = 0;
var startY = 0;

canvas.addEventListener("mousedown", (evt) => {
    evt.stopPropagation();
    startX = evt.x;
    startY = evt.y;
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
        const x = evt.x;
        const y = evt.y;

        ctx.lineTo(x, y);
        ctx.stroke();
    }
    if (evt.buttons != 1) {
        draw = false;
    }
});
