import { io } from 'socket.io-client';

// Connect to the Socket.IO server (adjust port if necessary)
const socket = io('http://localhost:3000');

const canvas = document.getElementById('whiteboard');
const context = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const clearButton = document.getElementById('clearButton');

// Set canvas dimensions to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let lastX = 0;
let lastY = 0;

// Function to draw a line on the canvas
function drawLine(data) {
  context.strokeStyle = data.color;
  context.lineWidth = data.brushSize || 2;
  context.beginPath();
  context.moveTo(data.prevX, data.prevY);
  context.lineTo(data.x, data.y);
  context.stroke();
}

// Handle initial board state from the server
socket.on('init', (boardState) => {
  boardState.forEach(data => {
    drawLine(data);
  });
});

// Listen for drawing events from the server
socket.on('drawing', (data) => {
  drawLine(data);
});

// Listen for clear board event from the server
socket.on('clear', () => {
  clearCanvas();
});

// Mouse event handlers
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  lastX = e.clientX;
  lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

canvas.addEventListener('mouseout', () => {
  drawing = false;
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;

  const newX = e.clientX;
  const newY = e.clientY;

  // Prepare drawing data
  const data = {
    prevX: lastX,
    prevY: lastY,
    x: newX,
    y: newY,
    color: colorPicker.value,
    brushSize: 2 // You can make this variable if desired
  };

  // Update the last positions for the next segment
  lastX = newX;
  lastY = newY;

  // Emit the drawing event to the server
  socket.emit('drawing', data);
});

// Handle the clear board button
clearButton.addEventListener('click', () => {
  socket.emit('clear');
});

// Clear the canvas
function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}
