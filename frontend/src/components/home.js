import {Chart, PieController, ArcElement, Tooltip, Legend} from 'chart.js';
import flatpickr from "flatpickr";
import {Russian} from "flatpickr/dist/l10n/ru";
import {CustomHttp} from "../utils/custom-http.js";
import config from "../../config/config.js";

// Регистрация компонентов
Chart.register(PieController, ArcElement, Tooltip, Legend);

export class Home {
    constructor() {
        this.incomeChart = null;
        this.expenseChart = null;
        this.operations = [];
        this.activeFilter = 'today';
        this.startDate = null;
        this.endDate = null;
        this.startDatePicker = null;
        this.endDatePicker = null;

        // Палитры цветов для доходов и расходов
        this.incomeColors = [
            '#198754', '#20C997', '#0DCAF0', '#0D6EFD', '#6610F2',
            '#6F42C1', '#D63384', '#FD7E14', '#FFC107', '#DC3545',
            '#28a745', '#17a2b8', '#6c757d', '#343a40', '#007bff'
        ];

        this.expenseColors = [
            '#DC3545', '#FD7E14', '#FFC107', '#6F42C1', '#D63384',
            '#6610F2', '#6c757d', '#343a40', '#28a745', '#17a2b8',
            '#0D6EFD', '#0DCAF0', '#20C997', '#198754', '#007bff'
        ];

        this.initDate();
        this.setupEvents();
        this.applyFilter('today');
    }

    async loadOperations(period = null, dateFrom = null, dateTo = null) {
        try {
            let url = config.host + '/operations';
            const params = new URLSearchParams();

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

            const response = await CustomHttp.request(url);

            if (response && Array.isArray(response)) {
                this.operations = response;
                this.updateCharts();
            }
        } catch (error) {
            console.error('Ошибка при загрузке операций:', error);
        }
    }

    groupOperationsByCategory() {
        const incomeData = {};
        const expenseData = {};

        this.operations.forEach(operation => {
            if (operation.type === 'income') {
                if (!incomeData[operation.category]) {
                    incomeData[operation.category] = 0;
                }
                incomeData[operation.category] += operation.amount;
            } else if (operation.type === 'expense') {
                if (!expenseData[operation.category]) {
                    expenseData[operation.category] = 0;
                }
                expenseData[operation.category] += operation.amount;
            }
        });

        return { incomeData, expenseData };
    }

    updateCharts() {
        const { incomeData, expenseData } = this.groupOperationsByCategory();

        // Обновляем диаграмму доходов
        if (this.incomeChart) {
            this.incomeChart.data.labels = Object.keys(incomeData);
            this.incomeChart.data.datasets[0].data = Object.values(incomeData);
            this.incomeChart.data.datasets[0].backgroundColor = this.getColorsForCategories(Object.keys(incomeData), 'income');
            this.incomeChart.update();
        } else {
            this.initChartIncome(incomeData);
        }

        // Обновляем диаграмму расходов
        if (this.expenseChart) {
            this.expenseChart.data.labels = Object.keys(expenseData);
            this.expenseChart.data.datasets[0].data = Object.values(expenseData);
            this.expenseChart.data.datasets[0].backgroundColor = this.getColorsForCategories(Object.keys(expenseData), 'expense');
            this.expenseChart.update();
        } else {
            this.initChartExpenses(expenseData);
        }
    }

    // Генерация цветов для категорий
    getColorsForCategories(categories, type) {
        const colors = type === 'income' ? this.incomeColors : this.expenseColors;
        return categories.map((category, index) => {
            return colors[index % colors.length];
        });
    }

    initChartIncome(incomeData = {}) {
        const ctx = document.getElementById('myChart');
        if (!ctx) return;

        const labels = Object.keys(incomeData);
        const data = Object.values(incomeData);
        const backgroundColors = this.getColorsForCategories(labels, 'income');

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Доходы по категориям',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }
            ]
        };

        const config = {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                return `${label}: $${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            },
        };

        this.incomeChart = new Chart(ctx, config);
    }

    initChartExpenses(expenseData = {}) {
        const ctx = document.getElementById('myChart2');
        if (!ctx) return;

        const labels = Object.keys(expenseData);
        const data = Object.values(expenseData);
        const backgroundColors = this.getColorsForCategories(labels, 'expense');

        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Расходы по категориям',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }
            ]
        };

        const config = {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                return `${label}: $${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            },
        };

        this.expenseChart = new Chart(ctx, config);
    }

    initDate() {
        const startDateElem = document.getElementById("startDate");
        const endDateElem = document.getElementById("endDate");
        const dateRangeSelector = document.querySelector('.date-range-selector');

        if (!startDateElem || !endDateElem || !dateRangeSelector) return;

        this.startDatePicker = flatpickr(startDateElem, {
            locale: Russian,
            dateFormat: "Y-m-d",
            onChange: (selectedDates, dateStr) => {
                const startDateLink = document.getElementById("startDateLink");
                if (startDateLink) {
                    startDateLink.textContent = this.formatDisplayDate(dateStr);
                }
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
                const endDateLink = document.getElementById("endDateLink");
                if (endDateLink) {
                    endDateLink.textContent = this.formatDisplayDate(dateStr);
                }
                this.endDate = dateStr;
                if (this.activeFilter === 'interval' && this.startDate && this.endDate) {
                    this.loadOperations('interval', this.startDate, this.endDate);
                }
            }
        });

        const startDateLink = document.getElementById("startDateLink");
        const endDateLink = document.getElementById("endDateLink");

        if (startDateLink) {
            startDateLink.addEventListener("click", (e) => {
                e.preventDefault();
                this.startDatePicker.open();
            });
        }

        if (endDateLink) {
            endDateLink.addEventListener("click", (e) => {
                e.preventDefault();
                this.endDatePicker.open();
            });
        }

        dateRangeSelector.style.display = 'none';
    }

    setupEvents() {
        const filterButtons = ['today', 'week', 'month', 'year', 'all', 'interval'];
        filterButtons.forEach(filterId => {
            const button = document.getElementById(filterId);
            if (button) {
                button.addEventListener('click', () => {
                    this.applyFilter(filterId);
                });
            }
        });
    }

    applyFilter(filterId) {
        this.setActiveFilter(filterId);

        let period = filterId;
        let dateFrom = null;
        let dateTo = null;

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
                    dateFrom = null;
                    dateTo = null;
                    break;
            }
        }

        this.loadOperations(period, dateFrom, dateTo);
    }

    setActiveFilter(filterId) {
        const buttons = document.querySelectorAll('.btn-choice-date');
        buttons.forEach(btn => {
            btn.classList.remove('active');
        });

        const activeButton = document.getElementById(filterId);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        this.activeFilter = filterId;

        const dateRangeSelector = document.querySelector('.date-range-selector');
        if (dateRangeSelector) {
            dateRangeSelector.style.display = filterId === 'interval' ? 'block' : 'none';
        }
    }

    formatDisplayDate(dateString) {
        if (!dateString) return 'Дата';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }
}