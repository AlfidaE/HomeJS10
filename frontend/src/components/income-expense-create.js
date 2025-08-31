import {CustomHttp} from "../utils/custom-http.js";
import config from "../../config/config.js";

export class IncomeExpenseCreate {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.urlParams = new URLSearchParams(window.location.search);
        this.operationType = this.urlParams.get('type') || 'income';
        this.categories = [];

        this.createOperation = this.createOperation.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.hideError = this.hideError.bind(this);
        this.handleInputFocus = this.handleInputFocus.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);

        this.initElements();
        this.initEvents();
        this.loadCategories();
        this.initInputStyles(); // Инициализация стилей
    }

    initElements() {
        this.typeSelect = document.querySelector('.income-expense-create-type');
        this.categorySelect = document.querySelector('.income-expense-create-category');
        this.amountInput = document.querySelector('input[type="number"]');
        this.dateInput = document.querySelector('input[type="date"]');
        this.commentInput = document.querySelector('input[type="text"]');
        this.createButton = document.getElementById('income-expense-create-btn-edit');
        this.cancelButton = document.getElementById('income-expense-create-btn-remove');

        this.errorElement = document.createElement('div');
        this.errorElement.className = 'error-message';
        this.errorElement.style.display = 'none';
        this.errorElement.style.color = '#dc3545';
        this.errorElement.style.marginTop = '10px';
        this.errorElement.style.marginBottom = '10px';
        this.errorElement.style.fontSize = '14px';
        this.errorElement.style.textAlign = 'left';

        const buttonsContainer = document.querySelector('.btn-income-expense-create');
        if (buttonsContainer) {
            buttonsContainer.parentNode.insertBefore(this.errorElement, buttonsContainer.nextSibling);
        }

        if (this.dateInput) {
            this.dateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    // Новый метод для инициализации стилей input
    initInputStyles() {
        const inputs = [this.amountInput, this.dateInput, this.commentInput].filter(Boolean);
        const selects = [this.typeSelect, this.categorySelect].filter(Boolean);

        // Устанавливаем начальный цвет для placeholder
        inputs.forEach(input => {
            if (input && !input.value) {
                input.style.color = '#6C757D'; // Серый цвет для placeholder
            }
        });

        selects.forEach(select => {
            if (select && !select.value) {
                select.style.color = '#6C757D'; // Серый цвет для placeholder
            }
        });
    }

    async loadCategories() {
        try {
            const endpoint = this.operationType === 'income' ? '/categories/income' : '/categories/expense';
            const response = await CustomHttp.request(config.host + endpoint);

            if (response && Array.isArray(response)) {
                this.categories = response;
                this.populateCategories();
                this.setOperationType();
            }
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
            this.showError('Не удалось загрузить категории');
        }
    }

    populateCategories() {
        if (!this.categorySelect) return;

        this.categorySelect.innerHTML = '<option value="" disabled selected>Категория...</option>';

        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.title;
            this.categorySelect.appendChild(option);
        });
    }

    setOperationType() {
        if (!this.typeSelect) return;

        Array.from(this.typeSelect.options).forEach(option => {
            if (option.value === this.operationType) {
                option.selected = true;
                this.typeSelect.style.color = '#000000'; // Черный цвет при выборе
            }
        });

        if (this.urlParams.has('type')) {
            this.typeSelect.disabled = true;
        }
    }

    initEvents() {
        if (!this.typeSelect || !this.createButton || !this.cancelButton) return;

        this.typeSelect.addEventListener('change', this.handleTypeChange);
        this.typeSelect.addEventListener('change', this.handleSelectChange);
        this.categorySelect.addEventListener('change', this.handleSelectChange);

        this.createButton.addEventListener('click', this.createOperation);
        this.cancelButton.addEventListener('click', this.handleCancel);

        // Обработчики для input
        const inputs = [this.amountInput, this.dateInput, this.commentInput].filter(Boolean);
        inputs.forEach(input => {
            input.addEventListener('focus', this.handleInputFocus);
            input.addEventListener('blur', this.handleInputBlur);
            input.addEventListener('input', this.handleInputChange);
        });

        const validationElements = [this.amountInput, this.dateInput, this.categorySelect].filter(Boolean);
        validationElements.forEach(element => {
            element.addEventListener('input', this.hideError);
        });
    }

    // Новые методы для обработки стилей
    handleInputFocus(e) {
        e.target.style.color = '#000000'; // Черный цвет при фокусе
    }

    handleInputBlur(e) {
        if (!e.target.value) {
            e.target.style.color = '#6C757D'; // Серый цвет если пусто
        } else {
            e.target.style.color = '#000000'; // Черный цвет если есть значение
        }
    }

    handleInputChange(e) {
        if (e.target.value) {
            e.target.style.color = '#000000'; // Черный цвет при вводе
        }
    }

    handleSelectChange(e) {
        if (e.target.value) {
            e.target.style.color = '#000000'; // Черный цвет при выборе
        } else {
            e.target.style.color = '#6C757D'; // Серый цвет если не выбрано
        }
    }

    handleTypeChange() {
        this.operationType = this.typeSelect.value;
        this.loadCategories();
    }

    handleCancel(e) {
        e.preventDefault();
        if (typeof this.openNewRoute === 'function') {
            this.openNewRoute('/income-expense-table');
        } else {
            window.location.href = '/income-expense-table';
        }
    }

    showError(message) {
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.style.display = 'block';
            this.highlightInvalidFields();
        }
    }

    hideError() {
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
            this.clearHighlightedFields();
        }
    }

    highlightInvalidFields() {
        const fields = [this.typeSelect, this.categorySelect, this.amountInput, this.dateInput].filter(Boolean);
        fields.forEach(field => {
            if (field && !field.value.trim()) {
                field.style.borderColor = '#dc3545';
            }
        });
    }

    clearHighlightedFields() {
        const fields = [this.typeSelect, this.categorySelect, this.amountInput, this.dateInput].filter(Boolean);
        fields.forEach(field => {
            if (field) {
                field.style.borderColor = '#ced4da';
            }
        });
    }

    validateForm() {
        const errors = [];

        if (!this.typeSelect || !this.typeSelect.value) {
            errors.push('Выберите тип операции');
        }

        if (!this.categorySelect || !this.categorySelect.value) {
            errors.push('Выберите категорию');
        }

        if (!this.amountInput || !this.amountInput.value || parseFloat(this.amountInput.value) <= 0) {
            errors.push('Введите корректную сумму');
        }

        if (!this.dateInput || !this.dateInput.value) {
            errors.push('Выберите дату');
        }

        if (errors.length > 0) {
            this.showError(errors.join(', '));
            return false;
        }

        return true;
    }

    async createOperation() {
        if (!this.validateForm()) return;

        try {
            const selectedCategory = this.categories.find(cat =>
                cat.id.toString() === this.categorySelect.value
            );

            const operationData = {
                type: this.typeSelect.value,
                amount: parseFloat(this.amountInput.value),
                date: this.dateInput.value,
                comment: this.commentInput ? this.commentInput.value.trim() : '',
                category: selectedCategory ? selectedCategory.title : '',
                category_id: parseInt(this.categorySelect.value)
            };

            console.log('Отправляемые данные:', operationData);

            const response = await CustomHttp.request(
                `${config.host}/operations`,
                'POST',
                operationData
            );

            console.log('Ответ сервера:', response);

            if (response && response.id) {
                if (typeof this.openNewRoute === 'function') {
                    this.openNewRoute('/income-expense-table');
                } else {
                    window.location.href = '/income-expense-table';
                }
            } else {
                throw new Error('Не удалось создать операцию: неверный ответ сервера');
            }
        } catch (error) {
            console.error('Полная ошибка при создании операции:', error);
            this.showError(this.getErrorMessage(error));
        }
    }

    getErrorMessage(error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            return 'Ошибка авторизации. Пожалуйста, войдите снова.';
        } else if (error.message.includes('404')) {
            return 'Сервер не найден. Проверьте подключение.';
        } else if (error.message.includes('500')) {
            return 'Ошибка сервера. Попробуйте позже.';
        } else if (error.message.includes('Network Error')) {
            return 'Ошибка сети. Проверьте интернет-соединение.';
        } else {
            return error.message || 'Неизвестная ошибка при создании операции';
        }
    }
}