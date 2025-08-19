import {CustomHttp} from "../utils/custom-http.js";
import config from "../../config/config.js";

export class Expenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.popup = document.querySelector('.popup-expenses');
        this.currentCard = null;
        this.categories = [];
        this.cardExpensesContainer = document.querySelector('.cardExpenses');
        this.addButton = this.cardExpensesContainer.querySelector('.card-add');

        this.setupEvents();
        this.init();
    }

    async init() {
        await this.getCategories();
        this.renderCategories();
    }

    async getCategories() {
        try {
            const response = await CustomHttp.request(config.host + '/categories/expense');

            if (response && Array.isArray(response)) {
                this.categories = response;
                console.log('Получены категории расходов:', this.categories);
            } else {
                console.warn('Ответ сервера не содержит массив категорий:', response);
                this.categories = [];
            }
        } catch (error) {
            console.error('Ошибка при получении категорий расходов:', error);
            this.categories = [];
        }
    }

    renderCategories() {
        // Очищаем контейнер, но оставляем кнопку добавления
        this.cardExpensesContainer.innerHTML = '';
        if (this.addButton) {
            this.cardExpensesContainer.appendChild(this.addButton);
        }

        // Проверяем, есть ли категории для отображения
        // if (!this.categories || this.categories.length === 0) {
        //     const emptyMessage = document.createElement('div');
        //     emptyMessage.className = 'empty-message';
        //     emptyMessage.textContent = 'Нет категорий расходов';
        //     this.cardExpensesContainer.insertBefore(emptyMessage, this.addButton);
        //     return;
        // }

        // Создаем карточки для каждой категории
        this.categories.forEach(category => {
            const card = this.createCategoryCard(category);
            this.cardExpensesContainer.insertBefore(card, this.addButton);
        });
    }

    createCategoryCard(category) {
        const card = document.createElement('div');
        card.className = 'card-expenses';
        card.dataset.id = category.id;

        const cardTitle = document.createElement('div');
        cardTitle.className = 'card-title';
        cardTitle.textContent = category.title;

        const cardButtons = document.createElement('div');
        cardButtons.className = 'cardExpenses-btn';

        const editLink = document.createElement('a');
        editLink.href = `/expenses-edit?id=${category.id}`;
        editLink.className = 'card-btn-edit-expenses';
        editLink.id = `card-${category.title.toLowerCase().replace(/\s+/g, '-')}-btn-edit`;
        editLink.dataset.id = category.id;
        editLink.dataset.name = category.title;
        editLink.textContent = 'Редактировать';

        const removeButton = document.createElement('button');
        removeButton.className = 'card-btn-remove-expenses';
        removeButton.id = `card-${category.title.toLowerCase().replace(/\s+/g, '-')}-btn-remove`;
        removeButton.dataset.id = category.id;
        removeButton.textContent = 'Удалить';

        cardButtons.appendChild(editLink);
        cardButtons.appendChild(removeButton);

        card.appendChild(cardTitle);
        card.appendChild(cardButtons);

        return card;
    }

    setupEvents() {
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('card-btn-remove-expenses')) {
                e.preventDefault();
                this.showPopup(e.target.closest('.card-expenses'));
            }

            if (e.target.classList.contains('card-btn-edit-expenses')) {
                e.preventDefault();
                this.handleEditClick(e.target);
            }

            if (e.target.classList.contains('popup-btn-expenses-yes')) {
                await this.deleteCategory();
            }

            if (e.target.classList.contains('popup-btn-expenses-no')) {
                this.hidePopup();
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    handleEditClick(editButton) {
        const card = editButton.closest('.card-expenses');
        const categoryName = card.querySelector('.card-title').textContent;
        const categoryId = card.dataset.id;
        this.openNewRoute(`/expenses-edit?name=${encodeURIComponent(categoryName)}&id=${categoryId}`);
    }

    showPopup(card) {
        this.currentCard = card;
        this.popup.style.display = 'block';
    }

    hidePopup() {
        this.popup.style.display = 'none';
        this.currentCard = null;
    }

    async deleteCategory() {
        if (!this.currentCard) return;

        const categoryId = this.currentCard.dataset.id;

        try {
            const response = await CustomHttp.request(config.host + `/categories/expense/${categoryId}`, 'DELETE');

            if (response && !response.error) {
                this.currentCard.remove();
                // Обновляем список категорий после удаления
                await this.getCategories();
                this.renderCategories();
            } else {
                console.error('Ошибка при удалении:', response.error);
            }
        } catch (error) {
            console.error('Не удалось удалить категорию:', error);
        } finally {
            this.hidePopup();
        }
    }
}