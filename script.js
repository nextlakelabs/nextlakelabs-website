/**
 * NextLakeLabs - Minimal JavaScript
 * Only essential interactivity, keeping the site fast
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        // Create backdrop overlay for mobile menu
        const navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        navOverlay.style.cssText = `
            position: fixed;
            inset: 0;
            top: 72px;
            background: rgba(0, 0, 0, 0.4);
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        `;
        document.body.appendChild(navOverlay);

        navToggle.addEventListener('click', function() {
            const isActive = navMenu.classList.toggle('active');
            this.classList.toggle('active');
            navOverlay.style.opacity = isActive ? '1' : '0';
            navOverlay.style.visibility = isActive ? 'visible' : 'hidden';
            document.body.style.overflow = isActive ? 'hidden' : '';
        });

        navOverlay.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
            this.style.opacity = '0';
            this.style.visibility = 'hidden';
            document.body.style.overflow = '';
        });
        
        // Close menu when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navOverlay.style.opacity = '0';
                navOverlay.style.visibility = 'hidden';
                document.body.style.overflow = '';
            });
        });
    }
    
    // Smooth scroll for anchor links (fallback for older browsers)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Simple Math Captcha
    let captchaAnswer = 0;
    
    function generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        captchaAnswer = num1 + num2;
        
        const questionEl = document.getElementById('captchaQuestion');
        const answerEl = document.getElementById('captchaAnswer');
        
        if (questionEl) {
            questionEl.textContent = `What is ${num1} + ${num2}?`;
        }
        if (answerEl) {
            answerEl.value = captchaAnswer;
        }
    }
    
    // Generate captcha on page load
    generateCaptcha();
    
    // Blog Integration
    const blogGrid = document.getElementById('blogGrid');
    const blogComingSoon = document.getElementById('blogComingSoon');
    const API_BASE_URL = 'https://nextlakelabs-backened.onrender.com/api/blog';

    function showSkeletonLoading() {
        if (!blogGrid) return;
        let skeletonHtml = '';
        for (let i = 0; i < 3; i++) {
            skeletonHtml += `
                <div class="blog-skeleton">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line title"></div>
                        <div class="skeleton-line medium"></div>
                        <div class="skeleton-line short"></div>
                    </div>
                </div>`;
        }
        blogGrid.innerHTML = skeletonHtml;
    }

    function getCachedBlogs() {
        try {
            const cached = localStorage.getItem('nll_blogs_cache');
            if (!cached) return null;
            const parsed = JSON.parse(cached);
            // Cache valid for 5 minutes
            if (Date.now() - parsed.timestamp > 5 * 60 * 1000) return null;
            return parsed.data;
        } catch (e) {
            return null;
        }
    }

    function setCachedBlogs(blogs) {
        try {
            localStorage.setItem('nll_blogs_cache', JSON.stringify({
                data: blogs,
                timestamp: Date.now()
            }));
        } catch (e) {
            // localStorage unavailable or full — ignore
        }
    }

    // Silent prefetch — runs on ANY page to warm up the backend and cache blog data
    async function prefetchBlogs() {
        const cached = getCachedBlogs();
        if (cached && cached.length > 0) return; // Already have fresh cache, skip

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000);
            const response = await fetch(`${API_BASE_URL}/viewblog`, { signal: controller.signal });
            clearTimeout(timeout);
            if (!response.ok) return;
            const blogs = await response.json();
            if (blogs && blogs.length > 0) {
                setCachedBlogs(blogs);
            }
        } catch (e) {
            // Silent fail — this is just a background prefetch
        }
    }

    // Blog page: render blogs from cache or fetch
    async function fetchBlogs() {
        if (!blogGrid) return;

        // Show cached data immediately if available
        const cached = getCachedBlogs();
        if (cached && cached.length > 0) {
            renderBlogs(cached);
            // Still refresh in background
            prefetchBlogsAndRefresh();
            return;
        }

        // No cache — show skeleton and fetch
        showSkeletonLoading();

        // Show a "server waking up" message if API is slow
        const warmupTimeout = setTimeout(() => {
            const warmupEl = document.createElement('div');
            warmupEl.id = 'blogWarmup';
            warmupEl.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 1rem 0; color: #64748b; font-size: 0.95rem;';
            warmupEl.textContent = 'Our server is waking up — this may take a moment on first visit...';
            blogGrid.appendChild(warmupEl);
        }, 5000);

        try {
            const controller = new AbortController();
            const apiTimeout = setTimeout(() => controller.abort(), 60000);

            const response = await fetch(`${API_BASE_URL}/viewblog`, { signal: controller.signal });
            clearTimeout(apiTimeout);
            clearTimeout(warmupTimeout);

            if (!response.ok) throw new Error('Failed to fetch blogs');
            
            const blogs = await response.json();
            
            if (blogs && blogs.length > 0) {
                setCachedBlogs(blogs);
                renderBlogs(blogs);
            } else {
                showComingSoon();
            }
        } catch (error) {
            clearTimeout(warmupTimeout);
            console.error('Error fetching blogs:', error);
            showComingSoon();
        }
    }

    // Background refresh when blog page has cached data
    async function prefetchBlogsAndRefresh() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000);
            const response = await fetch(`${API_BASE_URL}/viewblog`, { signal: controller.signal });
            clearTimeout(timeout);
            if (!response.ok) return;
            const blogs = await response.json();
            if (blogs && blogs.length > 0) {
                setCachedBlogs(blogs);
                renderBlogs(blogs);
            }
        } catch (e) {
            // Silent — cached version is already showing
        }
    }

    // Prefetch on every page (homepage, about, etc.) to warm the backend
    if (!blogGrid) {
        prefetchBlogs();
    }

    // On blog page, render immediately
    if (blogGrid) {
        fetchBlogs();
    }

    function renderBlogs(blogs) {
        blogGrid.innerHTML = ''; // Clear loading state
        
        blogs.forEach(blog => {
            const date = new Date(blog.datePublished || blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const blogCard = document.createElement('article');
            blogCard.className = 'blog-card';
            
            // Handle tags
            const tagsHtml = blog.tags && blog.tags.length > 0 
                ? `<div class="blog-card-tags">${blog.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}</div>`
                : '';

            blogCard.innerHTML = `
                <img src="${blog.coverImage || 'images/blog-placeholder.jpg'}" alt="${blog.coverImageAlt || blog.title}" class="blog-card-image" onerror="this.src='https://via.placeholder.com/800x400?text=NextLakeLabs+Insights'">
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <span>${date}</span>
                        <span>${calculateReadTime(blog.content)} min read</span>
                    </div>
                    <h3>${blog.title}</h3>
                    <p>${blog.excerpt || truncateText(blog.content, 120)}</p>
                    <a href="blog-post.html?slug=${blog.slug}" class="blog-read-more">Read more →</a>
                </div>
            `;
            blogGrid.appendChild(blogCard);
        });
    }

    function showComingSoon() {
        if (blogGrid) blogGrid.style.display = 'none';
        if (blogComingSoon) blogComingSoon.style.display = 'block';
    }

    function calculateReadTime(content) {
        if (!content) return 5;
        const wordsPerMinute = 200;
        const noOfWords = content.split(/\s+/g).length;
        const minutes = noOfWords / wordsPerMinute;
        return Math.ceil(minutes);
    }

    function truncateText(text, length) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length).trim() + '...';
    }

    // Single Blog Post Logic
    const postLoading = document.getElementById('postLoading');
    const postError = document.getElementById('postError');
    const postDetail = document.getElementById('postDetail');

    async function fetchSingleBlog() {
        if (!postDetail) return;

        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');

        if (!slug) {
            showPostError();
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${slug}`);
            if (!response.ok) throw new Error('Blog not found');
            
            const blog = await response.json();
            renderSingleBlog(blog);
        } catch (error) {
            console.error('Error fetching blog post:', error);
            showPostError();
        }
    }

    function renderSingleBlog(blog) {
        if (postLoading) postLoading.style.display = 'none';
        if (postDetail) postDetail.style.display = 'block';

        const titleEl = document.getElementById('postTitle');
        const metaEl = document.getElementById('postMeta');
        const coverEl = document.getElementById('postCover');
        const contentEl = document.getElementById('postContent');
        const pageTitle = document.getElementById('pageTitle');

        if (titleEl) titleEl.textContent = blog.title;
        if (pageTitle) pageTitle.textContent = `${blog.title} | NextLakeLabs`;
        
        const date = new Date(blog.datePublished || blog.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        if (metaEl) {
            metaEl.innerHTML = `
                <span class="meta-item">${date}</span>
                <span class="meta-item">${calculateReadTime(blog.content)} min read</span>
                <span class="meta-item">By ${blog.author || 'NextLakeLabs'}</span>
            `;
        }

        if (coverEl) {
            coverEl.src = blog.coverImage || 'https://via.placeholder.com/1200x600?text=NextLakeLabs+Insights';
            coverEl.alt = blog.coverImageAlt || blog.title;
        }

        if (contentEl) {
            // Check if content is HTML or Markdown (assuming simple HTML for now)
            // If it's markdown, you'd need a library like marked.js
            contentEl.innerHTML = blog.content;
        }
    }

    function showPostError() {
        if (postLoading) postLoading.style.display = 'none';
        if (postError) postError.style.display = 'block';
    }

    if (postDetail) {
        fetchSingleBlog();
    }

    // Admin Login Logic
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            
            // Show loading state
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Signing in... <span class="spinner"></span>';
            if (loginError) loginError.style.display = 'none';

            try {
                // The API URL as per the backend structure provided earlier
                // Assuming /api/admin/login exists on the same base URL
                const response = await fetch('https://nextlakelabs-backened.onrender.com/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();

                if (response.ok) {
                    // Store token if returned
                    if (result.token) {
                        localStorage.setItem('adminToken', result.token);
                    }
                    
                    showNotification('Login successful! Redirecting to admin portal...', 'success');
                    
                    // Redirect to the admin portal on Vercel
                    setTimeout(() => {
                        window.location.href = 'https://nextlake-admin.vercel.app/';
                    }, 1500);
                } else {
                    // Show error message
                    const errorMsg = result.msg || result.error || 'Invalid email or password.';
                    if (loginError) {
                        loginError.textContent = errorMsg;
                        loginError.style.display = 'block';
                    }
                    showNotification(errorMsg, 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                const errorMsg = 'Server connection failed. Please try again later.';
                if (loginError) {
                    loginError.textContent = errorMsg;
                    loginError.style.display = 'block';
                }
                showNotification(errorMsg, 'error');
            } finally {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
    
    // Contact Form - AJAX submission with new tab redirect
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = this.querySelector('#name').value.trim();
            const email = this.querySelector('#email').value.trim();
            
            // Basic validation
            if (!name || !email) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Verify math captcha
            const userAnswer = parseInt(this.querySelector('#captcha').value, 10);
            if (userAnswer !== captchaAnswer) {
                showNotification('Incorrect captcha answer. Please try again.', 'error');
                generateCaptcha();
                this.querySelector('#captcha').value = '';
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending... <span class="spinner"></span>';
            
            try {
                const formData = new FormData(this);
                // Remove captcha fields from submission
                formData.delete('captcha');
                formData.delete('captcha_answer');
                
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Reset form
                    this.reset();
                    
                    // Generate new captcha
                    generateCaptcha();
                    
                    // Show success message
                    showNotification('Thank you! Your request has been submitted.', 'success');
                    
                    // Open thank-you page in new tab
                    window.open('thank-you.html', '_blank');
                    
                } else {
                    // Show specific error from Web3Forms
                    const errorMsg = result.message || 'Something went wrong. Please try again.';
                    showNotification(errorMsg, 'error');
                    generateCaptcha();
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showNotification('Network error. Please check your connection and try again.', 'error');
                generateCaptcha();
            } finally {
                // Restore button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
    
    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
});

// Utility: Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Utility: Show notification
function showNotification(message, type) {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
