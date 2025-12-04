$(document).ready(function() {
    // 1. Initialize Animations
    try {
        AOS.init({ duration: 1000, once: true });
    } catch (error) { console.log("AOS Error:", error); }

    // 2. Menu Toggle (Robust Version)
    // We use 'off' first to prevent duplicate clicks, and listen to 'click' only.
    // 'click' works perfectly on mobile and avoids touch conflicts.
    $(document).off('click', '.menu-toggle').on('click', '.menu-toggle', function(e) {
        e.preventDefault();
        e.stopPropagation(); // critical: stops the "close outside" code from firing
        $(this).toggleClass('active');
        $('.nav-links').toggleClass('active');
    });

    // 3. Close Menu when clicking anywhere else
    $(document).on('click', function(e) {
        // If the click is NOT inside the navbar, close the menu
        if (!$(e.target).closest('.navbar-container').length) {
            $('.nav-links').removeClass('active');
            $('.menu-toggle').removeClass('active');
        }
    });

    // 4. Smooth Scrolling for Navigation Links
    $('.nav-links a').click(function(e) {
        // Don't prevent default immediately or links might break; 
        // just handle the scroll manually if it's an anchor link.
        let target = $(this).attr('href');
        if (target && target.startsWith('#') && $(target).length) {
            e.preventDefault();
            
            // Close menu
            $('.nav-links').removeClass('active');
            $('.menu-toggle').removeClass('active');
            
            // Scroll
            $('html, body').animate({
                scrollTop: $(target).offset().top - 90
            }, 300);
        }
    });

    // 5. "Get Started" Button Logic
    const buttons = document.querySelectorAll(".getStartedBtn");
    buttons.forEach(button => {
        button.addEventListener("click", function() {
            const contactForm = document.getElementById("contact");
            if(contactForm) {
                contactForm.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 6. Initialize Portfolio Slider
    try {
        const portfolioSwiper = new Swiper('.portfolio-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            breakpoints: {
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            },
            autoplay: { delay: 3000, disableOnInteraction: false }
        });

        // Stop carousel on navigation button click
        $('.swiper-button-next, .swiper-button-prev, .swiper-pagination-bullet').on('click', function() {
            portfolioSwiper.autoplay.stop();
        });

        // Create lightbox elements
        const lightbox = $('<div class="portfolio-lightbox"></div>');
        const lightboxContent = $('<div class="lightbox-content"></div>');
        const lightboxImg = $('<img class="lightbox-image" src="" alt="Portfolio image">');
        const lightboxClose = $('<button class="lightbox-close">&times;</button>');
        const lightboxPrev = $('<button class="lightbox-nav lightbox-prev">&#10094;</button>');
        const lightboxNext = $('<button class="lightbox-nav lightbox-next">&#10095;</button>');
        const lightboxThumbnails = $('<div class="lightbox-thumbnails"></div>');
        
        lightboxContent.append(lightboxImg);
        lightbox.append(lightboxContent, lightboxClose, lightboxPrev, lightboxNext, lightboxThumbnails);
        $('body').append(lightbox);

        let currentImageIndex = 0;
        let portfolioImages = [];
        let thumbnailsBuilt = false;

        // Build thumbnails once and cache them - with lazy loading
        function buildThumbnails() {
            if (thumbnailsBuilt) return;
            
            // Get all unique images
            const seen = new Set();
            $('.portfolio-swiper .swiper-slide:not(.swiper-slide-duplicate) img').each(function() {
                const src = $(this).attr('src');
                if (!seen.has(src)) {
                    seen.add(src);
                    portfolioImages.push(src);
                }
            });
            
            // Build all thumbnails at once with lazy loading
            const fragment = document.createDocumentFragment();
            portfolioImages.forEach((src, index) => {
                const thumb = document.createElement('img');
                thumb.className = 'lightbox-thumb';
                thumb.loading = 'lazy';
                thumb.decoding = 'async';
                thumb.alt = 'Thumbnail';
                thumb.dataset.index = index;
                thumb.dataset.src = src;
                // Use a tiny placeholder initially
                thumb.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 50"%3E%3Crect fill="%23333" width="70" height="50"/%3E%3C/svg%3E';
                fragment.appendChild(thumb);
            });
            lightboxThumbnails[0].appendChild(fragment);
            thumbnailsBuilt = true;
            
            // Load visible thumbnails immediately, rest lazily
            requestAnimationFrame(() => {
                loadVisibleThumbnails();
            });
        }
        
        // Load thumbnails that are in view (thumbnails can load progressively, no need to hide)
        function loadVisibleThumbnails() {
            const container = lightboxThumbnails[0];
            const thumbs = container.querySelectorAll('.lightbox-thumb[data-src]');
            const containerRect = container.getBoundingClientRect();
            
            thumbs.forEach(thumb => {
                const thumbRect = thumb.getBoundingClientRect();
                // Load if in view or close to view
                if (thumbRect.right > containerRect.left - 100 && thumbRect.left < containerRect.right + 100) {
                    thumb.src = thumb.dataset.src;
                    delete thumb.dataset.src;
                }
            });
        }
        
        // Load more thumbnails on scroll
        lightboxThumbnails.on('scroll', function() {
            requestAnimationFrame(loadVisibleThumbnails);
        });

        // Update active thumbnail efficiently
        function updateActiveThumbnail() {
            requestAnimationFrame(() => {
                const thumbs = lightboxThumbnails[0].querySelectorAll('.lightbox-thumb');
                thumbs.forEach((thumb, i) => {
                    thumb.classList.toggle('active', i === currentImageIndex);
                });
                // Scroll active into view
                if (thumbs[currentImageIndex]) {
                    thumbs[currentImageIndex].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    // Load nearby thumbnails after scroll
                    setTimeout(loadVisibleThumbnails, 350);
                }
            });
        }

        // Thumbnail click handler (delegated)
        lightboxThumbnails.on('click', '.lightbox-thumb', function(e) {
            e.stopPropagation();
            currentImageIndex = parseInt(this.dataset.index, 10);
            lightboxImg[0].src = portfolioImages[currentImageIndex];
            updateActiveThumbnail();
        });

        // Click on portfolio image to maximize
        $(document).on('click', '.portfolio-swiper .swiper-slide img', function(e) {
            e.stopPropagation();
            portfolioSwiper.autoplay.stop();
            
            // Build thumbnails on first open
            buildThumbnails();
            
            // Find current image index
            const clickedSrc = $(this).attr('src');
            currentImageIndex = portfolioImages.indexOf(clickedSrc);
            if (currentImageIndex === -1) currentImageIndex = 0;
            
            // Show lightbox
            lightboxImg[0].src = clickedSrc;
            updateActiveThumbnail();
            lightbox.addClass('active');
            $('body').css('overflow', 'hidden');
        });

        // Click on slide (not just image) also stops carousel
        $(document).on('click', '.portfolio-swiper .swiper-slide', function() {
            portfolioSwiper.autoplay.stop();
        });

        // Navigate to previous image in lightbox
        lightboxPrev.on('click', function(e) {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex - 1 + portfolioImages.length) % portfolioImages.length;
            lightboxImg[0].src = portfolioImages[currentImageIndex];
            updateActiveThumbnail();
        });

        // Navigate to next image in lightbox
        lightboxNext.on('click', function(e) {
            e.stopPropagation();
            currentImageIndex = (currentImageIndex + 1) % portfolioImages.length;
            lightboxImg[0].src = portfolioImages[currentImageIndex];
            updateActiveThumbnail();
        });

        // Close button only (no click outside to close)
        lightboxClose.on('click', function(e) {
            e.stopPropagation();
            lightbox.removeClass('active');
            $('body').css('overflow', '');
        });

        // Touch swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        const minSwipeDistance = 50;

        lightbox[0].addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox[0].addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeDistance = touchEndX - touchStartX;
            if (Math.abs(swipeDistance) < minSwipeDistance) return;
            
            if (swipeDistance > 0) {
                // Swiped right - go to previous
                lightboxPrev.click();
            } else {
                // Swiped left - go to next
                lightboxNext.click();
            }
        }

        // Keyboard navigation in lightbox
        $(document).on('keydown', function(e) {
            if (lightbox.hasClass('active')) {
                if (e.key === 'ArrowLeft') {
                    lightboxPrev.click();
                } else if (e.key === 'ArrowRight') {
                    lightboxNext.click();
                } else if (e.key === 'Escape') {
                    lightboxClose.click();
                }
            }
        });

    } catch (error) { console.log("Swiper Error:", error); }

    // 7. Contact Form Handling
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            event.preventDefault();
            // Honeypot check
            if (document.getElementById('critical') && document.getElementById('critical').value) return;

            const form = event.target;
            const formData = new FormData(form);
            const alertBox = document.getElementById("formAlert");

            // Validation
            let valid = true;
            const requiredFields = form.querySelectorAll("[required]");
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.style.borderColor = "red";
                } else {
                    field.style.borderColor = "#ddd";
                }
            });

            if (!valid) {
                if(alertBox) {
                    alertBox.style.display = "block";
                    alertBox.style.backgroundColor = "#f8d7da";
                    alertBox.style.color = "#721c24";
                    alertBox.textContent = "Please fill in all required fields.";
                    setTimeout(() => alertBox.style.display = "none", 5000);
                }
                return;
            }

            fetch("https://formspree.io/f/mbljokkw", {
                method: "POST",
                body: formData,
                headers: { 'Accept': 'application/json' }
            })
            .then(response => response.json())
            .then(data => {
                if (data.ok) {
                    if(alertBox) {
                        alertBox.style.display = "block";
                        alertBox.textContent = "Thank you! We will contact you shortly.";
                        alertBox.style.backgroundColor = "#d4edda";
                        alertBox.style.color = "#155724";
                    }
                    form.reset();
                    setTimeout(() => { if(alertBox) alertBox.style.display = "none"; }, 5000);
                } else {
                    if(alertBox) {
                        alertBox.style.display = "block";
                        alertBox.textContent = "There was an error. Please try again.";
                        alertBox.style.backgroundColor = "#f8d7da";
                        alertBox.style.color = "#721c24";
                    }
                }
            })
            .catch(error => {
                if(alertBox) {
                    alertBox.style.display = "block";
                    alertBox.textContent = "Network error. Please try again.";
                    alertBox.style.backgroundColor = "#f8d7da";
                    alertBox.style.color = "#721c24";
                }
            });
        });

        // Clear red border on input
        $('#contactForm input, #contactForm textarea').on('input', function() {
            if ($(this).prop('required')) {
                $(this).css('border-color', $(this).val() ? '#ddd' : '#ff0000');
            }
        });
    }
});
