import flatpickr from "flatpickr";
import {Russian} from "flatpickr/dist/l10n/ru";


export class IncomeExpenseTable {
    constructor() {
        this.initDateTable();
    }

    initDateTable() {
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
            e.stopPropagation();
            startDatePicker.open();
        });

        document.getElementById("endDateLink").addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
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
flatpickr('#startDate', {
    "locale": Russian // locale for this instance only
});