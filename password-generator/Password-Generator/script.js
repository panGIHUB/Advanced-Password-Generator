// DOM Elements
const lengthSlider = document.getElementById("passwordLength");
const lengthValue = document.getElementById("lengthValue");
const generateBtn = document.getElementById("generateBtn");
const passwordInputs = document.querySelectorAll(".input--password");
const copyButtons = document.querySelectorAll(".copy-btn");
const toggleButtons = document.querySelectorAll(".toggle-btn");
const strengthMeters = document.querySelectorAll(".strength-meter");

// Options
const specialCharCheckbox = document.getElementById("special-char");
const uppercaseCheckbox = document.getElementById("uperrcase");
const numbersCheckbox = document.getElementById("numbers");
const excludeSimilarCheckbox = document.getElementById("exclude-similar");
const excludeAmbiguousCheckbox = document.getElementById("exclude-ambiguous");

const message = document.querySelector(".error-message");

// Character sets
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numberChars = '0123456789';
const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const similarChars = 'il1Lo0O';
const ambiguousChars = '{}[]()/\'"`~,;:.<>';

// Update length display
lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
});

// Generate password
function generatePassword() {
    const length = parseInt(lengthSlider.value);
    message.classList.remove("visibility");
    
    if (length <= 0) {
        return displayErrorMessage("Password must have at least one character");
    } else if (length > 32) {
        return displayErrorMessage("Password length should not exceed 32 characters");
    }
    
    passwordInputs.forEach(input => {
        const password = createPassword(length);
        input.value = password;
        updateStrengthMeter(input);
    });
}

function createPassword(length) {
    let chars = lowercaseChars;
    let password = '';
    
    // Add character sets based on options
    if (uppercaseCheckbox.checked) chars += uppercaseChars;
    if (numbersCheckbox.checked) chars += numberChars;
    if (specialCharCheckbox.checked) chars += specialChars;
    
    // Filter out excluded characters
    if (excludeSimilarCheckbox.checked) {
        chars = chars.split('').filter(c => !similarChars.includes(c)).join('');
    }
    if (excludeAmbiguousCheckbox.checked) {
        chars = chars.split('').filter(c => !ambiguousChars.includes(c)).join('');
    }
    
    // Ensure at least one character from each selected set
    const selectedSets = [];
    if (lowercaseChars) selectedSets.push(lowercaseChars);
    if (uppercaseCheckbox.checked) selectedSets.push(uppercaseChars);
    if (numbersCheckbox.checked) selectedSets.push(numberChars);
    if (specialCharCheckbox.checked) selectedSets.push(specialChars);
    
    // Add at least one character from each selected set
    selectedSets.forEach(set => {
        password += set.charAt(Math.floor(Math.random() * set.length));
    });
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Shuffle the password
    return shuffleString(password);
}

function shuffleString(str) {
    const array = str.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

// Password strength calculation
function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length contributes up to 50% of strength
    strength += Math.min(password.length / 32 * 50, 50);
    
    // Character variety contributes the rest
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    
    const varietyCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecial].filter(Boolean).length;
    strength += varietyCount * 12.5; // Up to 50%
    
    return Math.min(Math.round(strength), 100);
}

function updateStrengthMeter(input) {
    const password = input.value;
    const strength = calculatePasswordStrength(password);
    const meter = document.querySelector(`.strength-meter[data-target="${input.id}"]`);
    
    // Clear previous classes
    meter.className = 'strength-meter';
    meter.setAttribute('data-strength', Math.ceil(strength / 20));
    
    // Set width based on strength (0-100%)
    meter.style.width = `${strength}%`;
    
    // Add class based on strength level
    if (strength < 20) {
        meter.classList.add('strength-weak');
    } else if (strength < 40) {
        meter.classList.add('strength-fair');
    } else if (strength < 60) {
        meter.classList.add('strength-good');
    } else if (strength < 80) {
        meter.classList.add('strength-strong');
    } else {
        meter.classList.add('strength-very-strong');
    }
}

// Copy to clipboard
function copyToClipboard(e) {
    const targetId = this.getAttribute('data-target');
    const passwordInput = document.getElementById(targetId);
    
    passwordInput.select();
    passwordInput.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(passwordInput.value)
        .then(() => {
            displayMessage("Password copied to clipboard", "success");
        })
        .catch(err => {
            displayMessage("Failed to copy password", "error");
        });
}

// Toggle password visibility
function togglePasswordVisibility(e) {
    const targetId = this.getAttribute('data-target');
    const passwordInput = document.getElementById(targetId);
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Display messages
function displayErrorMessage(text) {
    message.classList.add("visibility");
    message.classList.remove("message");
    message.textContent = text;
}

function displayMessage(text, type) {
    message.textContent = text;
    message.className = 'error-message';
    message.classList.add(type);
    message.classList.add("visibility");
    
    setTimeout(() => {
        message.classList.remove("visibility");
    }, 3000);
}

// Event listeners
generateBtn.addEventListener("click", generatePassword);

copyButtons.forEach(button => {
    button.addEventListener("click", copyToClipboard);
});

toggleButtons.forEach(button => {
    button.addEventListener("click", togglePasswordVisibility);
});

// Initialize
generatePassword();