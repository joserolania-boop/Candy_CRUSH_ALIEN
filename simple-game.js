import Story from './src/story.js';

console.log('✓ Story imported successfully');
console.log('Story object:', !!Story);
console.log('Story.showScene:', !!Story.showScene);

document.body.innerHTML = '<h1>Game Loaded</h1><p>Modules imported successfully</p>';

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
});

window.addEventListener('load', () => {
  console.log('window.load fired');
  document.body.innerHTML += '<p>✓ All events fired</p>';
});
