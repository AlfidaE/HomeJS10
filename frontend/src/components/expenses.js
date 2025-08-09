import {CustomHttp} from "../utils/custom-http.js";
import config from "../../config/config.js";

export class Expenses {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.popup = document.querySelector('.popup-expenses');
        this.currentCard = null;

        this.setupEvents();
    }

    setupEvents() {
        // Обработчик для всех кнопок удаления
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('card-btn-remove-expenses')) {
                e.preventDefault();
                this.showPopup(e.target.closest('.card-expenses'));
            }
            if (e.target.classList.contains('popup-btn-expenses-yes')) {
                await this.deleteCategory();
            }
            if (e.target.classList.contains('popup-btn-expenses-no')) {
                this.hidePopup();
            }
        });
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
            const response = await CustomHttp.request(config.host + `/categories/expense/${categoryId}`,'DELETE');

            if (response && !response.error) {
                this.currentCard.remove();
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