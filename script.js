
// Variable Declarations 
const mainElements = document.querySelectorAll('main');
const desktopLinks = document.querySelectorAll('#desktop-nav a');
const mobileLinks = document.querySelectorAll('#mobile-nav a');
const hamburgerIcon = document.getElementById('hamburger-menu');
const mobileNav = document.getElementById('mobile-nav');
// Variables for Project Carousel (assuming you'll add those sections later)
const videoCarousel = document.getElementById('video-carousel'); 
const scrollLeftBtn = document.getElementById('scroll-left-btn'); 
const scrollRightBtn = document.getElementById('scroll-right-btn');
const nav = document.getElementById('desktop-nav');
let lastScrollTop = 0;

/**
    * Handles the form submission process.
    * It allows the form to submit to Formspree, and then clears the local fields with a small delay.
    * @param {Event} e The submission event.
    */
function submitAndClear(e) {
    // We do NOT use e.preventDefault() here because we want the native form submit (to Formspree) to happen.
    
    // Use a delay to clear the form AFTER the browser has initiated data transfer.
    setTimeout(function() {
        const form = document.getElementById('contactForm');
        if (form) {
            form.reset();
        }
    }, 100); // 100ms (0.1 second) delay is reliable for clearing the fields.
}

/**
    * Switches the active content section.
    * @param {string} sectionId The ID of the main section to show.
    */
function showPage(sectionId) {
    // Hide all main sections
    mainElements.forEach(main => {
        main.classList.add('hidden');
        main.classList.remove('flex'); 
    });

    // Show the requested section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.remove('hidden');
        activeSection.classList.add('flex');

        // Reset scroll
        activeSection.scrollTop = 0;

        // Allow scrolling
        document.body.style.overflowY = 'auto';
    }


    // Update navigation links for desktop
    desktopLinks.forEach(link => {
        link.classList.remove('active-underline', 'text-blue-500');
        link.classList.add('underline-on-hover', 'text-blue-300', 'hover:text-blue-500');
    });
    const activeLink = document.getElementById(sectionId.replace('-section', '-link'));
    if (activeLink) {
        activeLink.classList.remove('underline-on-hover', 'text-blue-300', 'hover:text-blue-500');
        activeLink.classList.add('active-underline', 'text-blue-500');
    }

        // Update navigation links for mobile
    mobileLinks.forEach(link => {
        link.classList.remove('text-blue-500', 'font-bold');
        link.classList.add('text-blue-300', 'font-medium');
    });
    const activeMobileLink = document.querySelector(`#mobile-nav a[onclick*="${sectionId}"]`);
    if (activeMobileLink) {
        activeMobileLink.classList.remove('text-blue-300', 'font-medium');
        activeMobileLink.classList.add('text-blue-500', 'font-bold');
    }
}

/**
 * Toggles the mobile navigation menu.
 */
function toggleMobileMenu() {
    hamburgerIcon.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflowY = mobileNav.classList.contains('open') ? 'hidden' : 'auto';
}

/**
 * Enables scroll-to-hide functionality for the desktop navigation bar.
 */
function setupNavHideOnScroll() {
    const mainContent = document.querySelector('main:not(.hidden)');
    if (mainContent && nav) {
        mainContent.onscroll = () => {
            let st = mainContent.scrollTop;

            if (st > lastScrollTop && st > 50) {
                nav.classList.add('nav-hidden');
            } else if (st < lastScrollTop) {
                nav.classList.remove('nav-hidden');
            }
            lastScrollTop = st <= 0 ? 0 : st;
        };
    }
}

/**
 * Sets up the functionality for the Project Video Carousel scroll buttons.
 */
function setupVideoCarousel() {
    const scrollAmount = 350; 

    if (scrollLeftBtn && videoCarousel) {
        scrollLeftBtn.addEventListener('click', () => {
            videoCarousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }

    if (scrollRightBtn && videoCarousel) {
        scrollRightBtn.addEventListener('click', () => {
            videoCarousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Start on the home page (you can change this to 'contact-section' for testing)
    showPage('home-section'); 
    
    // Set up event listeners for scroll-to-hide and carousel
    desktopLinks.forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(setupNavHideOnScroll, 100);
        });
    });
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            setTimeout(setupNavHideOnScroll, 100); 
        });
    });

    setupNavHideOnScroll();
    setupVideoCarousel();
});

/* =====================================================
   CERTIFICATE IMAGE MODAL (CLICK TO ZOOM)
   ===================================================== */

function openCertificate(src) {
    const modal = document.getElementById("certificateModal");
    const image = document.getElementById("certificateModalImage");

    if (!modal || !image) return;

    image.src = src;
    modal.classList.remove("hidden");
    modal.classList.add("flex");

    document.body.style.overflow = "hidden";
}

function closeCertificate() {
    const modal = document.getElementById("certificateModal");

    if (!modal) return;

    modal.classList.add("hidden");
    modal.classList.remove("flex");

    document.body.style.overflow = "auto";
}

/* Close modal when clicking outside the image */
document.addEventListener("click", function (e) {
    const modal = document.getElementById("certificateModal");
    const image = document.getElementById("certificateModalImage");

    if (
        modal &&
        !modal.classList.contains("hidden") &&
        e.target === modal &&
        !image.contains(e.target)
    ) {
        closeCertificate();
    }
});

/* ESC key support */
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
        closeCertificate();
    }
});