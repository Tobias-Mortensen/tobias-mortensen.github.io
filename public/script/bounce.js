document.addEventListener('DOMContentLoaded', function() {
    const img = document.getElementById('bouncing-image');
    let posX = 0;
    let velX = 2;
    const container = document.getElementById('bouncing-image-container');

    function updatePosition() {
        const containerWidth = container.clientWidth;
        const imgWidth = img.clientWidth;

        posX += velX;

        if (posX + imgWidth >= containerWidth || posX <= 0) {
            velX = -velX;
        }

        img.style.left = posX + 'px';
        img.style.bottom = '0px';

        requestAnimationFrame(updatePosition);
    }

    img.style.left = posX + 'px';
    img.style.bottom = '0px';
    updatePosition();
});
