import React from 'react';
import { 
  Card, 
  Button, 
  Title, 
  Text, 
  Div,
  Input,
  FormItem,
  Alert
} from '@vkontakte/vkui';

/**
 * Компонент корзины
 * @param {Array} cartItems - массив товаров в корзине
 * @param {Function} onRemove - функция удаления товара из корзины
 * @param {Object} formData - данные формы (имя, телефон)
 * @param {Function} onFormDataChange - обработчик изменения данных формы
 * @param {Function} onSubmit - функция отправки заказа
 */
const Cart = ({ cartItems, onRemove, formData, onFormDataChange, onSubmit }) => {
  // Подсчитываем итоговую сумму
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  if (cartItems.length === 0) {
    return (
      <Div>
        <Card mode="outline" style={{ textAlign: 'center', padding: '20px' }}>
          <Text>Корзина пуста</Text>
          <Text style={{ color: '#999', marginTop: '8px' }}>
            Добавьте товары из меню
          </Text>
        </Card>
      </Div>
    );
  }

  return (
    <Div>
      {/* Список товаров в корзине */}
      <Title level="2" style={{ marginBottom: '16px' }}>Ваш заказ</Title>
      
      {cartItems.map((item, index) => (
        <Card 
          key={`${item.id}-${index}`} 
          mode="outline" 
          style={{ marginBottom: '12px' }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0'
          }}>
            <div>
              <Title level="3" weight="regular">{item.name}</Title>
              <Text style={{ color: '#999' }}>
                {item.price} ₽{item.unit ? ` / ${item.unit}` : ''}
              </Text>
            </div>
            <Button 
              mode="destructive" 
              size="s"
              onClick={() => onRemove(index)}
            >
              Удалить
            </Button>
          </div>
        </Card>
      ))}

      {/* Итоговая сумма */}
      <Card mode="tint" style={{ marginTop: '16px', padding: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Title level="2">Итого:</Title>
          <Title level="2" weight="bold">{total} ₽</Title>
        </div>
      </Card>

      {/* Форма оформления заказа */}
      <Card mode="outline" style={{ marginTop: '24px' }}>
        <Title level="2" style={{ marginBottom: '16px' }}>Оформление заказа</Title>
        
        <FormItem 
          top="Имя" 
          htmlFor="name"
          style={{ marginBottom: '12px' }}
        >
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onFormDataChange}
            placeholder="Введите ваше имя"
          />
        </FormItem>

        <FormItem 
          top="Телефон" 
          htmlFor="phone"
          style={{ marginBottom: '12px' }}
        >
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={onFormDataChange}
            placeholder="+7 (___) ___-__-__"
          />
        </FormItem>

        <Button 
          mode="primary" 
          size="l"
          stretched
          onClick={onSubmit}
          disabled={!formData.name || !formData.phone}
        >
          Отправить заказ
        </Button>
      </Card>
    </Div>
  );
};

export default Cart;
