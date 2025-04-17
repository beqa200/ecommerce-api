import pool from '../config/db.config.js';
import { PrismaClient } from '@prisma/client';
import xlsx from 'xlsx';
const prisma = new PrismaClient();

// Get all users
async function getProducts(req, res) {
  try {
    const products = await prisma.products.findMany({
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    res.json(products);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getOneProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await prisma.products.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function createProduct(req, res) {
  try {
    const { name, price, stock, description, slug, category } = req.body;
    const product = await prisma.products.create({
      data: { name, price, stock, description, slug, category },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function uploadProductsExcel(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const sheet = xlsx.utils.sheet_to_json(worksheet);

  await prisma.products.createMany({
    data: sheet.map((row) => ({
      name: row.name,
      price: row.price,
      stock: row.stock,
      description: row.description,
      slug: row.slug,
      categoryId: row.categoryId,
    })),
  });

  fs.unlinkSync(req.file.path);

  res.json({ message: 'Products uploaded successfully' });
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, price, stock, description, slug, category } = req.body;

    const product = await prisma.products.update({
      where: { id: parseInt(id) },
      data: { name, price, stock, description, slug, category },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    await prisma.products.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCategoryStats(req, res) {
  try {
    const result = await prisma.products.groupBy({
      by: ['category'],
      _count: true,
      _avg: { price: true },
      _min: { price: true },
      _max: { price: true },
    });

    const formattedResult = result.map((item) => ({
      category: item.category,
      count: item._count,
      average: item._avg.price,
      min: item._min.price,
      max: item._max.price,
    }));

    res.json(formattedResult);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function buyProduct(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    //check user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    //check product
    const product = await prisma.products.findUnique({
      where: { id: parseInt(id) },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    //check stock
    if (product.stock <= 0) {
      return res.status(400).json({ error: 'Product is out of stock' });
    }

    await prisma.products.update({
      where: { id: parseInt(id) },
      data: { stock: product.stock - 1 },
    });

    const userProduct = await prisma.usersProducts.create({
      data: { userId, productId: parseInt(id) },
    });

    res.status(201).json({ message: 'Product bought successfully' });
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export {
  getProducts,
  getOneProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoryStats,
  buyProduct,
  uploadProductsExcel,
};
