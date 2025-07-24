export class SignUp {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        // Получаем элементы формы
        this.nameElement = document.getElementById('name');
        this.lastNameElement = document.getElementById('last-name');
        this.emailElement = document.getElementById('email');
        this.passwordElement = document.getElementById('password');
        this.passwordRepeatElement = document.getElementById('password-repeat');
        this.commonErrorElement = document.getElementById('common-error');

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
        if (this.nameElement.value.trim() === '') {
            this.nameErrorElement.style.display = 'block';
            this.nameElement.classList.add('is-invalid');
            isValid = false;
        }

        // Валидация фамилии
        if (this.lastNameElement.value.trim() === '') {
            this.lastNameErrorElement.style.display = 'block';
            this.lastNameElement.classList.add('is-invalid');
            isValid = false;
        }

        // Валидация email
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

        // Валидация подтверждения пароля
        if (this.passwordRepeatElement.value !== this.passwordElement.value) {
            this.passwordRepeatErrorElement.style.display = 'block';
            this.passwordRepeatElement.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    async signUp() {
        // При попытке входа сначала скрываем все ошибки
        this.hideAllErrors();

        if (this.validateForm()) {
            try {
                const response = await fetch('http://localhost:3000/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        name: this.nameElement.value.trim(),
                        lastName: this.lastNameElement.value.trim(),
                        email: this.emailElement.value.trim(),
                        password: this.passwordElement.value,
                    })
                });

                const result = await response.json();

                if (result.error || !result.accessToken || !result.refreshToken || !result.id || !result.name) {
                    this.commonErrorElement.style.display = 'block';
                    return;
                }

                localStorage.setItem('accessToken', result.accessToken);
                localStorage.setItem('refreshToken', result.refreshToken);
                localStorage.setItem('userInfo', JSON.stringify({
                    id: result.id,
                    email: result.email,
                    name: result.name,
                    lastName: result.lastName,

                }));

                this.openNewRoute('/');
            } catch (error) {
                this.commonErrorElement.style.display = 'block';
            }
        }
    }
}


// export class SignUp {
//     constructor(openNewRoute) {
//         this.openNewRoute = openNewRoute;
//
//         this.nameElement = document.getElementById('name');
//         this.lastNameElement = document.getElementById('last-name');
//         this.emailElement = document.getElementById('email');
//         this.passwordElement = document.getElementById('password');
//         this.passwordRepeatElement = document.getElementById('password-repeat');
//         this.commonErrorElement = document.getElementById('common-error');
//
//         this.nameErrorElement = document.getElementById('name-error');
//         this.lastNameErrorElement = document.getElementById('last-name-error');
//         this.emailErrorElement = document.getElementById('email-error');
//         this.passwordErrorElement = document.getElementById('password-error');
//         this.passwordRepeatErrorElement = document.getElementById('password-repeat-error');
//
//         document.getElementById('process-button').addEventListener('click', this.signUp.bind(this));
//     }
//
//     validateForm() {
//         let isValid = true;
//         this.commonErrorElement.style.display = 'none';
//
//         // Валидация имени
//         if (this.nameElement.value.trim() === '') {
//             this.nameErrorElement.style.display = 'block';
//             this.nameElement.classList.add('is-invalid');
//             isValid = false;
//         } else {
//             this.nameErrorElement.style.display = 'none';
//             this.nameElement.classList.remove('is-invalid');
//         }
//
//         // Валидация фамилии
//         if (this.lastNameElement.value.trim() === '') {
//             this.lastNameErrorElement.style.display = 'block';
//             this.lastNameElement.classList.add('is-invalid');
//             isValid = false;
//         } else {
//             this.lastNameErrorElement.style.display = 'none';
//             this.lastNameElement.classList.remove('is-invalid');
//         }
//
//         // Валидация email
//         const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
//         if (!emailRegex.test(this.emailElement.value)) {
//             this.emailErrorElement.style.display = 'block';
//             this.emailElement.classList.add('is-invalid');
//             isValid = false;
//         } else {
//             this.emailErrorElement.style.display = 'none';
//             this.emailElement.classList.remove('is-invalid');
//         }
//
//         // Валидация пароля
//         const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
//         if (!passwordRegex.test(this.passwordElement.value)) {
//             this.passwordErrorElement.style.display = 'block';
//             this.passwordElement.classList.add('is-invalid');
//             isValid = false;
//         } else {
//             this.passwordErrorElement.style.display = 'none';
//             this.passwordElement.classList.remove('is-invalid');
//         }
//
//         // Валидация подтверждения пароля
//         if (this.passwordRepeatElement.value !== this.passwordElement.value) {
//             this.passwordRepeatErrorElement.style.display = 'block';
//             this.passwordRepeatElement.classList.add('is-invalid');
//             isValid = false;
//         } else {
//             this.passwordRepeatErrorElement.style.display = 'none';
//             this.passwordRepeatElement.classList.remove('is-invalid');
//         }
//
//         return isValid;
//     }
//
//     async signUp() {
//         this.commonErrorElement.style.display = 'none';
//
//         if (this.validateForm()) {
//             try {
//                 const response = await fetch('http://localhost:3000/api/signup', {
//                     method: 'POST',
//                     headers: {
//                         'Content-type': 'application/json',
//                         'Accept': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         name: this.nameElement.value,
//                         lastName: this.lastNameElement.value,
//                         email: this.emailElement.value,
//                         password: this.passwordElement.value,
//                     })
//                 });
//
//                 const result = await response.json();
//
//                 if (result.error || !result.accessToken || !result.refreshToken || !result.id || !result.name) {
//                     this.commonErrorElement.style.display = 'block';
//                     return;
//                 }
//
//                 localStorage.setItem('accessToken', result.accessToken);
//                 localStorage.setItem('refreshToken', result.refreshToken);
//                 localStorage.setItem('user', JSON.stringify({name: result.name, lastName: result.lastName, id: result.id}));
//
//                 this.openNewRoute('/');
//             } catch (error) {
//                 this.commonErrorElement.style.display = 'block';
//             }
//         }
//     }
// }
// export class SignUp {
//     constructor(openNewRoute) {
//         this.openNewRoute = openNewRoute;
//
//         this.nameElement = document.getElementById('name');
//         this.lastNameElement = document.getElementById('last-name');
//         this.emailElement = document.getElementById('email');
//         this.passwordElement = document.getElementById('password');
//         this.passwordRepeatElement = document.getElementById('password-repeat');
//         this.commonErrorElement = document.getElementById('common-error');
//         this.isInvalidElement = document.getElementById('is-invalid');
//
//         document.getElementById('process-button').addEventListener('click', this.signUp.bind(this));
//     }
//     validateForm() {
//         let isValid = true;
//         this.isInvalidElement.style.display = 'none';
//
//         if (this.nameElement.value) {
//             this.nameElement.classList.remove('is-invalid');
//         } else {
//             this.nameElement.classList.add('is-invalid');
//             isValid = false;
//         }
//         if (this.lastNameElement.value) {
//             this.lastNameElement.classList.remove('is-invalid');
//         } else {
//             this.lastNameElement.classList.add('is-invalid');
//             isValid = false;
//         }
//
//         if (this.emailElement.value && this.emailElement.value.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)) {
//             this.emailElement.classList.remove('is-invalid');
//         } else {
//             this.emailElement.classList.add('is-invalid');
//             isValid = false;
//         }
//         if (this.passwordElement.value && this.passwordElement.value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9-zA-Z]{8,}$/)) {
//             this.passwordElement.classList.remove('is-invalid');
//         } else {
//             this.passwordElement.classList.add('is-invalid');
//             isValid = false;
//         }
//         if (this.passwordRepeatElement.value && this.passwordRepeatElement.value === this.passwordElement.value) {
//             this.passwordRepeatElement.classList.remove('is-invalid');
//         } else {
//             this.passwordRepeatElement.classList.add('is-invalid');
//             isValid = false;
//         }
//         return isValid;
//     }
//     async signUp() {
//         this.commonErrorElement.style.display = 'none';
//         if (this.validateForm()) {
//
//             const response = await fetch('http://localhost:3000/api/signup', {
//                 method: 'POST',
//                 headers: {
//                     'Content-type': 'application/json',
//                     'Accept': 'application/json',
//                 },
//                 body: JSON.stringify( {
//                     name: this.nameElement.value,
//                     lastName: this.lastNameElement.value,
//                     email: this.emailElement.value,
//                     password: this.passwordElement.value,
//                 })
//             });
//
//             const result = await response.json();
//
//             if (result.error || !result.accessToken || !result.refreshToken || !result.id || !result.name) {
//                 this.commonErrorElement.style.display = 'block';
//                 return;
//             }
//
//             localStorage.setItem('accessToken', result.accessToken);
//             localStorage.setItem('refreshToken', result.refreshToken);
//             localStorage.setItem('userInfo', JSON.stringify({id: result.id, name: result.name}));
//
//             this.openNewRoute('/');
//         }
//     }
// }