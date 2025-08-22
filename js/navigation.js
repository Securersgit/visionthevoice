// Scroll reveal functionality
document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // Animate once
      }
    });
  }, { threshold: 0.15 });

  reveals.forEach(section => observer.observe(section));
});




// Global Navigation Controller with Loading Screen
class NavigationController {
    constructor() {
        this.isTransitioning = false;
        this.loadingScreen = null;
        this.init();
    }

    init() {
        this.createLoadingScreen();
        this.setupNavigation();
        this.setupDashboardNavigation();
    }

    createLoadingScreen() {
        const loadingScreen = document.createElement('div');
        loadingScreen.className = 'loading-screen';
        loadingScreen.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading...</div>
        `;
        document.body.appendChild(loadingScreen);
        this.loadingScreen = loadingScreen;
    }

    setupNavigation() {
        // Intercept all internal link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            
            // Skip external links, anchor links, and non-HTML files
            if (!href || 
                href.startsWith('#') || 
                href.startsWith('http') || 
                href.startsWith('mailto:') || 
                href.startsWith('tel:') ||
                href.includes('.pdf') ||
                href.includes('.zip') ||
                this.isTransitioning) {
                return;
            }

            // Handle dashboard sidebar navigation
            if (this.isDashboardSidebarLink(link)) {
                e.preventDefault();
                this.handleDashboardNavigation(link);
                return;
            }

            // Handle regular page navigation
            e.preventDefault();
            this.navigateTo(href);
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.handlePageLoad();
        });
    }

    setupDashboardNavigation() {
        // Add transition classes to dashboard content
        if (document.querySelector('.dashboard')) {
            const mainContent = document.querySelector('.main');
            if (mainContent) {
                mainContent.classList.add('dashboard-tab-transition');
                setTimeout(() => {
                    mainContent.classList.add('active');
                }, 100);
            }
        }
    }

    isDashboardSidebarLink(link) {
        // Check if link is in dashboard sidebar
        return link.closest('.sidebar') || 
               (document.querySelector('.dashboard') && 
                link.getAttribute('href') && 
                !link.getAttribute('href').includes('.html'));
    }

    handleDashboardNavigation(link) {
        const href = link.getAttribute('href');
        if (href === '#') return;

        // Show loading for dashboard tab changes
        this.showLoading();

        // Simulate loading for dashboard content changes
        setTimeout(() => {
            this.hideLoading();
            
            // Update active state in sidebar
            document.querySelectorAll('.menu a').forEach(a => {
                a.classList.remove('active');
            });
            link.classList.add('active');

            // Add transition effect to main content
            const mainContent = document.querySelector('.main');
            if (mainContent) {
                mainContent.classList.remove('active');
                setTimeout(() => {
                    // Update content based on the tab (simulated)
                    this.updateDashboardContent(href);
                    mainContent.classList.add('active');
                }, 300);
            }
        }, 800);
    }

    updateDashboardContent(tab) {
        // This would be replaced with actual content loading logic
        const mainContent = document.querySelector('.main');
        if (!mainContent) return;

        // Simulate content change based on tab
        switch(tab) {
            case '#analytics':
                mainContent.innerHTML = '<h2>Analytics</h2><p>Analytics content would load here...</p>';
                break;
            case '#episodes':
                mainContent.innerHTML = '<h2>Episodes</h2><p>Episodes content would load here...</p>';
                break;
            // Add more cases as needed
            default:
                // Keep original content for home
                break;
        }
    }

    navigateTo(url) {
        if (this.isTransitioning) return;

        this.isTransitioning = true;
        this.showLoading();

        // Add transition class to body
        document.body.classList.add('transitioning');

        setTimeout(() => {
            window.location.href = url;
        }, 500);
    }

    showLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('active');
        }
    }

    hideLoading() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('active');
        }
        this.isTransitioning = false;
        document.body.classList.remove('transitioning');
    }

    handlePageLoad() {
        // Add page transition effect on page load
        const mainContent = document.querySelector('main') || document.body;
        mainContent.classList.add('page-transition');
        
        setTimeout(() => {
            mainContent.classList.add('active');
        }, 100);

        // Hide loading screen after page is fully loaded
        window.addEventListener('load', () => {
            this.hideLoading();
        });
    }
}

// Initialize navigation controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationController = new NavigationController();
    window.navigationController.handlePageLoad();
});

// Handle page before unload
window.addEventListener('beforeunload', () => {
    if (window.navigationController) {
        window.navigationController.showLoading();
    }
});
