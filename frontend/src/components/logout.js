import {AuthUtils} from "../utils/auth-utils.js";


export class Logout {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        if (!localStorage.getItem('accessToken') || !localStorage.getItem('refreshToken')) {
            return this.openNewRoute('/login');
        }

       this.logout().then;
    }

    async logout() {

            const response = await fetch('http://localhost:3000/api/logout', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: localStorage.getItem('refreshToken')
                })
            });

            const result = await response.json();
        console.log(result);

        AuthUtils.removeAuthInfo();

            this.openNewRoute('/login');

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