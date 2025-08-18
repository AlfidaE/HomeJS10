import {CustomHttp} from "../utils/custom-http.js";
import config from "../../config/config.js";

export class IncomeEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.urlParams = new URLSearchParams(window.location.search);
        this.categoryId = this.urlParams.get('id');
        this.categoryName = this.urlParams.get('name');
        this.errorElement = document.getElementById('error-message-income-edit');

        this.init();
    }

    init() {
        this.errorElement.style.display = 'none';

        // Устанавливаем текущее название категории в поле ввода
        const inputElement = document.querySelector('.input-income-edit .form-control');
        if (inputElement && this.categoryName) {
            inputElement.value = this.categoryName;
        }

        this.setupEvents();
    }

    setupEvents() {
        // Кнопка "Сохранить"
        document.getElementById('card-income-edit-btn-keep').addEventListener('click', () => {
            this.saveCategory();
        });

        // Кнопка "Отмена"
        document.getElementById('card-income-edit-btn-remove').addEventListener('click', () => {
            this.openNewRoute = '/income';
        });
    }

    async saveCategory() {
        const inputElement = document.querySelector('.input-income-edit .form-control');
        const newName = inputElement.value.trim();

        // Валидация
        if (!newName) {
            this.showError('Название категории не может быть пустым');
            return;
        }


        try {
            const response = await CustomHttp.request(`${config.host}/categories/income/${this.categoryId}`,'PUT',
                {
                    title: newName
                }
            );

            if (response && response.id) {
                this.updateLocalCategories(newName);
                this.openNewRoute('/income');
            } else {
                throw new Error(response?.error || 'Не удалось сохранить изменения');
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            this.showError(error.message || 'Ошибка сервера при сохранении');
        }
    }

    updateLocalCategories(newName) {
        let categories = JSON.parse(localStorage.getItem('incomeCategories')) || [];

        categories = categories.map(category => {
            if (category.id.toString() === this.categoryName) {
                return {...category, title: newName};
            }
            return category;
        });
        localStorage.setItem('incomeCategories', JSON.stringify(categories));
    }

    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
        this.errorElement.style.color = '#dc3545';
        this.errorElement.style.marginTop = '10px';
    }
}