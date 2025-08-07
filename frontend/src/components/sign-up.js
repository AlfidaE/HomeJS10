import {AuthUtils} from "../utils/auth-utils.js";
import config from "../../config/config.js";
import {CustomHttp} from "../utils/custom-http.js";

export class SignUp {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (localStorage.getItem('accessToken')) {
            return this.openNewRoute('/')
        }

        // Получаем элементы формы
        this.nameElement = document.getElementById('name');
        this.lastNameElement = document.getElementById('last-name');
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.passwordRepeatElement = document.getElementById('password-repeat');
        this.commonErrorElement = document.getElementById('common-error');
        this.rememberMeElement = document.getElementById('remember-me');


        // Получаем элементы для сообщений об ошибках
        this.nameErrorElement = document.getElementById('name-error');
        this.lastNameErrorElement = document.getElementById('last-name-error');
        this.emailErrorElement = document.getElementById('email-error');
        this.passwordErrorElement = document.getElementById('password-error');
        this.passwordRepeatErrorElement = document.getElementById('password-repeat-error');

        // Изначально скрываем все сообщения об ошибках
        this.hideAllErrors();

        // Назначаем обработчик на кнопку
        document.getElementById('process-button').addEventListener('click', this.signUp.bind(this));
    }

    // Метод для скрытия всех сообщений об ошибках
    hideAllErrors() {
        this.commonErrorElement.style.display = 'none';
        this.nameErrorElement.style.display = 'none';
        this.lastNameErrorElement.style.display = 'none';
        this.emailErrorElement.style.display = 'none';
        this.passwordErrorElement.style.display = 'none';
        this.passwordRepeatErrorElement.style.display = 'none';

        // Убираем класс is-invalid со всех полей
        this.nameElement.classList.remove('is-invalid');
        this.lastNameElement.classList.remove('is-invalid');
        this.emailElement.classList.remove('is-invalid');
        this.passwordElement.classList.remove('is-invalid');
        this.passwordRepeatElement.classList.remove('is-invalid');
    }


    validateForm() {
        let isValid = true;
        this.hideAllErrors(); // Сначала скрываем все ошибки

        // Валидация имени
        if (!this.nameElement.value || !this.nameElement.value.match(/^[А-ЯЁ][а-яё]*(?:[\s-][А-ЯЁ][а-яё]*)*$/)) {
            this.nameErrorElement.style.display = 'block';
            this.nameElement.classList.add('is-invalid');
            this.nameElement.closest('.input-group-text').classList.add('invalid');
            isValid = false;
        } else {
            this.nameElement.classList.remove('is-invalid');
            this.nameElement.closest('.input-group-text').classList.remove('invalid');
        }

        // Валидация фамилии
        if (!this.lastNameElement.value || !this.lastNameElement.value.match(/^[А-ЯЁ][а-яё]+(?:[-\s][А-ЯЁ][а-яё]+)*$/)) {
            this.lastNameErrorElement.style.display = 'block';
            this.lastNameElement.classList.add('is-invalid');
            this.lastNameElement.closest('.input-group-text').classList.add('invalid');
            isValid = false;
        } else {
            this.lastNameElement.classList.remove('is-invalid');
            this.lastNameElement.closest('.input-group-text').classList.remove('invalid');
        }

        // Валидация email
        const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (!emailRegex.test(this.emailElement.value)) {
            this.emailErrorElement.style.display = 'block';
            this.emailElement.classList.add('is-invalid');
            this.emailElement.closest('.input-group-text').classList.add('invalid');
            isValid = false;
        } else {
            this.emailElement.classList.remove('is-invalid');
            this.emailElement.closest('.input-group-text').classList.remove('invalid');

        }

        // Валидация пароля
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
        if (!passwordRegex.test(this.passwordElement.value)) {
            this.passwordErrorElement.style.display = 'block';
            this.passwordElement.classList.add('is-invalid');
            this.passwordElement.closest('.input-group-text').classList.add('invalid');
            isValid = false;
        } else {
            this.passwordElement.classList.remove('is-invalid');
            this.passwordElement.closest('.input-group-text').classList.remove('invalid');
        }

        // Валидация подтверждения пароля
        if (this.passwordRepeatElement.value !== this.passwordElement.value) {
            this.passwordRepeatErrorElement.style.display = 'block';
            this.passwordRepeatElement.classList.add('is-invalid');
            this.passwordRepeatElement.closest('.input-group-text').classList.add('invalid');

            isValid = false;
        } else {
            this.passwordRepeatElement.classList.remove('is-invalid');
            this.passwordRepeatElement.closest('.input-group-text').classList.remove('invalid');

        }

        return isValid;
    }

    async signUp() {
        this.hideAllErrors();

        if (!this.validateForm()) {
            return;
        }
        try {
            const signupResponse = await CustomHttp.request(config.host + '/signup', 'POST', {
                name: this.nameElement.value.trim(),
                lastName: this.lastNameElement.value.trim(),
                email: this.emailElement.value.trim(),
                password: this.passwordElement.value,
                passwordRepeat: this.passwordRepeatElement.value
            });


            if (!signupResponse || signupResponse.error) {
                throw new Error(signupResponse?.message);
            }

            const loginResponse = await CustomHttp.request(config.host + '/login', 'POST', {
                email: this.emailElement.value,
                password: this.passwordElement.value,
                rememberMe: false
            });

            if (!loginResponse || !loginResponse.tokens || !loginResponse.tokens.accessToken) {
                throw new Error(loginResponse?.message);
            }

            AuthUtils.setAuthInfo(
                loginResponse.tokens.accessToken,
                loginResponse.tokens.refreshToken,
                {
                    name: loginResponse.user?.name || this.nameElement.value.trim(),
                    lastName: loginResponse.user?.lastName || this.lastNameElement.value.trim(),
                    id: loginResponse.user?.id || '',
                    email: this.emailElement.value.trim()
                }
            );
            this.openNewRoute('/');

        } catch (error) {
            this.commonErrorElement.style.display = 'block';
        }
    }
}

// const result = await response.json();
//
// if (!result ||
//     result.error ||
//     !result.user?.id ||
//     !result.user?.name ||
//     !result.user?.lastName) {
//        this.commonErrorElement.style.display = 'block';
//     return;
// }
//
//
// AuthUtils.setTokens(result.accessToken, result.refreshToken);
// AuthUtils.setAuthInfo({
//     id: result.user.id,
//     name: result.user.name,
//     lastName: result.user.lastName,
//     email: this.emailElement.value.trim()
// });