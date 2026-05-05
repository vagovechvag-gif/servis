import React, { useState } from 'react';
import { 
  View, 
  Panel, 
  PanelHeader, 
  Header, 
  Button, 
  Div, 
  Title, 
  Text,
  Card,
  SplitLayout,
  SplitCol,
  Root
} from '@vkontakte/vkui';
import vkBridge from '@vkontakte/vk-bridge';
import './App.css';

// Импортируем данные и компоненты
import { products, getProductsByCategory } from './data/products';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';

const App = () => {
  // Состояние для навигации между экранами ('menu' или 'cart')
  const [activePanel, setActivePanel] = useState('menu');
  
  // Состояние корзины - массив выбранных товаров
  const [cartItems, setCartItems] = useState([]);
  
  // Состояние формы заказа
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  /**
   * Добавление товара в корзину
   * @param {Object} product - товар для добавления
   */
  const handleAddToCart = (product) => {
    setCartItems([...cartItems, product]);
  };

  /**
   * Удаление товара из корзины по индексу
   * @param {number} index - индекс товара в корзине
   */
  const handleRemoveFromCart = (index) => {
    const newCart = [...cartItems];
    newCart.splice(index, 1);
    setCartItems(newCart);
  };

  /**
   * Обработчик изменения полей формы
   * @param {Event} e - событие изменения input
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  /**
   * Отправка заказа
   * Формирует JSON с данными и отправляет через VK Bridge или показывает alert
   */
  const handleSubmitOrder = () => {
    // Проверяем заполненность полей
    if (!formData.name || !formData.phone) {
      alert('Пожалуйста, заполните имя и телефон');
      return;
    }

    if (cartItems.length === 0) {
      alert('Корзина пуста');
      return;
    }

    // Подсчитываем итоговую сумму
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    // Формируем объект заказа
    const orderData = {
      customer: {
        name: formData.name,
        phone: formData.phone
      },
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        unit: item.unit || null
      })),
      total: total,
      timestamp: new Date().toISOString()
    };

    // Логгируем заказ в консоль для отладки
    console.log('Заказ:', JSON.stringify(orderData, null, 2));

    // Попытка отправить через VK Bridge API
    // Если вы хотите реально отправлять данные на сервер, раскомментируйте код ниже
    /*
    vkBridge.send('VKWebAppCallAPIMethod', {
      method: 'messages.send',
      params: {
        user_id: YOUR_USER_ID,
        message: `Новый заказ!\nИмя: ${formData.name}\nТелефон: ${formData.phone}\nСумма: ${total} ₽`,
        random_id: Math.floor(Math.random() * 1000000)
      }
    }).then(() => {
      alert('Заказ успешно отправлен!');
      setCartItems([]);
      setFormData({ name: '', phone: '' });
      setActivePanel('menu');
    }).catch((error) => {
      console.error('Ошибка отправки через VK Bridge:', error);
      // Fallback - показываем alert
      alert('Заказ сформирован! (тестовый режим)\n\n' + JSON.stringify(orderData, null, 2));
    });
    */

    // Для теста просто показываем alert с данными заказа
    alert('Заказ успешно оформлен!\n\n' + 
          `Имя: ${formData.name}\n` +
          `Телефон: ${formData.phone}\n` +
          `Товаров: ${cartItems.length}\n` +
          `Сумма: ${total} ₽\n\n` +
          'Данные заказа:' +
          JSON.stringify(orderData, null, 2)
    );

    // Очищаем корзину и форму
    setCartItems([]);
    setFormData({ name: '', phone: '' });
    setActivePanel('menu');
  };

  // Получаем товары, сгруппированные по категориям
  const productsByCategory = getProductsByCategory();

  return (
    <SplitLayout header="none">
      <SplitCol>
        <Root activeView="main">
          <View id="main" activePanel={activePanel}>
            
            {/* Панель меню */}
            <Panel id="menu">
              <PanelHeader>Меню</PanelHeader>
              
              <Div>
                <Header mode="primary" style={{ marginBottom: '16px' }}>
                  Добро пожаловать!
                </Header>
                <Text style={{ marginBottom: '24px', color: '#999' }}>
                  Выберите блюда из нашего меню
                </Text>

                {/* Отображение товаров по категориям */}
                {Object.entries(productsByCategory).map(([category, items]) => (
                  <div key={category} style={{ marginBottom: '32px' }}>
                    <Title level="2" weight="bold" style={{ marginBottom: '16px' }}>
                      {category}
                    </Title>
                    {items.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAdd={handleAddToCart}
                      />
                    ))}
                  </div>
                ))}

                {/* Кнопка перехода в корзину */}
                {cartItems.length > 0 && (
                  <Button 
                    mode="primary" 
                    size="l" 
                    stretched
                    onClick={() => setActivePanel('cart')}
                    style={{ marginTop: '24px' }}
                  >
                    Перейти в корзину ({cartItems.length})
                  </Button>
                )}
              </Div>
            </Panel>

            {/* Панель корзины */}
            <Panel id="cart">
              <PanelHeader 
                left={<Button onClick={() => setActivePanel('menu')}>Назад</Button>}
              >
                Корзина
              </PanelHeader>
              
              <Cart 
                cartItems={cartItems}
                onRemove={handleRemoveFromCart}
                formData={formData}
                onFormDataChange={handleFormChange}
                onSubmit={handleSubmitOrder}
              />
            </Panel>

          </View>
        </Root>
      </SplitCol>
    </SplitLayout>
  );
};

export default App;
