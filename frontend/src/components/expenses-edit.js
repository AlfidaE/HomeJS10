import {CustomHttp} from "../utils/custom-http.js";
import config from "../../config/config.js";

export class ExpensesEdit {
    constructor(openNewRoute) {
        this.openNewRoute = openNewRoute;

        this.init();
    }
    init() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryName = urlParams.get('name');
        this.categoryId = this.urlParams.get('id');

        const inputElement = document.querySelector('.form-control');
        if (inputElement && categoryName) {
            inputElement.placeholder = categoryName;
            inputElement.value = categoryName;
        }
        this.setupEvents();
    }
    setupEvents() {
        document.getElementById('expenses-edit-btn-keep')?.addEventListener('click', () => this.saveCategory());
        document.getElementById('expenses-edit-btn-remove')?.addEventListener('click', () => window.history.back());
    }
    async saveCategory() {
        const inputElement = document.querySelector('.form-control');
        if (!inputElement) return;
        try {
           const response = await CustomHttp.request(config.host + `/categories/expense/${categoryId}`,'PUT', {

               oldName: inputElement.placeholder,
               newName: inputElement.value
           });
           if (response && !response.error) {
               this.openNewRoute('/expense');
           }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        }
    }
}