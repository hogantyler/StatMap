// Sound effects
const clickSound = new Audio('/sounds/click.mp3');
const hoverSound = new Audio('/sounds/hover.mp3');

// Global volume control
let globalVolume = 0.5; // Default to 50%

export const setGlobalVolume = (volume) => {
  globalVolume = volume / 100; // Convert from percentage to 0-1 range
  clickSound.volume = globalVolume;
  hoverSound.volume = globalVolume;
};

export const playClickSound = () => {
  clickSound.currentTime = 0; // Reset sound to start
  clickSound.volume = globalVolume;
  clickSound.play().catch(error => {
    console.log('Error playing sound:', error);
  });
};

export const playHoverSound = () => {
  hoverSound.currentTime = 0;
  hoverSound.volume = globalVolume;
  hoverSound.play().catch(error => {
    console.log('Error playing sound:', error);
  });
}; 