document.addEventListener('DOMContentLoaded', function () {
  // Real-time validation for registration form
  const registrationForm = document.querySelector('.needs-validation');
  if (registrationForm) {
    const inputs = registrationForm.querySelectorAll('input[required]');

    inputs.forEach(input => {
      input.addEventListener('input', function () {
        // Custom validation for email
        if (this.id === 'email') {
          const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
          if (!emailPattern.test(this.value)) {
            this.setCustomValidity('Please enter a valid email address.');
          } else {
            this.setCustomValidity('');
          }
        } else if (this.id === 'username') {
          const usernamePattern = /^[a-z0-9_]+$/;
          const minlength = parseInt(this.getAttribute('minlength'), 10);
          if (this.value.length < minlength) {
            this.setCustomValidity(`Username must be at least ${minlength} characters long.`);
          } else if (!usernamePattern.test(this.value)) {
            this.setCustomValidity('Username can only contain lowercase letters, numbers, and underscores.');
          } else {
            this.setCustomValidity('');
          }
        } else if (this.id === 'password') {
          const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
          const minlength = parseInt(this.getAttribute('minlength'), 10);
          if (this.value.length < minlength) {
            this.setCustomValidity(`Password must be at least ${minlength} characters long.`);
          } else if (!passwordPattern.test(this.value)) {
            this.setCustomValidity('Password must contain at least one uppercase letter, one number, and one special character.');
          } else {
            this.setCustomValidity('');
          }
        } else {
          this.setCustomValidity(''); // Clear custom validity for other fields
        }

        if (this.checkValidity()) {
          this.classList.remove('is-invalid');
          this.classList.add('is-valid');
        } else {
          this.classList.remove('is-valid');
          this.classList.add('is-invalid');
        }
      });
    });

    registrationForm.addEventListener('submit', function (event) {
      console.log('Form submit event triggered.');
      console.log('this.checkValidity():', this.checkValidity());
      if (!this.checkValidity()) {
        console.log('Preventing default form submission.');
        event.preventDefault();
        event.stopPropagation();
      }
      console.log('event.defaultPrevented:', event.defaultPrevented);
      this.classList.add('was-validated');
    });
  }

  // Show/hide password
  const togglePassword = document.getElementById('togglePassword');
  if (togglePassword) {
    togglePassword.addEventListener('click', function () {
      const password = document.getElementById('password');
      const icon = this.querySelector('i');
      // Toggle the type
      const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
      password.setAttribute('type', type);
      // Toggle the icon
      if (type === 'password') {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      } else {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      }
    });
  }
});