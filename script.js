const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillStyle = "red";
ctx.fillRect(100, 100, 300, 300);
alert("JS executou e desenhou no canvas!");