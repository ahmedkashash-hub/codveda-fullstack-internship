import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Books', description: 'Printed and digital reading materials.' },
  { name: 'Electronics', description: 'Consumer electronics and accessories.' },
  { name: 'Office', description: 'Everyday workplace essentials.' },
];

const products = [
  { name: 'Clean Code', sku: 'BOOK-001', price: '39.90', stock: 12, isActive: true, categoryName: 'Books' },
  { name: 'GraphQL in Action', sku: 'BOOK-002', price: '44.50', stock: 8, isActive: true, categoryName: 'Books' },
  { name: 'Wireless Mouse', sku: 'ELEC-001', price: '24.99', stock: 30, isActive: true, categoryName: 'Electronics' },
  { name: 'Mechanical Keyboard', sku: 'ELEC-002', price: '89.00', stock: 15, isActive: true, categoryName: 'Electronics' },
  { name: 'USB-C Hub', sku: 'ELEC-003', price: '49.95', stock: 0, isActive: false, categoryName: 'Electronics' },
  { name: 'A4 Notebook', sku: 'OFFICE-001', price: '6.75', stock: 50, isActive: true, categoryName: 'Office' },
  { name: 'Desk Organizer', sku: 'OFFICE-002', price: '18.20', stock: 9, isActive: false, categoryName: 'Office' },
];

try {
  const categoryIds = new Map();
  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { name: category.name },
      update: { description: category.description },
      create: category,
    });
    categoryIds.set(category.name, saved.id);
  }

  for (const { categoryName, ...product } of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: { ...product, categoryId: categoryIds.get(categoryName) },
      create: { ...product, categoryId: categoryIds.get(categoryName) },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
} finally {
  await prisma.$disconnect();
}
