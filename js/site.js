document.addEventListener('DOMContentLoaded', () => {
    const year = document.getElementById('year');
    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scrollToHash = (hash, behavior = 'smooth') => {
        if (!hash || hash === '#') {
            return;
        }

        const target = document.querySelector(hash);
        if (!target) {
            return;
        }

        target.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : behavior,
            block: 'start'
        });
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const targetId = anchor.getAttribute('href');
            if (!targetId || targetId === '#') {
                return;
            }

            const target = document.querySelector(targetId);
            if (!target) {
                return;
            }

            event.preventDefault();
            scrollToHash(targetId);
            history.pushState(null, '', targetId);
        });
    });

    if (window.location.hash) {
        requestAnimationFrame(() => scrollToHash(window.location.hash, 'auto'));
    }

    window.addEventListener('hashchange', () => scrollToHash(window.location.hash));

    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');

    if (contactForm && submitBtn && formMessage) {
        contactForm.addEventListener('submit', async event => {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            formMessage.className = 'form-message';
            formMessage.textContent = '';

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { Accept: 'application/json' }
                });

                if (!response.ok) {
                    throw new Error('Form submission failed');
                }

                formMessage.className = 'form-message success';
                formMessage.textContent = "Message sent. We'll be in touch shortly.";
                contactForm.reset();
            } catch {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Something went wrong. Please email help@it365.ie directly.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        });
    }

    if (prefersReducedMotion) {
        return;
    }

    document.querySelectorAll('.glass').forEach(glass => {
        let targetX = 50;
        let targetY = 50;
        let currentX = 50;
        let currentY = 50;
        let animationFrame = null;

        const stopAnimation = () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }
        };

        const animate = () => {
            currentX += (targetX - currentX) * 0.18;
            currentY += (targetY - currentY) * 0.18;

            glass.style.setProperty('--x', `${currentX}%`);
            glass.style.setProperty('--y', `${currentY}%`);

            const isSettled = Math.abs(targetX - currentX) < 0.1 && Math.abs(targetY - currentY) < 0.1;
            if (isSettled) {
                animationFrame = null;
                return;
            }

            animationFrame = requestAnimationFrame(animate);
        };

        const startAnimation = () => {
            if (!animationFrame) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        glass.addEventListener('pointermove', event => {
            const rect = glass.getBoundingClientRect();

            targetX = ((event.clientX - rect.left) / rect.width) * 100;
            targetY = ((event.clientY - rect.top) / rect.height) * 100;

            startAnimation();
        });

        glass.addEventListener('pointerleave', () => {
            targetX = 50;
            targetY = 50;
            startAnimation();
        });

        glass.addEventListener('pointercancel', stopAnimation);
    });
});
