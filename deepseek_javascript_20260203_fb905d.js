// Каталог услуг - данные и функции
const servicesCatalog = {
    // Данные услуг (JSON)
    servicesData: {
      "services": {
        "Полировка": [
          {
            "name": "Полировка капота",
            "price_string": "от 2000 руб",
            "price_number": 2000
          },
          // ... остальные услуги из второго файла (скопируйте полностью объект servicesData)
          // Для экономии места здесь представлена только структура
          // Вставьте полный объект servicesData из второго файла
        ]
      }
    },

    // Иконки для категорий
    categoryIcons: {
        "Полировка": "fas fa-spray-can",
        "Покраска": "fas fa-paint-roller",
        "Жестяные работы": "fas fa-hammer",
        "Арматурные работы": "fas fa-tools",
        "Техническое обслуживание": "fas fa-cogs",
        "Замена масла и жидкостей": "fas fa-oil-can",
        "Диагностика автомобиля": "fas fa-search",
        "Ремонт ходовой части": "fas fa-car",
        "Ремонт тормозной системы": "fas fa-tachometer-alt",
        "Ремонт рулевого управления": "fas fa-steering-wheel",
        "Ремонт системы охлаждения": "fas fa-thermometer-half",
        "Ремонт топливной системы": "fas fa-gas-pump",
        "Ремонт двигателя": "fas fa-engine",
        "Ремонт трансмиссии": "fas fa-cogs",
        "Ремонт автоэлектрики": "fas fa-bolt"
    },

    // Корзина (локальное хранилище)
    cart: JSON.parse(localStorage.getItem('autouhod_cart')) || [],

    // Инициализация каталога
    init: function() {
        if (!document.getElementById('servicesGrid')) return;
        
        this.initCategories();
        this.initServices();
        this.updateCartDisplay();
        
        // Обработчики событий
        const clearBtn = document.getElementById('clearBtn');
        const orderBtn = document.getElementById('orderBtn');
        
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearCart());
        if (orderBtn) orderBtn.addEventListener('click', () => this.placeOrder());
        
        // Эффект параллакса для фона
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.services-hero');
            if (parallax) {
                parallax.style.backgroundPosition = `center ${scrolled * 0.5}px`;
            }
        });
    },

    // Инициализация категорий
    initCategories: function() {
        const categoriesNav = document.getElementById('categoriesNav');
        if (!categoriesNav) return;
        
        const categories = Object.keys(this.servicesData.services);
        
        // Добавляем кнопку "Все услуги"
        const allBtn = document.createElement('button');
        allBtn.className = 'category-btn active';
        allBtn.innerHTML = '<i class="fas fa-list"></i> Все услуги';
        allBtn.addEventListener('click', () => this.showAllServices());
        categoriesNav.appendChild(allBtn);
        
        // Добавляем кнопки для каждой категории
        categories.forEach(category => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.innerHTML = `<i class="${this.categoryIcons[category] || 'fas fa-wrench'}"></i> ${category}`;
            btn.addEventListener('click', () => this.filterByCategory(category));
            categoriesNav.appendChild(btn);
        });
    },

    // Инициализация услуг
    initServices: function() {
        this.showAllServices();
    },

    // Показать все услуги
    showAllServices: function() {
        const servicesGrid = document.getElementById('servicesGrid');
        if (!servicesGrid) return;
        
        servicesGrid.innerHTML = '';
        
        // Собираем все услуги из всех категорий
        let allServices = [];
        Object.entries(this.servicesData.services).forEach(([category, services]) => {
            services.forEach(service => {
                allServices.push({ ...service, category });
            });
        });
        
        // Сортируем по цене
        allServices.sort((a, b) => a.price_number - b.price_number);
        
        // Отображаем все услуги
        allServices.forEach(service => {
            servicesGrid.appendChild(this.createServiceCard(service));
        });
        
        // Активируем кнопку "Все услуги"
        this.updateActiveCategoryButton('Все услуги');
        
        // Плавное появление
        setTimeout(() => servicesGrid.classList.add('active'), 50);
    },

    // Фильтрация по категории
    filterByCategory: function(category) {
        const servicesGrid = document.getElementById('servicesGrid');
        if (!servicesGrid) return;
        
        servicesGrid.classList.remove('active');
        
        setTimeout(() => {
            servicesGrid.innerHTML = '';
            
            this.servicesData.services[category].forEach(service => {
                servicesGrid.appendChild(this.createServiceCard({ ...service, category }));
            });
            
            // Активируем кнопку выбранной категории
            this.updateActiveCategoryButton(category);
            
            // Плавное появление
            setTimeout(() => servicesGrid.classList.add('active'), 50);
        }, 300);
    },

    // Создание карточки услуги
    createServiceCard: function(service) {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.dataset.serviceId = `${service.category}-${service.name}`.replace(/\s+/g, '-');
        
        // Проверяем, добавлена ли уже эта услуга в корзину
        const isInCart = this.isServiceInCart(service);
        
        card.innerHTML = `
            <div class="service-category">${service.category}</div>
            <div class="service-header">
                <h3 class="service-name">${service.name}</h3>
                <div class="service-price">${service.price_string}</div>
            </div>
            <p class="service-description">
                Профессиональное выполнение работы специалистами с многолетним опытом.
                Используем только оригинальные запчасти и материалы.
            </p>
            <div class="service-action">
                <button class="add-to-cart-btn ${isInCart ? 'added' : ''}" 
                        data-service='${JSON.stringify(service).replace(/'/g, "&apos;")}'>
                    <i class="fas ${isInCart ? 'fa-check' : 'fa-cart-plus'}"></i>
                    ${isInCart ? 'Добавлено' : 'Добавить к заказу'}
                </button>
            </div>
        `;
        
        // Добавляем обработчик клика на кнопку
        const addBtn = card.querySelector('.add-to-cart-btn');
        addBtn.addEventListener('click', () => this.toggleServiceInCart(service, card));
        
        return card;
    },

    // Добавить/удалить услугу из корзины
    toggleServiceInCart: function(service, card) {
        const serviceId = `${service.category}-${service.name}`;
        const index = this.cart.findIndex(item => item.id === serviceId);
        
        if (index === -1) {
            // Добавляем услугу
            this.cart.push({
                id: serviceId,
                name: service.name,
                category: service.category,
                price: service.price_string,
                price_number: service.price_number
            });
            this.showCatalogNotification('Услуга добавлена к заказу', 'success');
            
            // Обновляем кнопку
            const btn = card.querySelector('.add-to-cart-btn');
            btn.classList.add('added');
            btn.innerHTML = '<i class="fas fa-check"></i> Добавлено';
        } else {
            // Удаляем услугу
            this.cart.splice(index, 1);
            this.showCatalogNotification('Услуга удалена из заказа', 'error');
            
            // Обновляем кнопку
            const btn = card.querySelector('.add-to-cart-btn');
            btn.classList.remove('added');
            btn.innerHTML = '<i class="fas fa-cart-plus"></i> Добавить к заказу';
        }
        
        // Сохраняем в localStorage
        localStorage.setItem('autouhod_cart', JSON.stringify(this.cart));
        
        // Обновляем отображение корзины
        this.updateCartDisplay();
    },

    // Проверить, есть ли услуга в корзине
    isServiceInCart: function(service) {
        const serviceId = `${service.category}-${service.name}`;
        return this.cart.some(item => item.id === serviceId);
    },

    // Очистить корзину
    clearCart: function() {
        if (this.cart.length === 0) {
            this.showCatalogNotification('Корзина уже пуста', 'error');
            return;
        }
        
        if (confirm('Вы уверены, что хотите очистить весь заказ?')) {
            this.cart = [];
            localStorage.setItem('autouhod_cart', JSON.stringify(this.cart));
            
            // Обновляем все кнопки "Добавить к заказу"
            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.classList.remove('added');
                btn.innerHTML = '<i class="fas fa-cart-plus"></i> Добавить к заказу';
            });
            
            this.updateCartDisplay();
            this.showCatalogNotification('Корзина очищена', 'success');
        }
    },

    // Оформить заказ
    placeOrder: function() {
        if (this.cart.length === 0) {
            this.showCatalogNotification('Добавьте хотя бы одну услугу к заказу', 'error');
            return;
        }
        
        // Собираем информацию о заказе
        let orderDetails = '=== ЗАКАЗ УСЛУГ АВТОУХОД ===\n\n';
        let total = 0;
        
        this.cart.forEach((item, index) => {
            orderDetails += `${index + 1}. ${item.name}\n`;
            orderDetails += `   Категория: ${item.category}\n`;
            orderDetails += `   Стоимость: ${item.price}\n\n`;
            total += item.price_number;
        });
        
        orderDetails += '=======================\n';
        orderDetails += `ОБЩАЯ СТОИМОСТЬ: ${this.formatPrice(total)} ₽\n\n`;
        orderDetails += 'Спасибо за заказ!\n';
        orderDetails += 'Наш менеджер свяжется с вами в течение 30 минут для уточнения деталей.\n';
        orderDetails += 'Телефон для связи: +7 (495) 123-45-67';
        
        // Показываем информацию о заказе
        alert(orderDetails);
        
        // Очищаем корзину после заказа
        this.cart = [];
        localStorage.setItem('autouhod_cart', JSON.stringify(this.cart));
        
        // Обновляем все кнопки
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.classList.remove('added');
            btn.innerHTML = '<i class="fas fa-cart-plus"></i> Добавить к заказу';
        });
        
        this.updateCartDisplay();
        this.showCatalogNotification('Заказ успешно оформлен! Мы скоро с вами свяжемся.', 'success');
    },

    // Обновить отображение корзины
    updateCartDisplay: function() {
        const selectedServices = document.getElementById('selectedServices');
        const selectedCount = document.getElementById('selectedCount');
        const totalAmount = document.getElementById('totalAmount');
        
        if (!selectedServices || !selectedCount || !totalAmount) return;
        
        // Обновляем счетчик
        selectedCount.textContent = this.cart.length;
        
        // Обновляем общую сумму
        const total = this.cart.reduce((sum, item) => sum + item.price_number, 0);
        totalAmount.textContent = `${this.formatPrice(total)} ₽`;
        
        // Обновляем список услуг
        if (this.cart.length === 0) {
            selectedServices.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Вы еще не выбрали ни одной услуги</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">Нажмите кнопку "Добавить к заказу" в карточке услуги</p>
                </div>
            `;
        } else {
            let html = '';
            this.cart.forEach(item => {
                html += `
                    <div class="selected-item">
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-category">${item.category}</div>
                        </div>
                        <div class="item-price">${item.price}</div>
                        <button class="remove-item" data-service-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            });
            selectedServices.innerHTML = html;
            
            // Добавляем обработчики для кнопок удаления
            selectedServices.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    const serviceId = btn.dataset.serviceId;
                    this.removeFromCart(serviceId);
                });
            });
        }
    },

    // Удалить услугу из корзины по ID
    removeFromCart: function(serviceId) {
        const index = this.cart.findIndex(item => item.id === serviceId);
        if (index !== -1) {
            this.cart.splice(index, 1);
            localStorage.setItem('autouhod_cart', JSON.stringify(this.cart));
            
            // Обновляем кнопку в карточке
            const card = document.querySelector(`[data-service-id="${serviceId}"]`);
            if (card) {
                const btn = card.querySelector('.add-to-cart-btn');
                btn.classList.remove('added');
                btn.innerHTML = '<i class="fas fa-cart-plus"></i> Добавить к заказу';
            }
            
            this.updateCartDisplay();
            this.showCatalogNotification('Услуга удалена из заказа', 'error');
        }
    },

    // Обновить активную кнопку категории
    updateActiveCategoryButton: function(activeCategory) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            // Сравниваем текст кнопки (без иконки)
            const btnText = btn.textContent.trim();
            if (btnText === activeCategory || 
                (activeCategory === 'Все услуги' && btnText.includes('Все услуги'))) {
                btn.classList.add('active');
            }
        });
    },

    // Форматирование цены (разделители тысяч)
    formatPrice: function(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    // Показать уведомление каталога
    showCatalogNotification: function(message, type = 'info') {
        const notificationsContainer = document.getElementById('catalogNotificationsContainer');
        if (!notificationsContainer) {
            // Создаем контейнер, если его нет
            const container = document.createElement('div');
            container.id = 'catalogNotificationsContainer';
            document.body.appendChild(container);
        }
        
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `catalog-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <div>${message}</div>
        `;
        
        notificationsContainer.appendChild(notification);
        
        // Показываем уведомление
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Убираем уведомление через 4 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }
};

// Инициализация каталога при загрузке страницы услуг
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, находимся ли мы на странице услуг при загрузке
    const servicesPage = document.getElementById('services-page');
    if (servicesPage && servicesPage.classList.contains('active')) {
        servicesCatalog.init();
    }
});

// Инициализация каталога при переключении на страницу услуг
function initServicesCatalog() {
    servicesCatalog.init();
}

// Добавляем вызов инициализации каталога в функцию showPage
const originalShowPage = window.showPage;
if (typeof originalShowPage === 'function') {
    window.showPage = function(pageId) {
        originalShowPage(pageId);
        
        // Инициализируем каталог при показе страницы услуг
        if (pageId === 'services') {
            setTimeout(() => {
                servicesCatalog.init();
            }, 100);
        }
    };
}