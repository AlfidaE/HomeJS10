import {Home} from "./components/home.js";
import {Income} from "./components/income.js";
import {IncomeCreate} from "./components/income-create.js";
import {IncomeEdit} from "./components/income-edit.js";
import {Expenses} from "./components/expenses.js";
import {ExpensesCreate} from "./components/expenses-create.js";
import {ExpensesEdit} from "./components/expenses-edit.js";
import {IncomeExpenseTable} from "./components/income-expense-table.js";
import {IncomeExpenseCreate} from "./components/income-expense-create.js";
import {IncomeExpenseEdit} from "./components/income-expense-edit.js";
import {Form} from "./components/form.js";


export class Router {
    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.stylesLinkElement = document.getElementById('styles-link');


        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        this.routes = [
            {
                route: '/',
                title: 'Главная',
                filePathTemplate: '/templates/pages/home.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Home();
                },
                scripts: [
                    'bootstrap.min.js',
                    'popper.min.js',
                    'chart.umd.min.js',
                    'flatpickr.min.js'

                ],
                styles: [
                    'bootstrap.min.css',
                    'flatpickr.min.css',
                ]
            },
            {
                route: '/404',
                title: 'Страница не найдена',
                filePathTemplate: '/templates/404.html',
                useLayout: false,
                scripts: [
                    'bootstrap.min.js',

                ],
                styles: [
                    'bootstrap.min.css'
                ]
            },


            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/pages/login.html',
                useLayout: false,
                load: () => {
                    new Form('login');
                },
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/pages/sign-up.html',
                useLayout: false,
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '/income',
                title: 'Доходы',
                filePathTemplate: '/templates/pages/income.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Income();
                },
                scripts: [
                    'bootstrap.min.js',

                ],
                styles: [
                    'bootstrap.min.css'
                ]
            },
            {
                route: '/income-create',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/pages/income-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeCreate();
                },
                scripts: [
                    'bootstrap.min.js',

                ],
                styles: [
                    'bootstrap.min.css'
                ]
            },
            {
                route: '/income-edit',
                title: 'Редактирование категории доходов',
                filePathTemplate: '/templates/pages/income-edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeEdit();
                },
                scripts: [
                    'bootstrap.min.js',

                ],
                styles: [
                    'bootstrap.min.css'
                ]
            },
            {
                route: '/expenses',
                title: 'Расходы',
                filePathTemplate: '/templates/pages/expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses();
                },
                scripts: [
                    'bootstrap.min.js',

                ],
                styles: [
                    'bootstrap.min.css'
                ]
            },
            {
                route: '/expenses-create',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/pages/expenses-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new ExpensesCreate();
                },
                scripts: [
                    'bootstrap.min.js',

                ],
                styles: [
                    'bootstrap.min.css'
                ]
            },
            {
                route: '/expenses-edit',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/templates/pages/expenses-edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new ExpensesEdit();
                },
                scripts: [
                    'bootstrap.min.js',

                ],
                styles: [
                    'bootstrap.min.css'
                ]
            },
            {
                route: '/income-expense-table',
                title: 'Доходы и расходы',
                filePathTemplate: '/templates/pages/income-expense-table.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeExpenseTable();
                },
                scripts: [
                    'bootstrap.min.js',
                    'popper.min.js',
                    'chart.umd.min.js',
                    'flatpickr.min.js',
                    'l10n/ru.js',

                ],
                styles: [
                    'bootstrap.min.css',
                    'flatpickr.min.css',
                ]
            },
            {
                route: '/income-expense-create',
                title: ' Создание дохода/расхода',
                filePathTemplate: '/templates/pages/income-expense-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeExpenseCreate();
                },
                scripts: [
                    'bootstrap.min.js',

                ],
                styles: [
                    'bootstrap.min.css'
                ]
            },
            {
                route: '/income-expense-edit',
                title: ' Редактирование дохода/расхода',
                filePathTemplate: '/templates/pages/income-expense-edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeExpenseEdit();
                },
                scripts: [
                    'bootstrap.min.js',

                ],
                styles: [
                    'bootstrap.min.css'
                ]
            },
        ]
    }


    async activateRoute() {
        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {
            if (newRoute.styles && newRoute.styles.length > 0) {
                newRoute.styles.forEach(style => {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = '/css/' + style;
                    document.head.insertBefore(link, this.stylesLinkElement);
                });
            }
            if (newRoute.scripts && newRoute.scripts.length > 0) {
                newRoute.scripts.forEach(file => {
                    const script = document.createElement('script');
                    script.src = '/js/' + file;
                    document.body.appendChild(script);
                });
            }


            if (newRoute) {
                if (newRoute.title) {
                    this.titlePageElement.innerText = newRoute.title + ' | L.Finance';
                }

                if (newRoute.filePathTemplate) {

                    let contentBlock = this.contentPageElement;
                    if (newRoute.useLayout) {
                        this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());
                        contentBlock = document.getElementById('content-layout');
                    }
                    contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());

                }

                if (newRoute.load && typeof newRoute.load === 'function') {
                    newRoute.load();
                }

            } else {
                console.log('No route found')
                window.location = '/404';
            }

        }
        function toggleSubmenu(button) {
            // Находим подменю рядом с кнопкой
            const submenu = button.nextElementSibling;

            // Переключаем класс 'show' у подменю
            submenu.classList.toggle('show');

            // Обновляем атрибут aria-expanded для доступности
            const isExpanded = submenu.classList.contains('show');
            button.setAttribute('aria-expanded', isExpanded);
        }

// Добавляем обработчики событий для всех кнопок подменю
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', function() {
                toggleSubmenu(this);
            });
        });
    }
}