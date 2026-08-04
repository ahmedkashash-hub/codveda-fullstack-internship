const products = require('../data/products');

const parseProductId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const validateName = (name) =>
  typeof name === 'string' && name.trim().length > 0;

const validatePrice = (price) =>
  typeof price === 'number' && Number.isFinite(price) && price >= 0;

exports.getAllProducts = (req, res) => {
  return res.status(200).json(products);
};

exports.getProductById = (req, res) => {
  const id = parseProductId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      message: 'Product ID must be a positive integer',
    });
  }

  const product = products.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.status(200).json(product);
};

exports.createProduct = (req, res) => {
  const { name, price } = req.body;

  if (!validateName(name) || !validatePrice(price)) {
    return res.status(400).json({
      message: 'Name must be a non-empty string and price must be a non-negative number',
    });
  }

  const newProduct = {
    id:
      products.length > 0
        ? Math.max(...products.map((product) => product.id)) + 1
        : 1,
    name: name.trim(),
    price,
  };

  products.push(newProduct);
  return res.status(201).json(newProduct);
};

exports.updateProduct = (req, res) => {
  const id = parseProductId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      message: 'Product ID must be a positive integer',
    });
  }

  const product = products.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const { name, price } = req.body;

  if (name === undefined && price === undefined) {
    return res.status(400).json({
      message: 'Supply at least one field: name or price',
    });
  }

  if (name !== undefined) {
    if (!validateName(name)) {
      return res.status(400).json({
        message: 'Name must be a non-empty string',
      });
    }

    product.name = name.trim();
  }

  if (price !== undefined) {
    if (!validatePrice(price)) {
      return res.status(400).json({
        message: 'Price must be a non-negative number',
      });
    }

    product.price = price;
  }

  return res.status(200).json(product);
};

exports.deleteProduct = (req, res) => {
  const id = parseProductId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      message: 'Product ID must be a positive integer',
    });
  }

  const productIndex = products.findIndex((item) => item.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  products.splice(productIndex, 1);
  return res.status(204).send();
};
