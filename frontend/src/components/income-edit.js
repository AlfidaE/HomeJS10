import {CustomHttp} from "../utils/custom-http.js";
import config from "../../config/config.js";

export class IncomeEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.urlParams = new URLSearchParams(window.location.search);
        this.categoryId = this.urlParams.get('id');
        this.categoryName = this.urlParams.get('name');
        this.errorElement = document.getElementById('error-message-income-edit');

        // Проверяем существование элемента ошибки
        if (!this.errorElement) {
            console.error('Error element not found, creating one...');
            this.createErrorElement();
        }

        this.init();
    }

    createErrorElement() {
        // Создаем элемент ошибки, если он не существует
        this.errorElement = document.createElement('div');
        this.errorElement.id = 'error-message-income-edit';
        this.errorElement.style.display = 'none';
        this.errorElement.style.color = '#dc3545';
        this.errorElement.style.marginTop = '10px';

        // Добавляем элемент в DOM (например, после кнопок)
        const buttonsContainer = document.querySelector('.btn-income-edit');
        if (buttonsContainer) {
            buttonsContainer.parentNode.insertBefore(this.errorElement, buttonsContainer.nextSibling);
        } else {
            // Если контейнер кнопок не найден, добавляем в конец body
            document.body.appendChild(this.errorElement);
        }
    }

    init() {
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }

        // Устанавливаем текущее название категории в поле ввода
        const inputElement = document.querySelector('.input-income-edit .form-control');
        if (inputElement && this.categoryName) {
            inputElement.value = decodeURIComponent(this.categoryName);
        }

        this.setupEvents();
    }

    setupEvents() {
        // Кнопка "Сохранить"
        const saveButton = document.getElementById('card-income-edit-btn-keep');
        // Кнопка "Отмена"
        const cancelButton = document.getElementById('card-income-edit-btn-remove');

        // Проверяем существование кнопок
        if (!saveButton || !cancelButton) {
            console.error('Buttons not found');
            return;
        }

        saveButton.addEventListener('click', () => {
            this.saveCategory();
        });

        cancelButton.addEventListener('click', () => {
            this.openNewRoute('/income');
        });
    }

    async saveCategory() {
        const inputElement = document.querySelector('.input-income-edit .form-control');
        if (!inputElement) {
            console.error('Input element not found');
            return;
        }

        const newName = inputElement.value.trim();

        // Валидация
        if (!newName) {
            this.showError('Название категории не может быть пустым');
            return;
        }

        try {
            const response = await CustomHttp.request(
                `${config.host}/categories/income/${this.categoryId}`,
                'PUT',
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
        try {
            let categories = JSON.parse(localStorage.getItem('incomeCategories')) || [];
            categories = categories.map(category => {
                if (category.id.toString() === this.categoryId) {
                    return {...category, title: newName};
                }
                return category;
            });
            localStorage.setItem('incomeCategories', JSON.stringify(categories));
        } catch (e) {
            console.warn('Не удалось обновить localStorage', e);
        }
    }

    showError(message) {
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.style.display = 'block';
            this.errorElement.style.color = '#dc3545';
            this.errorElement.style.textAlign = 'left';
        } else {
            console.error('Error element not available:', message);
        }
    }
}