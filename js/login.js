document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Check against stored user accounts
        const existingUsers = JSON.parse(localStorage.getItem('userAccounts') || '[]');
        
        // Find user with matching email and password
        const user = existingUsers.find(user => user.email === email && user.password === password);
        
        if (user) {
            // Store login status in localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userEmail', user.email);
            
            // Redirect to dashboard
            window.location.href = '/pages/text3.html';
        } else {
            alert('Invalid credentials. Please check your email and password, or sign up for a new account.');
        }
    });
});
