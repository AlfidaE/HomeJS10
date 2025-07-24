export class Login {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

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
            if (result.error ||
                !result.tokens ||
                !result.tokens.accessToken ||
                !result.tokens.refreshToken ||
                !result.user ||
                !result.user.id ||
                !result.user.lastName ||
                !result.user.name) {
                this.commonErrorLoginElement.style.display = 'block';
                return;
            }

            localStorage.setItem('accessToken', result.accessToken);
            localStorage.setItem('refreshToken', result.refreshToken);
            localStorage.setItem('userInfo', JSON.stringify({
                name: result.name,
                lastName: result.lastName,
                id: result.id}));

            this.openNewRoute('/');
        }
    }

}

































// export class Login {
//     constructor(openNewRoute) {
//         this.processElement = null;
//
//         this.commonErrorElement = document.getElementById('common-error-login');
//         this.fields = [
//             {
//                 email: 'email',
//                 id: 'email',
//                 element: null,
//                 regex: /^[a-zA-Z0-9_.±]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/,
//                 valid: false,
//             },
//             {
//                 password: 'password',
//                 id: 'password',
//                 element: null,
//                 regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
//                 valid: false,
//             },
//         ];
//
//         // if (this.page === 'signup') {
//         //     this.fields.unshift({
//         //             name: 'name',
//         //             id: 'name',
//         //             element: null,
//         //             regex: /^[А-ЯЁ][а-яё]*(?:[\s-][А-ЯЁ][а-яё]*)*$/,
//         //             valid: false,
//         //         },
//         //         {
//         //             name: 'lastName',
//         //             id: 'last-name',
//         //             element: null,
//         //             regex: /^[А-ЯЁ][а-яё]+(?:[-\s][А-ЯЁ][а-яё]+)*$/,
//         //             valid: false,
//         //         },
//         //         {
//         //
//         //         });
//         // }
//
//         const that = this;
//         this.fields.forEach(item => {
//             item.element = document.getElementById(item.id);
//             item.element.onchange = function () {
//                 that.validateField.call(that, item, this);
//             }
//         });
//
//         this.processElement = document.getElementById('process');
//         this.processElement.onclick = function () {
//             that.processForm();
//         }
//     };
//
//
//     validateField(field, element) {
//         this.commonErrorElement.style.display = 'none';
//         if (!element.value || !element.value.match(field.regex)) {
//             element.parentNode.style.borderColor = 'red';
//             this.commonErrorElement.style.display = 'block';
//             field.valid = false;
//         } else {
//             element.parentNode.removeAttribute('style');
//             field.valid = true;
//         }
//         this.validateForm();
//     }
//
//     validateForm() {
//         const validForm = this.fields.every(item => item.valid);
//         if (validForm) {
//             this.processElement.removeAttribute('disabled');
//         } else {
//             this.processElement.setAttribute('disabled', 'disabled');
//         }
//         return validForm;
//     }
//
//     processForm() {
//         if (this.validateForm()) {
//             location.href = '/sign-up';
//         }
//
//
//     }
// }