export class Income {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.popup = document.querySelector('.popup-income');
        this.setupEvents();
    }

    setupEvents() {
        // Обработчик для всех кнопок удаления
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('card-btn-remove-income')) {
                e.preventDefault();
                this.showPopup(e.target.closest('.card-income'));
            }

            if (e.target.classList.contains('popup-btn-income-yes')) {
                await this.deleteCategory();
            }

            if (e.target.classList.contains('popup-btn-income-no')) {
                e.preventDefault();
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
        const token = localStorage.getItem('authToken'); // Получаем токен из localStorage


        try {
            const response = await fetch(`http://localhost:3000/api/categories/income/${categoryId}`, {
                method: 'DELETE'
            });

            this.currentCard.remove();
            this.hidePopup();

        } catch (error) {
            console.error('Не удалось удалить категорию:', error);
            this.hidePopup();
        }
    }
}