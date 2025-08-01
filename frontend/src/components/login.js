import {AuthUtils} from "../utils/auth-utils.js";

export class Login {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (localStorage.getItem('accessToken')) {
            return this.openNewRoute('/')
        }

        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.rememberMeElement = document.getElementById('remember-me');
        this.commonErrorLoginElement = document.getElementById('common-error-login');

        this.emailErrorElement = document.getElementById('email-error');
        this.passwordErrorElement = document.getElementById('password-error');

        this.hideAllErrors();

        document.getElementById('process-button').addEventListener('click', this.login.bind(this));

    }

    hideAllErrors() {
        this.emailErrorElement.style.display = 'none';
        this.passwordErrorElement.style.display = 'none';

        this.emailElement.classList.remove('is-invalid');
        this.passwordElement.classList.remove('is-invalid');
    }

    validateForm() {
        let isValid = true;
        this.hideAllErrors();

        const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (!emailRegex.test(this.emailElement.value)) {
            this.emailErrorElement.style.display = 'block';
            this.emailElement.classList.add('is-invalid');
            isValid = false;
        }

        // Валидация пароля
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
        if (!passwordRegex.test(this.passwordElement.value)) {
            this.passwordErrorElement.style.display = 'block';
            this.passwordElement.classList.add('is-invalid');
            isValid = false;
        }
        return isValid;
    }

    async login() {
        this.commonErrorLoginElement.style.display = 'none';
        this.hideAllErrors();

        if (this.validateForm()) {

            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    email: this.emailElement.value,
                    password: this.passwordElement.value,
                    rememberMe: this.rememberMeElement.checked
                })
            });

            const result = await response.json();
            if (!result ||
                result.error ||
                !result.tokens?.accessToken ||
                !result.tokens?.refreshToken ||
                !result.user?.id ||
                !result.user?.name ||
                !result.user?.lastName) {
                this.commonErrorLoginElement.style.display = 'block';
                return;
            }

            AuthUtils.setAuthInfo(result.tokens.accessToken, result.tokens.refreshToken, {
                name: result.user.name,
                lastName: result.user.lastName,
                id: result.id})


            this.openNewRoute('/');
        }
    }

}