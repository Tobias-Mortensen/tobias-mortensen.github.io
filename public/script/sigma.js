document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('sigma-mode-toggle');
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const sigmaSound = document.getElementById('sigma-sound');

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            console.log('Button clicked');
            document.body.classList.toggle('normal-mode');
            document.body.classList.toggle('sigma-mode');
        });
    }

    if (loginButton) {
        loginButton.addEventListener('click', function() {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (username && password) {
                console.log('Login button clicked');
                document.body.classList.add('sigma-mode');
                document.body.classList.remove('normal-mode');
                if (sigmaSound) {
                    sigmaSound.play();
                }
            } else {
                alert('Please enter both username and password.');
            }
        });
    }
});