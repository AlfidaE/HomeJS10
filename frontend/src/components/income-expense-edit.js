import {CustomHttp} from "../utils/custom-http.js";
import config from "../../config/config.js";

export class IncomeExpenseEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.urlParams = new URLSearchParams(window.location.search);
        this.operationId = this.urlParams.get('id');
        this.operationType = this.urlParams.get('type');
        this.categories = [];
        this.operation = null;

        this.initElements();
        this.initEvents();
        this.loadOperationData();
    }

    initElements() {
        this.typeSelect = document.querySelector('.income-expense-edit-type');
        this.categorySelect = document.querySelector('.income-expense-edit-category');
        this.amountInput = document.querySelector('input[type="number"]');
        this.dateInput = document.querySelector('input[type="date"]');
        this.commentInput = document.querySelector('input[type="text"]');
        this.saveButton = document.getElementById('income-expense-edit-btn-edit');
        this.cancelButton = document.getElementById('income-expense-edit-btn-remove');

        this.errorElement = document.createElement('div');
        this.errorElement.className = 'error-message';
        this.errorElement.style.display = 'none';
        this.errorElement.style.color = '#dc3545';
        this.errorElement.style.marginTop = '10px';
        this.errorElement.style.marginBottom = '10px';
        this.errorElement.style.fontSize = '14px';
        this.errorElement.style.textAlign = 'left';

        const buttonsContainer = document.querySelector('.btn-income-expense-edit');
        if (buttonsContainer) {
            buttonsContainer.parentNode.insertBefore(this.errorElement, buttonsContainer.nextSibling);
        }
    }

    async loadOperationData() {
        try {
            // Загружаем данные операции
            const operationResponse = await CustomHttp.request(`${config.host}/operations/${this.operationId}`);

            if (operationResponse && operationResponse.id) {
                this.operation = operationResponse;
                this.populateForm();
            } else {
                throw new Error('Не удалось загрузить данные операции');
            }

            // Загружаем категории
            await this.loadCategories();
        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            this.showError('Не удалось загрузить данные для редактирования');
        }
    }

    // Определение endpoint: Выбирает правильный URL в зависимости от типа операции
    async loadCategories() {
        try {
            const endpoint = this.operationType === 'income' ? '/categories/income' : '/categories/expense';
            const response = await CustomHttp.request(config.host + endpoint);

            // Сохранение категорий: Если ответ - массив, сохраняет его и обновляет select
            if (response && Array.isArray(response)) {
                this.categories = response;
                this.populateCategories();
            }
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
        }
    }

    // Заполнение формы: Проверяет, есть ли данные операции
    populateForm() {
        if (!this.operation) return;

        // Установка типа операции: Находит и выбирает option с нужным значением, блокирует выбор
        // Заполняем поля формы данными операции
        if (this.typeSelect && this.operationType) {
            Array.from(this.typeSelect.options).forEach(option => {
                if (option.value === this.operationType) {
                    option.selected = true;
                }
            });
            // Блокируем выбор типа
            this.typeSelect.disabled = true;
        }

        // Заполнение полей: Устанавливает значения из данных операции
        if (this.amountInput) {
            this.amountInput.value = this.operation.amount;
        }

        if (this.dateInput) {
            this.dateInput.value = this.operation.date;
        }

        if (this.commentInput) {
            this.commentInput.value = this.operation.comment || '';
        }
    }
        // Очистка и добавление заглушки: Удаляет старые options, добавляет placeholder
    populateCategories() {
        if (!this.categorySelect || !this.operation) return;

        // Создание options: Для каждой категории создает element option
        // Очищаем select категорий
        this.categorySelect.innerHTML = '<option value="" disabled selected>Категория...</option>';

        // Добавляем категории из бэкенда
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.title;

            // Выбираем категорию операции
            if (this.operation.category_id === category.id || this.operation.category === category.title) {
                option.selected = true;
            }
        // Добавление option в select
            this.categorySelect.appendChild(option);
        });

        // Если категория не найдена в списке, выбираем первое значение
        if (!this.categorySelect.value && this.categories.length > 0) {
            this.categorySelect.value = this.categories[0].id;
        }
    }

    initEvents() {
        // Кнопка сохранить
        this.saveButton.addEventListener('click', () => this.updateOperation());

        // Кнопка отмена
        this.cancelButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof this.openNewRoute === 'function') {
                this.openNewRoute('/income-expense-table');
            } else {
                this.openNewRoute('/income-expense-table');
            }
        });

        // Скрытие ошибок: При вводе в любом поле скрывает сообщения об ошибках
        // Валидация при вводе
        [this.amountInput, this.dateInput, this.categorySelect].forEach(element => {
            if (element) {
                element.addEventListener('input', () => this.hideError());
            }
        });
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
        const fields = [this.amountInput, this.dateInput, this.categorySelect].filter(Boolean);
        fields.forEach(field => {
            if (field && !field.value.trim()) {
                field.style.borderColor = '#dc3545';
            }
        });
    }

    clearHighlightedFields() {
        const fields = [this.amountInput, this.dateInput, this.categorySelect].filter(Boolean);
        fields.forEach(field => {
            if (field) {
                field.style.borderColor = '#ced4da';
            }
        });
    }

    validateForm() {
        const errors = [];

        if (!this.amountInput || !this.amountInput.value || parseFloat(this.amountInput.value) <= 0) {
            errors.push('Введите корректную сумму');
        }

        if (!this.dateInput || !this.dateInput.value) {
            errors.push('Выберите дату');
        }

        if (!this.categorySelect || !this.categorySelect.value) {
            errors.push('Выберите категорию');
        }

        if (errors.length > 0) {
            this.showError(errors.join(', '));
            return false;
        }

        return true;
    }

    async updateOperation() {
        if (!this.validateForm()) return;

        try {
            const selectedCategory = this.categories.find(cat =>
                cat.id.toString() === this.categorySelect.value
            );

            const operationData = {
                type: this.operationType,
                amount: parseFloat(this.amountInput.value),
                date: this.dateInput.value,
                comment: this.commentInput ? this.commentInput.value.trim() : '',
                category: selectedCategory ? selectedCategory.title : '',
                category_id: parseInt(this.categorySelect.value)
            };

            console.log('Отправляемые данные для обновления:', operationData);

            const response = await CustomHttp.request(
                `${config.host}/operations/${this.operationId}`,
                'PUT',
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
                throw new Error('Не удалось обновить операцию');
            }
        } catch (error) {
            console.error('Ошибка при обновлении операции:', error);
            this.showError(error.message || 'Ошибка сервера при обновлении операции');
        }
    }
}