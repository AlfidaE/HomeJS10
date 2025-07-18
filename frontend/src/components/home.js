// import {Chart, PieController } from "chart.js";
//
// Chart.register(PieController);




import {Chart, PieController, ArcElement, Tooltip, Legend} from 'chart.js';
import flatpickr from "flatpickr";
// import flatpickr from "flatpickr";
// import {Russian} from "./ru.js";


// flatpickr(myElem, {
//     "locale": Russian // locale for this instance only
// });

// Регистрация компонентов
Chart.register(PieController, ArcElement, Tooltip, Legend);

export class Home {
    constructor() {
        this.initChartIncome();
        this.initChartExpenses();
        this.initDate();
    }

    initChartIncome() {
        const ctx = document.getElementById('myChart');

        const data = {
            labels: ['Red', 'Orange', 'Yellow', 'Green', 'Blue'],
            datasets: [
                {
                    label: 'Dataset 1',
                    data: [25, 40, 12.5, 12.5, 10],
                    backgroundColor: [
                        '#DC3545', // Красный
                        '#FD7E14', // Оранжевый
                        '#FFC107', // Желтый
                        '#20C997', // Зеленый
                        '#0D6EFD'  // Синий
                    ],
                }
            ]
        };

        const config = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true, // Позволяет изменять пропорции
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Chart.js Pie Chart'
                    }
                }
            },
        };

        new Chart(ctx, config);
    }

    initChartExpenses() {
        const ctx = document.getElementById('myChart2');

        const data = {
            labels: ['Green', 'Orange', 'Blue', 'Red', 'Yellow'],
            datasets: [
                {
                    label: 'Dataset 1',
                    data: [35, 15, 10, 5, 35],
                    backgroundColor: [
                        '#20C997',
                        '#FD7E14',
                        '#0D6EFD',
                        '#DC3545',
                        '#FFC107'
                    ],
                }
            ]
        };

        const config = {
            type: 'pie',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true, // Позволяет изменять пропорции
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Chart.js Pie Chart'
                    }
                }
            },
        };

        new Chart(ctx, config);
    }

    initDate() {

        const startDatePicker = flatpickr("#startDate", {
            locale: "ru",
            dateFormat: "d.m.Y",
            onChange: function(selectedDates, dateStr) {
                document.getElementById("startDateLink").textContent = dateStr;
            }
        });

        const endDatePicker = flatpickr("#endDate", {
            locale: "ru",
            dateFormat: "d.m.Y",
            onChange: function(selectedDates, dateStr) {
                document.getElementById("endDateLink").textContent = dateStr;
            }
        });

// Открываем календарь при клике на ссылку "Дата"
        document.getElementById("startDateLink").addEventListener("click", function(e) {
            e.preventDefault();
            startDatePicker.open();
        });

        document.getElementById("endDateLink").addEventListener("click", function(e) {
            e.preventDefault();
            endDatePicker.open();
        });

// Пример: Установка периода "Неделя" при клике на кнопку
        document.getElementById("week").addEventListener("click", function() {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - 7);

            startDatePicker.setDate(startDate);
            endDatePicker.setDate(endDate);
        });
    }
}


// <script>
//     // Автоматически устанавливаем сегодняшнюю дату в поле "по"
//     document.getElementById('endDate').valueAsDate = new Date();
//
//     // Логика для кнопок периода (например, при выборе "Неделя")
//     document.getElementById('week').addEventListener('click', function() {
//     const endDate = new Date();
//     const startDate = new Date();
//     startDate.setDate(endDate.getDate() - 7);
//
//     document.getElementById('startDate').valueAsDate = startDate;
//     document.getElementById('endDate').valueAsDate = endDate;
// });
//
//     // Аналогично для других кнопок (today, month, year...)
// </script>



