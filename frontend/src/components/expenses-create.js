import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";

export class ExpensesCreate {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.initElements();
        this.initEvents();
    }

    initElements() {
        this.inputElement = document.querySelector('.input-expenses-create .form-control');
        this.createButton = document.getElementById('expenses-create-btn-edit');
        this.cancelButton = document.getElementById('expenses-create-btn-remove');

        // Проверка существования элементов
        if (!this.inputElement || !this.createButton || !this.cancelButton) {
            console.error('Required elements not found');
            return;
        }

        this.errorElement = document.createElement('div');
        this.errorElement.className = 'error-message';
        this.errorElement.style.display = 'none';
        this.errorElement.style.color = '#dc3545';
        this.errorElement.style.marginTop = '10px';
        this.errorElement.style.marginBottom = '10px';
        this.errorElement.style.fontSize = '14px';
        this.errorElement.style.textAlign = 'left';
        this.inputElement.parentNode.appendChild(this.errorElement);
    }

    initEvents() {
        // кнопка создать
        this.createButton.addEventListener('click', () => this.createCategory());

        // кнопка отмена
        this.cancelButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.openNewRoute('/expenses');
        });

        // валидация при вводе
        this.inputElement.addEventListener('input', () => {
            if (this.inputElement.value.trim()) {
                this.hideError();
            }
        });
    }

    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
        this.inputElement.style.borderColor = '#dc3545';
    }

    hideError() {
        this.errorElement.style.display = 'none';
        this.inputElement.style.borderColor = '#ced4da';
    }

    validateInput() {
        const value = this.inputElement.value.trim();

        if (!value) {
            this.showError('Название категории не может быть пустым');
            return false;
        }

        return true;
    }

    async createCategory() {
        // валидация
        if (!this.validateInput()) return;

        try {
            const response = await CustomHttp.request(
                `${config.host}/categories/expense`,
                'POST',
                {
                    title: this.inputElement.value.trim()
                }
            );

            if (response && typeof response.id === 'number' && response.title) {
                this.openNewRoute('/expenses');
            } else {
                throw new Error('Ошибка при создании категории');
            }
        } catch (error) {
            this.showError(error.message || 'Ошибка сервера при создании категории');
        }
    }

}