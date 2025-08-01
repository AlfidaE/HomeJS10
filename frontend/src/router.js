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
import {Login} from "./components/login.js";
import {SignUp} from "./components/sign-up.js";
import {Logout} from "./components/logout.js";
import {AuthUtils} from "./utils/auth-utils.js";




export class Router {
    constructor() {
        this.titlePageElement = document.getElementById('title');
        this.contentPageElement = document.getElementById('content');
        this.stylesLinkElement = document.getElementById('styles-link');

        this.initEvents();

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
                    'chart.umd.min.js', // круги
                    'flatpickr.min.js' // календарь

                ],
                styles: [
                    'flatpickr.min.css', // календарь
                ]
            },
            {
                route: '/404',
                title: 'Страница не найдена',
                filePathTemplate: '/templates/404.html',
                useLayout: false,
            },


            {
                route: '/login',
                title: 'Авторизация',
                filePathTemplate: '/templates/pages/login.html',
                useLayout: false,
                load: () => {
                    new Login(this.openNewRoute.bind(this));

                },
            },
            {
                route: '/sign-up',
                title: 'Регистрация',
                filePathTemplate: '/templates/pages/sign-up.html',
                useLayout: false,
                load: () => {
                    new SignUp(this.openNewRoute.bind(this));
                },
            },
            {
                route: '/logout',
                load: () => {
                    new Logout(this.openNewRoute.bind(this));
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
            },
            {
                route: '/income-create',
                title: 'Создание категории доходов',
                filePathTemplate: '/templates/pages/income-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeCreate();
                },
            },
            {
                route: '/income-edit',
                title: 'Редактирование категории доходов',
                filePathTemplate: '/templates/pages/income-edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeEdit();
                },
            },
            {
                route: '/expenses',
                title: 'Расходы',
                filePathTemplate: '/templates/pages/expenses.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new Expenses();
                },
            },
            {
                route: '/expenses-create',
                title: 'Создание категории расходов',
                filePathTemplate: '/templates/pages/expenses-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new ExpensesCreate();
                },
            },
            {
                route: '/expenses-edit',
                title: 'Редактирование категории расходов',
                filePathTemplate: '/templates/pages/expenses-edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new ExpensesEdit();
                },
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
                    'flatpickr.min.js', // календарь


                ],
                styles: [
                    'flatpickr.min.css', // календарь
                ],

            },
            {
                route: '/income-expense-create',
                title: ' Создание дохода/расхода',
                filePathTemplate: '/templates/pages/income-expense-create.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeExpenseCreate();
                },
            },
            {
                route: '/income-expense-edit',
                title: ' Редактирование дохода/расхода',
                filePathTemplate: '/templates/pages/income-expense-edit.html',
                useLayout: '/templates/layout.html',
                load: () => {
                    new IncomeExpenseEdit();
                },
            },
        ]
    }

    initEvents() {
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this));
        window.addEventListener('popstate', this.activateRoute.bind(this));
        // document.addEventListener('click', this.openNewRoute.bind(this));
        document.addEventListener('click', this.clickHandler.bind(this));

    }

// функция, которая обрабатывает клик по ссылке

    async openNewRoute(url) {
        const currentRoute = window.location.pathname;
        history.pushState({}, '', url);
        await this.activateRoute(null, currentRoute);
    }

    async clickHandler(e) {
        let element = null;
        if (e.target.nodeName === 'A') {
            element = e.target;
        } else if (e.target.parentNode.nodeName === 'A') {
            element = e.target.parentNode;
        }

        if (element) {
            e.preventDefault();

            const url = element.href.replace(window.location.origin, '');
            if (!url || url === '/#' || url.startsWith('javascript:void(0)')) {
                return;
            }

            await this.openNewRoute(url);
        }
    }

    async activateRoute(e, oldRoute = null) {
        // Удаляем все календари flatpickr
        document.querySelectorAll('.flatpickr-calendar').forEach(el => el.remove());
        if (window.flatpickr) {
            document.querySelectorAll('.flatpickr-input').forEach(input => {
                input._flatpickr?.destroy();
            });
        }

        if (oldRoute) {
            const currentRoute = this.routes.find(item => item.route === oldRoute);
            if (currentRoute.styles && currentRoute.styles.length > 0) {
                currentRoute.styles.forEach(style => {
                    document.querySelector(`link[href='/css/${style}']`).remove();
                });
            }
            if (currentRoute.scripts && currentRoute.scripts.length > 0) {
                currentRoute.scripts.forEach(script => {
                    document.querySelector(`script[src='/js/${script}']`).remove();
                });
            }
            if (currentRoute.unload && typeof currentRoute.unload === 'function') {
                currentRoute.unload();
            }
        }

        const urlRoute = window.location.pathname;
        const newRoute = this.routes.find(item => item.route === urlRoute);

        if (newRoute) {
            if (newRoute.styles && newRoute.styles.length > 0) {
                newRoute.styles.forEach(style => {
                    // document.querySelector(`link[href='/css/${style}']`)?.remove();
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
                    document.body.className = '';
                    let contentBlock = this.contentPageElement;

                    if (newRoute.useLayout) {
                        this.contentPageElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text());
                        contentBlock = document.getElementById('content-layout');

                            this.profileNameElement = document.getElementById('profile-name');
                        console.log(this.profileNameElement)

                        if (this.profileNameElement.innerText === '') {
                            const userInfo = JSON.parse(AuthUtils.getUserInfo(AuthUtils.userInfoTokenKey));

                                this.profileNameElement.innerText = `${userInfo.name} ${userInfo.lastName}`;

                        }


                    }
                    contentBlock.innerHTML = await fetch(newRoute.filePathTemplate).then(response => response.text());

                }

                if (newRoute.load && typeof newRoute.load === 'function') {
                    newRoute.load();
                }

            } else {
                console.log('No route found');
                history.pushState({}, '', '/404');
                await this.activateRoute();
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
            button.addEventListener('click', function () {
                toggleSubmenu(this);
            });
        });



    }

}