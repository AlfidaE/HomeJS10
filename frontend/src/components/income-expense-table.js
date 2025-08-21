import {CustomHttp} from "../utils/custom-http.js";
import config from "../../config/config.js";
import flatpickr from "flatpickr";
import {Russian} from "flatpickr/dist/l10n/ru";

export class IncomeExpenseTable {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.operations = [];
        this.recordsElement = document.getElementById('records');
        this.popup = document.querySelector('.popup-income-expense-table');
        this.currentOperationId = null;
        this.activeFilter = 'today';
        this.startDate = null;
        this.endDate = null;
        this.startDatePicker = null;
        this.endDatePicker = null;

        this.init();
        this.initDate();
    }

    async init() {
        await this.loadOperations('today'); // Загружаем с фильтром "Сегодня" по умолчанию
        this.setupEvents();
        this.setActiveFilter('today'); // Устанавливаем активный фильтр
    }

    initDate() {
        const startDateElem = document.getElementById("startDate");
        const startDateLink = document.getElementById("startDateLink");
        const endDateElem = document.getElementById("endDate");
        const endDateLink = document.getElementById("endDateLink");
        const dateRangeSelector = document.querySelector('.date-range-selector');

        if (!startDateElem || !startDateLink || !endDateElem || !endDateLink || !dateRangeSelector) {
            console.error('Date elements not found');
            return;
        }

        this.startDatePicker = flatpickr(startDateElem, {
            locale: Russian,
            dateFormat: "Y-m-d",
            onChange: (selectedDates, dateStr) => {
                startDateLink.textContent = this.formatDisplayDate(dateStr);
                this.startDate = dateStr;
                if (this.activeFilter === 'interval' && this.startDate && this.endDate) {
                    this.loadOperations('interval', this.startDate, this.endDate);
                }
            }
        });

        this.endDatePicker = flatpickr(endDateElem, {
            locale: Russian,
            dateFormat: "Y-m-d",
            onChange: (selectedDates, dateStr) => {
                endDateLink.textContent = this.formatDisplayDate(dateStr);
                this.endDate = dateStr;
                if (this.activeFilter === 'interval' && this.startDate && this.endDate) {
                    this.loadOperations('interval', this.startDate, this.endDate);
                }
            }
        });

        startDateLink.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startDatePicker.open();
        });

        endDateLink.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.endDatePicker.open();
        });

        dateRangeSelector.style.display = 'none';
    }

    // Метод для загрузки операций с фильтрацией
    async loadOperations(period = null, dateFrom = null, dateTo = null) {
        try {
            let url = config.host + '/operations';
            const params = new URLSearchParams();

            // Всегда передаем period, даже для 'all'
            if (period) {
                params.append('period', period);
            }

            if (dateFrom) {
                params.append('dateFrom', dateFrom);
            }

            if (dateTo) {
                params.append('dateTo', dateTo);
            }

            if (params.toString()) {
                url += '?' + params.toString();
            }

            console.log('Loading operations from:', url); // Для отладки

            const response = await CustomHttp.request(url);

            if (response && Array.isArray(response)) {
                this.operations = response;
                // Сортируем операции по дате (новые сверху)
                this.operations.sort((a, b) => new Date(b.date) - new Date(a.date));
                this.showRecords(this.operations);
            } else {
                console.error('Неверный формат ответа:', response);
            }
        } catch (error) {
            console.error('Ошибка при загрузке операций:', error);
        }
    }

    // Метод для установки активного фильтра
    setActiveFilter(filterId) {
        // Убираем активный класс со всех кнопок
        const buttons = document.querySelectorAll('.btn-choice-date');
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Добавляем активный класс выбранной кнопке
        const activeButton = document.getElementById(filterId);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        this.activeFilter = filterId;

        // Показываем/скрываем блок выбора интервала дат
        const dateRangeSelector = document.querySelector('.date-range-selector');
        if (dateRangeSelector) {
            dateRangeSelector.style.display = filterId === 'interval' ? 'block' : 'none';
        }
    }

    // Метод для применения фильтра
    applyFilter(filterId) {
        this.setActiveFilter(filterId);

        let period = filterId;
        let dateFrom = null;
        let dateTo = null;

        // Для всех фильтров, включая 'all', передаем period
        // Сервер сам решает как обрабатывать каждый период
        if (filterId !== 'interval') {
            const today = new Date();

            switch (filterId) {
                case 'today':
                    dateFrom = today.toISOString().split('T')[0];
                    dateTo = dateFrom;
                    break;
                case 'week':
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - today.getDay());
                    dateFrom = weekStart.toISOString().split('T')[0];

                    const weekEnd = new Date(today);
                    weekEnd.setDate(today.getDate() + (6 - today.getDay()));
                    dateTo = weekEnd.toISOString().split('T')[0];
                    break;
                case 'month':
                    dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                    dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
                    break;
                case 'year':
                    dateFrom = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                    dateTo = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
                    break;
                case 'all':
                    // Для 'all' сервер сам установит правильные даты (вычитает 1 год)
                    // Не нужно передавать dateFrom и dateTo
                    dateFrom = null;
                    dateTo = null;
                    break;
            }
        }

        // Загружаем операции с выбранным фильтром
        this.loadOperations(period, dateFrom, dateTo);
    }

    // Форматирование даты для отображения
    formatDisplayDate(dateString) {
        if (!dateString) return 'Дата';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    showRecords(operations) {
        if (!this.recordsElement) return;

        this.recordsElement.innerHTML = '';

        if (operations.length === 0) {
            const trElement = document.createElement('tr');
            trElement.innerHTML = `
                <td colspan="7" style="text-align: center; padding: 20px;">
                    Нет операций для отображения
                </td>
            `;
            this.recordsElement.appendChild(trElement);
            return;
        }

        operations.forEach((operation, index) => {
            const trElement = document.createElement('tr');

            // № операции (порядковый номер)
            trElement.insertCell().innerText = index + 1;

            // Тип
            const typeCell = trElement.insertCell();
            typeCell.innerText = operation.type === 'income' ? 'доход' : 'расход';
            typeCell.className = operation.type === 'income' ? 'text-success' : 'text-danger';

            // Категория
            trElement.insertCell().innerText = operation.category || 'Без категории';

            // Сумма
            const amountCell = trElement.insertCell();
            amountCell.innerText = this.formatAmount(operation.amount);

            // Дата
            trElement.insertCell().innerText = this.formatDate(operation.date);

            // Комментарий
            trElement.insertCell().innerText = operation.comment || '-';

            // Действия
            const actionsCell = trElement.insertCell();
            actionsCell.innerHTML = `
                <div class="operation-actions">
                    <button class="btn-delete-operation" data-id="${operation.id}">
                        <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z" fill="black"/>
                            <path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z" fill="black"/>
                            <path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z" fill="black"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z" fill="black"/>
                        </svg>
                    </button>
                    <button class="btn-edit-operation" data-id="${operation.id}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z" fill="black"/>
                        </svg>
                    </button>                    
                </div>
            `;

            this.recordsElement.appendChild(trElement);
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    formatAmount(amount) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    setupEvents() {
        // Обработчики для кнопок создания дохода/расхода
        document.getElementById('income-expense-table-btn-edit')?.addEventListener('click', () => {
            this.openNewRoute('/income-expense-create?type=income');
        });

        document.getElementById('income-expense-table-btn-remove')?.addEventListener('click', () => {
            this.openNewRoute('/income-expense-create?type=expense');
        });

        // Обработчики для кнопок фильтров по датам
        const filterButtons = ['today', 'week', 'month', 'year', 'all', 'interval'];
        filterButtons.forEach(filterId => {
            document.getElementById(filterId)?.addEventListener('click', () => {
                this.applyFilter(filterId);
            });
        });

        // Обработчики для кнопок удаления и редактирования операций
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete-operation')) {
                const button = e.target.closest('.btn-delete-operation');
                this.showPopup(button.dataset.id);
            }

            if (e.target.closest('.btn-edit-operation')) {
                const button = e.target.closest('.btn-edit-operation');
                this.editOperation(button.dataset.id);
            }
        });

        // Обработчики для кнопок попапа
        document.querySelector('.popup-btn-income-expense-table-yes')?.addEventListener('click', () => {
            this.deleteOperation();
        });

        document.querySelector('.popup-btn-income-expense-table-no')?.addEventListener('click', () => {
            this.hidePopup();
        });

        // Закрытие попапа при клике вне его области
        document.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.hidePopup();
            }
        });
    }

    showPopup(operationId) {
        this.currentOperationId = operationId;
        if (this.popup) {
            this.popup.style.display = 'block';
        }
    }

    hidePopup() {
        this.currentOperationId = null;
        if (this.popup) {
            this.popup.style.display = 'none';
        }
    }

    async deleteOperation() {
        if (!this.currentOperationId) return;

        try {
            const response = await CustomHttp.request(
                `${config.host}/operations/${this.currentOperationId}`,
                'DELETE'
            );

            if (response && !response.error) {
                // После удаления перезагружаем операции с текущим фильтром
                this.applyFilter(this.activeFilter);
            } else {
                console.error('Ошибка при удалении:', response.error);
                alert('Не удалось удалить операцию');
            }
        } catch (error) {
            console.error('Не удалось удалить операцию:', error);
            alert('Ошибка при удалении операции');
        } finally {
            this.hidePopup();
        }
    }

    editOperation(operationId) {
        const operation = this.operations.find(op => op.id === parseInt(operationId));
        if (operation) {
            this.openNewRoute(`/income-expense-edit?id=${operationId}&type=${operation.type}`);
        }
    }
}