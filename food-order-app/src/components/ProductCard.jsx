import React from 'react';
import { Card, Button, Title, Caption } from '@vkontakte/vkui';

/**
 * Компонент карточки товара
 * @param {Object} product - объект товара с полями id, name, price, unit
 * @param {Function} onAdd - функция добавления товара в корзину
 */
const ProductCard = ({ product, onAdd }) => {
  return (
    <Card mode="outline" style={{ marginBottom: '12px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '8px 0'
      }}>
        <div>
          <Title level="3" weight="regular">{product.name}</Title>
          <Caption style={{ color: '#999' }}>
            {product.price} ₽{product.unit ? ` / ${product.unit}` : ''}
          </Caption>
        </div>
        <Button 
          mode="primary" 
          size="m"
          onClick={() => onAdd(product)}
        >
          Добавить
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
