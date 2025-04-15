// Sound effects
const clickSound = new Audio('/sounds/click.mp3');

// Global volume control
let globalVolume = 0.5; // Default to 50%

export const setGlobalVolume = (volume) => {
  globalVolume = volume / 100; // Convert from percentage to 0-1 range
  clickSound.volume = globalVolume;
};

export const playClickSound = () => {
  clickSound.currentTime = 0; // Reset sound to start
  clickSound.volume = globalVolume;
  clickSound.play().catch(error => {
    console.log('Error playing sound:', error);
  });
}; 