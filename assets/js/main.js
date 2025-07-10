$(document).ready(function() {
    AOS.init({
        duration: 1000,
        once: true
    });

    const buttons = document.querySelectorAll(".getStartedBtn");
    buttons.forEach(button => {
        button.addEventListener("click", function(event) {
            const contactForm = document.getElementById("contact");
            contactForm.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Menu toggle click handler
    $('.menu-toggle').click(function(e) {
        e.stopPropagation();
        $(this).toggleClass('active');
        $('.nav-links').toggleClass('active');
    });

    // Close menu when clicking a link
    $('.nav-links a').click(function() {
        $('.nav-links').removeClass('active');
        $('.menu-toggle').removeClass('active');
    });

    // Close menu when clicking outside
    $(document).on('click touchstart', function(e) {
        if (!$(e.target).closest('.navbar-container').length) {
            $('.nav-links').removeClass('active');
            $('.menu-toggle').removeClass('active');
        }
    });

    // Close menu when clicking outside
    $(document).on('click touchstart', function(e) {
        if (!$(e.target).closest('.navbar-container').length) {
            $('.nav-links').removeClass('active');
            $('.menu-toggle').removeClass('active');
            $('body').removeClass('nav-open');
        }
    });

    // Close menu when clicking a link
    $('.nav-links a').click(function() {
        $('.nav-links').removeClass('active');
        $('.menu-toggle').removeClass('active');
        $('body').removeClass('nav-open');
    });

    $('.nav-links a').click(function(e) {
        e.preventDefault();
        let target = $(this).attr('href');
        
        $('.nav-links').removeClass('active');
        $('.menu-toggle').removeClass('active');
        $('.menu-toggle').children('span').css({
            'transform': 'none',
            'opacity': '1'
        });
        
        $('html, body').animate({
            scrollTop: $(target).offset().top - 90
        }, 1000);
    });

    $(document).on('touchstart', function(e) {
        if(!$(e.target).closest('.navbar-container').length) {
            $('.nav-links').removeClass('active');
            $('.menu-toggle').removeClass('active');
        }
    });

    // Add inside your existing $(document).ready function
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
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            }
        },
        autoplay: {
            delay: 3000,
            disableOnInteraction: false,
        }
    });

    // Update the filter functionality
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


    let lastSubmitTime = 0;
    const rateLimitInterval = 10000;

    document.getElementById("contactForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const honeypot = document.getElementById('critical').value;
        if (honeypot) {
            e.preventDefault();
            return;
        }

        const currentTime = Date.now();
        if (currentTime - lastSubmitTime < rateLimitInterval) {
            alert('You are submitting too quickly. Please wait a few seconds before submitting again.');
            return;
        }

        lastSubmitTime = currentTime;

        const form = event.target;
        const formData = new FormData(form);
        const alertBox = document.getElementById("formAlert");

        let formValid = true;
        const requiredFields = form.querySelectorAll("[required]");
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                formValid = false;
                field.style.borderColor = "red";
            } else {
                field.style.borderColor = "";
            }
        });

        if (!formValid) {
            alertBox.style.display = "block";
            alertBox.style.backgroundColor = "#f8d7da";
            alertBox.style.color = "#721c24";
            alertBox.textContent = "Please fill in all required fields.";
            setTimeout(() => alertBox.style.display = "none", 5000);
            return;
        } else {
            alertBox.style.display = "none";
        }

        alertBox.style.display = "none";
        alertBox.textContent = "";
        
        fetch("https://formspree.io/f/mbljokkw", {
            method: "POST",
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                alertBox.style.display = "block";
                alertBox.style.backgroundColor = "#d4edda";
                alertBox.style.color = "#155724";
                alertBox.textContent = "Thank you for your submission! We will contact you shortly.";
                form.reset();

                setTimeout(() => alertBox.style.display = "none", 5000);
            } else {
                let message = "Please fill in all required fields.";
                console.log(data)
                if (data.errors) {
                    console.log(data.errors)
                    const emailError = data.errors.find(error => error.field === 'email' && error.code === 'TYPE_EMAIL');
                    console.log(emailError)
                    if (emailError) {
                        message = 'Email must be a valid address.';
                    }
                }

                alertBox.style.display = "block";
                alertBox.style.backgroundColor = "#f8d7da";
                alertBox.style.color = "#721c24";
                alertBox.textContent = message;

                console.log("Validation error:", data);

                setTimeout(() => alertBox.style.display = "none", 5000);
            }
        })
        .catch(error => {
            alertBox.style.display = "block";
            alertBox.style.backgroundColor = "#f8d7da";
            alertBox.style.color = "#721c24";
            alertBox.textContent = "Unexpected error. Please try again later or email us at sales@quinnkaneconstruction.com.";
            console.log("Network error:", error);
        });
    });

    $('#contactForm input, #contactForm textarea').on('input', function() {
        if ($(this).prop('required')) {
            $(this).css('border-color', $(this).val() ? '#ddd' : '#ff0000');
        }
    });
});
