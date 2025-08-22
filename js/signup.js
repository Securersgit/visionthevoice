document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signup-form');
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        // Basic validation
        if (!name) {
            alert('Please enter your full name');
            return;
        }
        
        if (!email) {
            alert('Please enter your email');
            return;
        }
        
        if (!password) {
            alert('Please enter a password');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }
        
        // Get existing users from localStorage or initialize empty array
        const existingUsers = JSON.parse(localStorage.getItem('userAccounts') || '[]');
        
        // Check if email already exists
        const userExists = existingUsers.find(user => user.email === email);
        if (userExists) {
            alert('An account with this email already exists. Please login instead.');
            return;
        }
        
        // Create new user object (in a real app, you'd hash the password)
        const newUser = {
            name: name,
            email: email,
            password: password, // Note: In production, you should hash passwords!
            createdAt: new Date().toISOString()
        };
        
        // Add new user to the array
        existingUsers.push(newUser);
        
        // Save updated users array to localStorage
        localStorage.setItem('userAccounts', JSON.stringify(existingUsers));
        
        // Store current session data
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', name);
        localStorage.setItem('userEmail', email);
        
        // Redirect to Get Started page
        window.location.href = '/pages/Get-started.html';
    });
});
