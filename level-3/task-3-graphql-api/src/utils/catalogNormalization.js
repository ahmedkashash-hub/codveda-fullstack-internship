export const normalizeProduct = (product) =>
  product && {
    ...product,
    price: product.price.toFixed(2),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    ...(product.category && { category: normalizeCategory(product.category) }),
  };

export const normalizeCategory = (category) =>
  category && {
    ...category,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    ...(category.products && {
      products: category.products.map((product) => normalizeProduct(product)),
    }),
  };
