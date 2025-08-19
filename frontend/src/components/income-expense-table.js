// import flatpickr from "flatpickr";
// import {Russian} from "flatpickr/dist/l10n/ru";
//
//
// export class IncomeExpenseTable {
//     constructor() {
//         this.initDateTable();
//     }
//
//     initDateTable() {
//         const startDatePicker = flatpickr("#startDate", {
//             locale: "ru",
//             dateFormat: "d.m.Y",
//             onChange: function(selectedDates, dateStr) {
//                 document.getElementById("startDateLink").textContent = dateStr;
//             }
//         });
//
//         const endDatePicker = flatpickr("#endDate", {
//             locale: "ru",
//             dateFormat: "d.m.Y",
//             onChange: function(selectedDates, dateStr) {
//                 document.getElementById("endDateLink").textContent = dateStr;
//             }
//         });
//
// // Открываем календарь при клике на ссылку "Дата"
//         document.getElementById("startDateLink").addEventListener("click", function(e) {
//             e.preventDefault();
//             e.stopPropagation();
//             startDatePicker.open();
//         });
//
//         document.getElementById("endDateLink").addEventListener("click", function(e) {
//             e.preventDefault();
//             e.stopPropagation();
//             endDatePicker.open();
//         });
//
// // Пример: Установка периода "Неделя" при клике на кнопку
//         document.getElementById("week").addEventListener("click", function() {
//             const endDate = new Date();
//             const startDate = new Date();
//             startDate.setDate(endDate.getDate() - 7);
//
//             startDatePicker.setDate(startDate);
//             endDatePicker.setDate(endDate);
//         });
//     }
//
// }
// flatpickr('#startDate', {
//     "locale": Russian // locale for this instance only
// });

import {CustomHttp} from "../utils/custom-http.js";
import config from "../../config/config.js";
import {AuthUtils} from "../utils/auth-utils.js";

export class IncomeExpenseTable {
    constructor() {
        this.records = [];
        this.filter = 'today';
        this.startDate = null;
        this.endDate = null;
        this.currentOperationId = null;

        this.init();
    }

    async init() {
        await this.loadData();
        this.initDateRangePicker();
        this.setupEvents();
        this.renderTable();
    }

    async loadData() {
        try {
            const response = await CustomHttp.request(`${config.host}/operations`);
            if (response && Array.isArray(response)) {
                this.records = response;
                this.applyFilters();
            }
        } catch (error) {
            console.error('Ошибка загрузки операций:', error);
        }
    }

    initDateRangePicker() {
        // Инициализация flatpickr для выбора дат
        flatpickr("#startDate", {
            dateFormat: "Y-m-d",
            onChange: (selectedDates) => {
                this.startDate = selectedDates[0];
                this.filter = 'interval';
                this.applyFilters();
            }
        });

        flatpickr("#endDate", {
            dateFormat: "Y-m-d",
            onChange: (selectedDates) => {
                this.endDate = selectedDates[0];
                this.filter = 'interval';
                this.applyFilters();
            }
        });
    }

    setupEvents() {
        // Фильтры по датам
        document.querySelectorAll('.btn-choice-date').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filter = btn.id;
                this.applyFilters();
                this.updateActiveFilter();
            });
        });

        // Обработчики для кнопок в таблице
        document.getElementById('records').addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-operation');
            const deleteBtn = e.target.closest('.delete-operation');

            if (editBtn) {
                const id = editBtn.dataset.id;
                // возможно переделать на this.openNewRoute(`/income-expense-edit?id=${id}`);
                window.location.href = `/income-expense-edit?id=${id}`;
            }

            if (deleteBtn) {
                this.currentOperationId = deleteBtn.dataset.id;
                document.querySelector('.popup-income-expense-table').style.display = 'block';
            }
        });

        // Попап удаления
        document.querySelector('.popup-btn-income-expense-table-yes').addEventListener('click', async () => {
            await this.deleteOperation();
            document.querySelector('.popup-income-expense-table').style.display = 'none';
        });

        document.querySelector('.popup-btn-income-expense-table-no').addEventListener('click', () => {
            document.querySelector('.popup-income-expense-table').style.display = 'none';
        });
    }

    applyFilters() {
        const now = new Date();
        let filteredRecords = [...this.records];

        switch (this.filter) {
            case 'today':
                filteredRecords = filteredRecords.filter(record => {
                    const recordDate = new Date(record.date);
                    return recordDate.toDateString() === now.toDateString();
                });
                break;

            case 'week':
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                filteredRecords = filteredRecords.filter(record => {
                    const recordDate = new Date(record.date);
                    return recordDate >= weekAgo && recordDate <= now;
                });
                break;

            case 'month':
                const monthAgo = new Date();
                monthAgo.setMonth(now.getMonth() - 1);
                filteredRecords = filteredRecords.filter(record => {
                    const recordDate = new Date(record.date);
                    return recordDate >= monthAgo && recordDate <= now;
                });
                break;

            case 'year':
                const yearAgo = new Date();
                yearAgo.setFullYear(now.getFullYear() - 1);
                filteredRecords = filteredRecords.filter(record => {
                    const recordDate = new Date(record.date);
                    return recordDate >= yearAgo && recordDate <= now;
                });
                break;

            case 'interval':
                if (this.startDate && this.endDate) {
                    filteredRecords = filteredRecords.filter(record => {
                        const recordDate = new Date(record.date);
                        return recordDate >= this.startDate && recordDate <= this.endDate;
                    });
                }
                break;

            // 'all' - без фильтрации
        }

        this.filteredRecords = filteredRecords;
        this.renderTable();
    }

    updateActiveFilter() {
        document.querySelectorAll('.btn-choice-date').forEach(btn => {
            btn.classList.toggle('active', btn.id === this.filter);
        });
    }

    renderTable() {
        const tbody = document.getElementById('records');
        tbody.innerHTML = '';

        this.filteredRecords.forEach((record, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${record.type === 'income' ? 'Доход' : 'Расход'}</td>
                <td>${record.category}</td>
                <td>${record.amount} ₽</td>
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${record.comment || ''}</td>
                <td class="actions">
                    <button class="edit-operation" data-id="${record.id}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.1465 0.146447C12.3417 -0.0488155 12.6583 -0.0488155 12.8536 0.146447L15.8536 3.14645C16.0488 3.34171 16.0488 3.65829 15.8536 3.85355L5.85357 13.8536C5.80569 13.9014 5.74858 13.9391 5.68571 13.9642L0.68571 15.9642C0.500001 16.0385 0.287892 15.995 0.146461 15.8536C0.00502989 15.7121 -0.0385071 15.5 0.0357762 15.3143L2.03578 10.3143C2.06092 10.2514 2.09858 10.1943 2.14646 10.1464L12.1465 0.146447ZM11.2071 2.5L13.5 4.79289L14.7929 3.5L12.5 1.20711L11.2071 2.5ZM12.7929 5.5L10.5 3.20711L4.00001 9.70711V10H4.50001C4.77616 10 5.00001 10.2239 5.00001 10.5V11H5.50001C5.77616 11 6.00001 11.2239 6.00001 11.5V12H6.29291L12.7929 5.5ZM3.03167 10.6755L2.92614 10.781L1.39754 14.6025L5.21903 13.0739L5.32456 12.9683C5.13496 12.8973 5.00001 12.7144 5.00001 12.5V12H4.50001C4.22387 12 4.00001 11.7761 4.00001 11.5V11H3.50001C3.28561 11 3.10272 10.865 3.03167 10.6755Z" fill="black"/>
                        </svg>
                    </button>
                    <button class="delete-operation" data-id="${record.id}">
                        <svg width="14" height="15" viewBox="0 0 14 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.5 5.5C4.77614 5.5 5 5.72386 5 6V12C5 12.2761 4.77614 12.5 4.5 12.5C4.22386 12.5 4 12.2761 4 12V6C4 5.72386 4.22386 5.5 4.5 5.5Z" fill="black"/>
                            <path d="M7 5.5C7.27614 5.5 7.5 5.72386 7.5 6V12C7.5 12.2761 7.27614 12.5 7 12.5C6.72386 12.5 6.5 12.2761 6.5 12V6C6.5 5.72386 6.72386 5.5 7 5.5Z" fill="black"/>
                            <path d="M10 6C10 5.72386 9.77614 5.5 9.5 5.5C9.22386 5.5 9 5.72386 9 6V12C9 12.2761 9.22386 12.5 9.5 12.5C9.77614 12.5 10 12.2761 10 12V6Z" fill="black"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.5 3C13.5 3.55228 13.0523 4 12.5 4H12V13C12 14.1046 11.1046 15 10 15H4C2.89543 15 2 14.1046 2 13V4H1.5C0.947715 4 0.5 3.55228 0.5 3V2C0.5 1.44772 0.947715 1 1.5 1H5C5 0.447715 5.44772 0 6 0H8C8.55229 0 9 0.447715 9 1H12.5C13.0523 1 13.5 1.44772 13.5 2V3ZM3.11803 4L3 4.05902V13C3 13.5523 3.44772 14 4 14H10C10.5523 14 11 13.5523 11 13V4.05902L10.882 4H3.11803ZM1.5 3V2H12.5V3H1.5Z" fill="black"/>
                        </svg>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    async deleteOperation() {
        if (!this.currentOperationId) return;

        try {
            const response = await CustomHttp.request(
                `${config.host}/operations/${this.currentOperationId}`,
                'DELETE'
            );

            if (response && !response.error) {
                await this.loadData(); // Перезагружаем данные после удаления
            }
        } catch (error) {
            console.error('Ошибка удаления операции:', error);
        }
    }
}