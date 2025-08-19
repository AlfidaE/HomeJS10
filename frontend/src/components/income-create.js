import {CustomHttp} from "../utils/custom-http";
import config from "../../config/config";

export class IncomeCreate {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.initElements();
        this.initEvents();
    }
    initElements() {
        this.inputElement = document.querySelector('.input-income-create .form-control');
        this.createButton = document.getElementById('income-create-btn-edit');
        this.cancelButton = document.getElementById('income-create-btn-remove');

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
            this.openNewRoute('/income');

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
            const response = await CustomHttp.request(`${config.host}/categories/income`,'POST',
                {
                    title: this.inputElement.value.trim()
                }
            );
            if (response && typeof response.id === 'number' && response.title) {
                this.updateLocalCategories(response);
                this.openNewRoute('/income');
            } else {
                throw new Error('упс, ошибка');
            }
        } catch (error) {
            this.showError(error.message || 'Ошибка сервера при создании категории');
        }
    }
    updateLocalCategories(newCategory) {
        try {
            const categories = JSON.parse(localStorage.getItem('incomeCategories')) || [];
            categories.push(newCategory);
            localStorage.setItem('incomeCategories', JSON.stringify(categories));
        } catch (e) {
            console.warn('Не удалось обновить localStorage', e);
        }
    }

}