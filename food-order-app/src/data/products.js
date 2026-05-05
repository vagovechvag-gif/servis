// Данные товаров для приложения заказа еды
// Каждый товар имеет id, название, категорию и цену

export const products = [
  {
    id: 1,
    name: 'Классическая курица',
    category: 'ШАУРМА',
    price: 230
  },
  {
    id: 2,
    name: 'Классическая свинина',
    category: 'ШАУРМА',
    price: 240
  },
  {
    id: 3,
    name: 'Классическая говядина',
    category: 'ШАУРМА',
    price: 270
  },
  {
    id: 4,
    name: 'Сельская курица',
    category: 'ШАУРМА',
    price: 270
  },
  {
    id: 5,
    name: 'Сельская свинина',
    category: 'ШАУРМА',
    price: 280
  },
  {
    id: 6,
    name: 'Сельская говядина',
    category: 'ШАУРМА',
    price: 320
  },
  {
    id: 7,
    name: 'Вегетарианская',
    category: 'ШАУРМА',
    price: 120
  },
  {
    id: 8,
    name: 'Бургер с креветками',
    category: 'БУРГЕРЫ',
    price: 430
  },
  {
    id: 9,
    name: 'Шашлык курица',
    category: 'ШАШЛЫК',
    price: 130,
    unit: '100г'
  }
];

// Группировка товаров по категориям для удобного отображения
export const getProductsByCategory = () => {
  return products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});
};
