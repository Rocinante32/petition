//// canvas script to be in here
const canvas = document.getElementById("signature");
var ctx = canvas.getContext("2d");
console.log(canvas);
var draw = false;
var startX = 0;
var startY = 0;

canvas.addEventListener("mousedown", (evt) => {
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
    if (draw == true) {
        const x = evt.x;
        const y = evt.y;

        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.lineTo(x, y);
        ctx.stroke();
    }
    if (evt.buttons != 1) {
        draw = false;
    }
});
