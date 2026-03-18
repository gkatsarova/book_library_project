/* ── Shared: SVG Icons ── */
const ICON_BOOK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/></svg>';
const ICON_ALERT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
const ICON_CHECK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>';

/* ── LOGIN PAGE ── */
function initLogin() {
  const form = document.querySelector('form');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('error')) {
    document.getElementById('errorAlert').classList.add('visible');
  }
  if (urlParams.has('logout')) {
    document.getElementById('logoutAlert').classList.add('visible');
  }
}

/* ── REGISTER PAGE ── */
function initRegister() {
  const form = document.getElementById('registrationForm');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const submitBtn = document.getElementById('submitBtn');
  const successAlert = document.getElementById('successAlert');
  const errorAlert = document.getElementById('errorAlert');

  const errorElements = {
    firstName: document.getElementById('firstNameError'),
    lastName: document.getElementById('lastNameError'),
    email: document.getElementById('emailError'),
    password: document.getElementById('passwordError'),
    confirmPassword: document.getElementById('confirmPasswordError'),
    role: document.getElementById('roleError')
  };

  let isEmailValid = false;
  let isPasswordValid = false;
  let isConfirmPasswordValid = false;

  function clearErrors() {
    Object.values(errorElements).forEach(el => {
      el.style.display = 'none';
      el.textContent = '';
    });
    errorAlert.classList.remove('visible');
  }

  function updateSubmitBtn() {
    const allValid = isEmailValid && isPasswordValid && isConfirmPasswordValid;
    submitBtn.disabled = !allValid;
  }

  emailInput.addEventListener('blur', function () {
    const email = emailInput.value;
    if (!email) {
      isEmailValid = false;
      emailInput.classList.remove('is-valid', 'is-invalid');
      updateSubmitBtn();
      return;
    }
    fetch('/api/users/check-email?email=' + encodeURIComponent(email))
      .then(response => response.json())
      .then(data => {
        if (data.exists) {
          errorElements.email.textContent = 'This email is already registered.';
          errorElements.email.style.display = 'block';
          emailInput.classList.add('is-invalid');
          emailInput.classList.remove('is-valid');
          isEmailValid = false;
        } else {
          errorElements.email.style.display = 'none';
          emailInput.classList.add('is-valid');
          emailInput.classList.remove('is-invalid');
          isEmailValid = true;
        }
        updateSubmitBtn();
      });
  });

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  function validatePassword() {
    const password = passwordInput.value;
    if (!password) {
      isPasswordValid = false;
      passwordInput.classList.remove('is-valid', 'is-invalid');
    } else if (!passwordRegex.test(password)) {
      errorElements.password.textContent = 'Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 digit, and 1 special character.';
      errorElements.password.style.display = 'block';
      passwordInput.classList.add('is-invalid');
      passwordInput.classList.remove('is-valid');
      isPasswordValid = false;
    } else {
      errorElements.password.style.display = 'none';
      passwordInput.classList.add('is-valid');
      passwordInput.classList.remove('is-invalid');
      isPasswordValid = true;
    }
    validateConfirmPassword();
  }

  function validateConfirmPassword() {
    const confirmPassword = confirmPasswordInput.value;
    if (!confirmPassword) {
      isConfirmPasswordValid = false;
      confirmPasswordInput.classList.remove('is-valid', 'is-invalid');
    } else if (confirmPassword !== passwordInput.value) {
      errorElements.confirmPassword.textContent = 'The passwords do not match.';
      errorElements.confirmPassword.style.display = 'block';
      confirmPasswordInput.classList.add('is-invalid');
      confirmPasswordInput.classList.remove('is-valid');
      isConfirmPasswordValid = false;
    } else {
      errorElements.confirmPassword.style.display = 'none';
      confirmPasswordInput.classList.add('is-valid');
      confirmPasswordInput.classList.remove('is-invalid');
      isConfirmPasswordValid = true;
    }
    updateSubmitBtn();
  }

  passwordInput.addEventListener('input', validatePassword);
  confirmPasswordInput.addEventListener('input', validateConfirmPassword);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    const formData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: emailInput.value,
      password: passwordInput.value,
      confirmPassword: confirmPasswordInput.value,
      role: document.getElementById('role').value
    };

    fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(async response => {
        const data = await response.json();
        if (response.ok) {
          successAlert.classList.add('visible');
          form.style.display = 'none';
        } else if (response.status === 400) {
          Object.keys(data).forEach(field => {
            if (errorElements[field]) {
              errorElements[field].textContent = data[field];
              errorElements[field].style.display = 'block';
            }
          });
        } else {
          errorAlert.querySelector('span').textContent = data.error || 'An unexpected error occurred.';
          errorAlert.classList.add('visible');
        }
      })
      .catch(() => {
        errorAlert.querySelector('span').textContent = 'Failed to connect to the server.';
        errorAlert.classList.add('visible');
      });
  });

  updateSubmitBtn();
}

/* ── Auto-init based on page ── */
document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('registrationForm')) {
    initRegister();
  } else {
    initLogin();
  }
});
