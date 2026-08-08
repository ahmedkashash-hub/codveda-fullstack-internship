import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const catalog = [
  {
    category: {
      name: 'Electronics',
      description: 'Reliable devices and accessories for everyday technology.',
    },
    products: [
      {
        name: 'Wireless Keyboard',
        description: 'Compact wireless keyboard with quiet, responsive keys.',
        sku: 'ELEC-KB-001',
        price: '49.99',
        stock: 24,
      },
      {
        name: 'USB-C Hub',
        description: 'Six-port USB-C hub with HDMI and card reader support.',
        sku: 'ELEC-HUB-002',
        price: '64.50',
        stock: 18,
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with adjustable sensitivity.',
        sku: 'ELEC-MOU-003',
        price: '29.95',
        stock: 31,
      },
    ],
  },
  {
    category: {
      name: 'Books',
      description: 'Practical books for software design and engineering.',
    },
    products: [
      {
        name: 'Clean Code',
        description: 'A handbook of practices for writing maintainable software.',
        sku: 'BOOK-CC-001',
        price: '39.99',
        stock: 12,
      },
      {
        name: 'Domain-Driven Design',
        description: 'A guide to modeling complex software around its domain.',
        sku: 'BOOK-DDD-002',
        price: '54.00',
        stock: 9,
      },
    ],
  },
  {
    category: {
      name: 'Office',
      description: 'Useful supplies for focused and organized workspaces.',
    },
    products: [
      {
        name: 'Hardcover Notebook',
        description: 'A5 ruled notebook with durable binding and 192 pages.',
        sku: 'OFF-NBK-001',
        price: '14.75',
        stock: 40,
      },
      {
        name: 'Adjustable Desk Lamp',
        description: 'LED desk lamp with adjustable brightness and color temperature.',
        sku: 'OFF-LMP-002',
        price: '45.00',
        stock: 14,
      },
      {
        name: 'Mechanical Pencil Set',
        description: 'Precision pencil set with refill leads and two point sizes.',
        sku: 'OFF-PEN-003',
        price: '12.50',
        stock: 35,
      },
    ],
  },
]

async function seed() {
  for (const entry of catalog) {
    const category = await prisma.category.upsert({
      where: { name: entry.category.name },
      update: { description: entry.category.description },
      create: entry.category,
    })

    for (const product of entry.products) {
      await prisma.product.upsert({
        where: { sku: product.sku },
        update: {
          ...product,
          categoryId: category.id,
          isActive: true,
        },
        create: {
          ...product,
          categoryId: category.id,
        },
      })
    }
  }
}

try {
  await seed()
  console.log('Development catalog seed completed successfully.')
} catch {
  console.error('Development catalog seed failed.')
  process.exitCode = 1
} finally {
  await prisma.$disconnect()
}
