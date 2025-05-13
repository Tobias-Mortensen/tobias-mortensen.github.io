// script.js
document.addEventListener('DOMContentLoaded', () => {
    const cryptoOptionsGrid = document.getElementById('crypto-options-grid');
    const modal = document.getElementById('crypto-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModalButton = document.getElementById('close-modal-button');
    const modalCryptoName = document.getElementById('modal-crypto-name');
    const modalQrCode = document.getElementById('modal-qr-code');
    const modalCryptoAddress = document.getElementById('modal-crypto-address');
    const modalAssetSymbol = document.getElementById('modal-asset-symbol');
    const copyAddressButton = document.getElementById('copy-address-button');
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    const currentYearSpan = document.getElementById('currentYear');
    const modalConfirmButton = document.getElementById('modal-confirm-button');


    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Define cryptocurrency data
    // Ensure image paths in /coins/ and /qrcodes/ are correct or use placeholders
    // For QR codes, you might use a generator or static images.
    // I'm using coin images as placeholders for QR codes for simplicity here.
// Inside your script.js file:

const cryptocurrencies = [
    {
        name: 'Bitcoin',
        symbol: 'BTC',
        image: '/tobias-mortensen.github.io/coins/btc.png',
        qrCode: '/tobias-mortensen.github.io/coins/qr_btc.png', // Added prefix
        address: 'bc1qquuw8yu3ft57zgssef7kysm0wayyzgllndf5hv',
        description: 'The original cryptocurrency, known for its security and decentralization.'
    },
    {
        name: 'Dogecoin',
        symbol: 'DOGE',
        image: '/tobias-mortensen.github.io/coins/dodge.png',
        qrCode: '/tobias-mortensen.github.io/coins/qr_dodge.png', // Added prefix
        address: 'DFWVzGMfg6Kx1dWTc6WuPm6Fq38shjXkgm',
        description: 'A fun and friendly internet currency, started as a meme.'
    },
    {
        name: 'Litecoin',
        symbol: 'LTC',
        image: '/tobias-mortensen.github.io/coins/ltc.png',
        qrCode: '/tobias-mortensen.github.io/coins/qr_ltc.png', // Added prefix
        address: 'LNpJWUBmjZM54AsMNKWFY73pUmfEXPznNP',
        description: 'A peer-to-peer cryptocurrency, an early Bitcoin alternative.'
    },
    {
        name: 'Solana',
        symbol: 'SOL',
        image: '/tobias-mortensen.github.io/coins/sol.png',
        qrCode: '/tobias-mortensen.github.io/coins/qr_sol.png', // Added prefix
        address: 'FCYnoCNRAnXLLsEriFGL3kBn21T1ZgZPgNNYHLZSZiYE',
        description: 'A high-performance blockchain supporting scalable dApps.'
    },
    {
        name: 'Tether',
        symbol: 'USDT',
        image: '/tobias-mortensen.github.io/coins/tether.png',
        qrCode: '/tobias-mortensen.github.io/coins/qr_usdt.png', // Added prefix
        address: '0x61B04b538bd155ee993b1B361Ad388B8d1D2c9b1',
        description: 'A stablecoin pegged to the US Dollar, widely used for trading.'
    },
    {
        name: 'XRP',
        symbol: 'XRP',
        image: '/tobias-mortensen.github.io/coins/xrp.png',
        qrCode: '/tobias-mortensen.github.io/coins/qr_xrp.png', // Added prefix
        address: 'raMVN52QQsGspsYxULJL7rkkvfV1jrUi4W',
        description: 'A digital payment protocol often used by financial institutions.'
    },
    {
        name: 'Ethereum',
        symbol: 'ETH',
        image: '/tobias-mortensen.github.io/coins/eth.png',
        qrCode: '/tobias-mortensen.github.io/coins/qr_eth.png', // Added prefix
        address: '0x61B04b538bd155ee993b1B361Ad388B8d1D2c9b1', // Example address
        description: 'A platform for decentralized applications and smart contracts.'
    },
    {
        name: 'Cardano',
        symbol: 'ADA',
        image: '/tobias-mortensen.github.io/coins/ada.png',
        qrCode: '/tobias-mortensen.github.io/coins/qr_ada.png', // Added prefix
        address: 'addr1qy04j43wcsnh60n96q6tch32lh8xxt4t5qa5ncdrycekw5slt9tza3p805lxt5p5h30z4lwwvvh2hgpmf8s6xf3nvafqdn5f53', // Example address
        description: 'A proof-of-stake blockchain platform, focusing on sustainability.'
    }
];

// The rest of your script.js file remains the same...
    // Function to display toast notifications
    let toastTimeout;
    function showToast(message, type = 'success') {
        toastMessage.textContent = message;
        toastNotification.classList.remove('bg-green-500', 'bg-red-500', 'opacity-0', 'translate-y-10');
        toastNotification.classList.add(type === 'success' ? 'bg-green-500' : 'bg-red-500', 'opacity-100', 'translate-y-0');

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toastNotification.classList.remove('opacity-100', 'translate-y-0');
            toastNotification.classList.add('opacity-0', 'translate-y-10');
        }, 3000);
    }

    // Populate crypto options
    if (cryptoOptionsGrid) {
        cryptocurrencies.forEach(crypto => {
            const card = document.createElement('div');
            card.className = 'crypto-card animate-slide-up group'; // Added group for potential group-hover effects
            card.innerHTML = `
                <img src="${crypto.image}" alt="${crypto.name}" class="w-20 h-20 mb-4 group-hover:rotate-[360deg] transition-transform duration-700 ease-out">
                <h3 class="text-2xl font-semibold mb-2 text-brand-light">${crypto.name} <span class="text-xs text-brand-subtle">(${crypto.symbol})</span></h3>
                <p class="text-sm text-brand-subtle px-2">${crypto.description || 'Click to get deposit address.'}</p>
            `;
            card.addEventListener('click', () => openModal(crypto));
            cryptoOptionsGrid.appendChild(card);
        });
    }

    // Function to open the modal
    function openModal(crypto) {
        modalCryptoName.textContent = `${crypto.name} (${crypto.symbol})`;
        modalQrCode.src = crypto.qrCode; // Make sure these QR code images exist
        modalQrCode.alt = `${crypto.name} QR Code`;
        modalCryptoAddress.value = crypto.address;
        modalAssetSymbol.textContent = crypto.symbol;

        modal.classList.remove('hidden');
        // Trigger reflow for animation
        void modalContent.offsetWidth;
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'scale(1)';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    // Function to close the modal
    function closeModalHandler() {
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto'; // Restore scrolling
        }, 300); // Match transition duration
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', closeModalHandler);
    }

    // Close modal when clicking outside of it
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModalHandler();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModalHandler();
        }
    });

    // Copy address to clipboard
    if (copyAddressButton) {
        copyAddressButton.addEventListener('click', () => {
            modalCryptoAddress.select();
            modalCryptoAddress.setSelectionRange(0, 99999); // For mobile devices

            try {
                navigator.clipboard.writeText(modalCryptoAddress.value)
                    .then(() => {
                        showToast('Address copied to clipboard!', 'success');
                    })
                    .catch(err => {
                        console.error('Failed to copy address: ', err);
                        // Fallback for older browsers (less secure)
                        document.execCommand('copy');
                        showToast('Address copied (fallback method)!', 'success');
                    });
            } catch (err) {
                console.error('Clipboard API not available: ', err);
                // Fallback for very old browsers or specific contexts
                try {
                    document.execCommand('copy');
                    showToast('Address copied (legacy fallback)!', 'success');
                } catch (copyErr) {
                    showToast('Failed to copy address. Please copy manually.', 'error');
                    console.error('Legacy fallback copy failed: ', copyErr);
                }
            }
        });
    }
    
    if (modalConfirmButton) {
        modalConfirmButton.addEventListener('click', () => {
            showToast('Thank you! Your (simulated) deposit is being processed.', 'success');
            closeModalHandler();
            // Here you might add further logic, like updating a UI element for balance (simulated)
            // or redirecting the user after a delay.
            // For example:
            // setTimeout(() => {
            //    window.location.href = '/games'; // Or a specific game page
            // }, 3000);
        });
    }

    // Smooth scrolling for anchor links (if any are added in the future)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Example: Add subtle parallax effect to header on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (header) {
            let offset = window.pageYOffset;
            header.style.backgroundPositionY = offset * 0.5 + 'px'; // Only works if header has a background image
            // Or change opacity/background color slightly
            if (offset > 50) {
                header.classList.add('bg-opacity-90'); // Add a Tailwind class for reduced opacity
            } else {
                header.classList.remove('bg-opacity-90');
            }
        }
    });
    
    // Add active class to current navigation link based on URL (simple version)
    const navLinks = document.querySelectorAll('header nav a');
    const currentPage = window.location.pathname;

    navLinks.forEach(link => {
        // Remove existing current-page-nav from all, then add to the correct one
        link.classList.remove('current-page-nav');
        if (link.getAttribute('href') === currentPage || (currentPage === '/' && link.textContent.toLowerCase() === 'deposit')) {
            link.classList.add('current-page-nav');
        }
         // Special case for root path often mapping to a 'Home' or 'Deposit' like link
        if (currentPage === '/' && (link.pathname === '/' || link.pathname === '/index.html') && link.textContent.toLowerCase().includes('deposit')) {
            link.classList.add('current-page-nav');
        } else if (link.pathname === currentPage && currentPage !== '/') {
            link.classList.add('current-page-nav');
        }
    });


    // Add a little animation to the main title
    const mainTitle = document.querySelector('main h1');
    if (mainTitle) {
        mainTitle.classList.add('hero-glow'); // Use the CSS class for glow
    }

}); // End DOMContentLoaded