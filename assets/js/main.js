$(document).ready(function() {
    // 1. Initialize Animations (Fixes missing Process section)
    // If this crashes, elements with data-aos will remain invisible
    try {
        AOS.init({
            duration: 1000,
            once: true
        });
    } catch (error) {
        console.log("AOS Error:", error);
    }

    // 2. Menu Toggle (Fixes Pancake Button)
    $('.menu-toggle').click(function(e) {
        e.stopPropagation();
        $(this).toggleClass('active');
        $('.nav-links').toggleClass('active');
    });

    // 3. Close Menu when clicking outside
    $(document).on('click touchstart', function(e) {
        if (!$(e.target).closest('.navbar-container').length) {
            $('.nav-links').removeClass('active');
            $('.menu-toggle').removeClass('active');
            $('body').removeClass('nav-open');
        }
    });

    // 4. Smooth Scrolling (Fixes "Long time to scroll")
    $('.nav-links a').click(function(e) {
        e.preventDefault();
        
        // Close menu first
        $('.nav-links').removeClass('active');
        $('.menu-toggle').removeClass('active');
        
        // Scroll fast (300ms)
        let target = $(this).attr('href');
        if (target && target !== '#' && $(target).length) {
            $('html, body').animate({
                scrollTop: $(target).offset().top - 90
            }, 300);
        }
    });

    // 5. Get Started Button Logic
    const buttons = document.querySelectorAll(".getStartedBtn");
    buttons.forEach(button => {
        button.addEventListener("click", function(event) {
            const contactForm = document.getElementById("contact");
            if(contactForm) {
                contactForm.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // 6. Initialize Portfolio Slider (Fixes Gallery)
    // Use try-catch to prevent slider errors from breaking the whole site
    try {
        const portfolioSwiper = new Swiper('.portfolio-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            },
            autoplay: {
                delay: 3000,
                disableOnInteraction: false,
            }
        });

        // Portfolio Filter Functionality
        $('.filter-btn').click(function() {
            $('.filter-btn').removeClass('active');
            $(this).addClass('active');

            let filter = $(this).data('filter');
            portfolioSwiper.slides.each(function(slide) {
                if (filter === 'all' || $(slide).hasClass(filter)) {
                    $(slide).show();
                } else {
                    $(slide).hide();
                }
            });
            portfolioSwiper.update();
        });
    } catch (error) {
        console.log("Swiper Error:", error);
    }

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
                    field.style.borderColor = "";
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

        $('#contactForm input, #contactForm textarea').on('input', function() {
            if ($(this).prop('required')) {
                $(this).css('border-color', $(this).val() ? '#ddd' : '#ff0000');
            }
        });
    }
});
