// Sample menu shown if the course's demonstration API is unavailable.
// Replace descriptions/photos with your own work before a graded submission.
export const SAMPLE_MENU = [
  { id: 1, name: 'Greek Salad', price: 12.99, category: 'starters', description: 'Fresh salad with feta cheese, olives and tomatoes.', emoji: '🥗' },
  { id: 2, name: 'Bruschetta', price: 7.99, category: 'starters', description: 'Toasted bread topped with tomatoes and basil.', emoji: '🍅' },
  { id: 3, name: 'Grilled Fish', price: 20.0, category: 'mains', description: 'Seasoned fish served with roasted vegetables.', emoji: '🐟' },
  { id: 4, name: 'Pasta', price: 18.99, category: 'mains', description: 'Pasta with vegetables and our house sauce.', emoji: '🍝' },
  { id: 5, name: 'Lemon Dessert', price: 6.99, category: 'desserts', description: 'Sweet homemade lemon and ricotta dessert.', emoji: '🍰' },
  { id: 6, name: 'Lemonade', price: 4.99, category: 'drinks', description: 'Freshly squeezed homemade lemonade.', emoji: '🍋' },
  { id: 7, name: 'Coffee', price: 3.5, category: 'drinks', description: 'Freshly brewed coffee.', emoji: '☕' },
];

export const DEMO_MENU_URL = 'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/menu-items-by-category.json';

export function normalizeMenu(data) {
  const rows = Array.isArray(data) ? data : Array.isArray(data?.menu) ? data.menu : [];
  return rows
    .filter((x) => x && typeof x.name === 'string')
    .map((x, index) => ({
      id: index + 1,
      name: x.name,
      price: Number(x.price) || 0,
      category: String(x.category || 'mains').trim().toLowerCase(),
      description: String(x.description || ''),
      emoji: SAMPLE_MENU.find((s) => s.name.toLowerCase() === x.name.toLowerCase())?.emoji || '🍽️',
    }));
}
