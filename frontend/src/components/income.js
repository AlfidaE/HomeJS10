import {CustomHttp} from "../utils/custom-http.js";
import config from "../../config/config.js";

export class Income {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;
        this.popup = document.querySelector('.popup-income');
        this.currentCard = null;
        this.categories = [];

        this.setupEvents();
    }

    setupEvents() {
        // Обработчик для всех кнопок удаления
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('card-btn-remove-income')) {
                e.preventDefault();
                this.showPopup(e.target.closest('.card-income'));
            }

            // Обработка кнопки редактирования
            if (e.target.classList.contains('card-btn-edit-income')) {
                e.preventDefault();
                this.handleEditClick(e.target);
            }
            // кнопки попапа
            if (e.target.classList.contains('popup-btn-income-yes')) {
                await this.deleteCategory();
            }
            if (e.target.classList.contains('popup-btn-income-no')) {
                this.hidePopup();
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }

    handleEditClick(editButton) {
        const card = editButton.closest('.card-income');
        const categoryName = card.querySelector('.card-income-title').textContent;
        const categoryId = card.dataset.id;

        // Переходим на страницу редактирования с параметрами
        window.location.href = `/income-edit?name=${encodeURIComponent(categoryName)}&id=${categoryId}`;
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
            const response = await CustomHttp.request(config.host + `/categories/income/${categoryId}`,'DELETE');

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