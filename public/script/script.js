document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded');

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeSound = document.getElementById('dark-mode-sound');

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            console.log('Button clicked');
            document.body.classList.toggle('dark-mode');
            document.body.classList.toggle('light-mode');

            const box = document.querySelector('.box');
            if (document.body.classList.contains('dark-mode')) {
                box.style.backgroundColor = '#654321'; // Change to darker brown in dark mode
            } else {
                box.style.backgroundColor = '#A52A2A'; // Change to original brown in light mode
            }

            // Play the sound
            if (darkModeSound) {
                darkModeSound.play();
            } else {
                console.error('Audio element with id "dark-mode-sound" not found');
            }
        });
    } else {
        console.error('Element with id "dark-mode-toggle" not found');
    }
});