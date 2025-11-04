const { Product, Category } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const fs = require('fs');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const { Readable } = require('stream');

exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, categoryId } = req.body;
    const image = req.file ? req.file.filename : null;

    // Verify category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const product = await Product.create({
      name,
      price,
      categoryId,
      image
    });

    const productWithCategory = await Product.findByPk(product.id, {
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'uniqueId']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: productWithCategory
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllProducts = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Sorting
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Search filters
    const where = {};
    
    if (req.query.search) {
      where.name = {
        [Op.iLike]: `%${req.query.search}%`
      };
    }

    if (req.query.categoryId) {
      where.categoryId = req.query.categoryId;
    }

    if (req.query.categoryName) {
      // Search by category name
      const categories = await Category.findAll({
        where: {
          name: {
            [Op.iLike]: `%${req.query.categoryName}%`
          }
        }
      });
      
      if (categories.length > 0) {
        where.categoryId = {
          [Op.in]: categories.map(c => c.id)
        };
      } else {
        // No matching categories, return empty result
        return res.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0
          }
        });
      }
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'uniqueId']
      }],
      limit,
      offset,
      order: [[sortBy, sortOrder]],
      distinct: true
    });

    res.json({
      success: true,
      data: products,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{
        model: Category,
        as: 'category'
      }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, price, categoryId } = req.body;

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      product.categoryId = categoryId;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (req.file) product.image = req.file.filename;

    await product.save();

    const updatedProduct = await Product.findByPk(product.id, {
      include: [{
        model: Category,
        as: 'category'
      }]
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Bulk upload with streaming to prevent timeout
exports.bulkUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    let products = [];
    let errors = [];

    // Set response headers for streaming
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Transfer-Encoding', 'chunked');

    if (fileExtension === 'csv') {
      // Process CSV with streaming
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (row) => {
            products.push({
              name: row.name || row.Name,
              price: parseFloat(row.price || row.Price),
              categoryId: parseInt(row.categoryId || row.CategoryId),
              image: row.image || row.Image || null
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (['xlsx', 'xls'].includes(fileExtension)) {
      // Process Excel file
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      products = data.map(row => ({
        name: row.name || row.Name,
        price: parseFloat(row.price || row.Price),
        categoryId: parseInt(row.categoryId || row.CategoryId),
        image: row.image || row.Image || null
      }));
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Invalid file format. Only CSV and XLSX are supported.' });
    }

    // Validate and insert products in batches to prevent timeout
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      for (const productData of batch) {
        try {
          // Validate category exists
          const category = await Category.findByPk(productData.categoryId);
          if (!category) {
            errors.push({
              row: i + batch.indexOf(productData) + 1,
              error: `Category ID ${productData.categoryId} not found`
            });
            errorCount++;
            continue;
          }

          await Product.create(productData);
          successCount++;
        } catch (error) {
          errors.push({
            row: i + batch.indexOf(productData) + 1,
            error: error.message
          });
          errorCount++;
        }
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Bulk upload completed',
      summary: {
        total: products.length,
        success: successCount,
        failed: errorCount
      },
      errors: errors.slice(0, 50) // Limit error details to first 50
    });
  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// Generate report with streaming to prevent timeout
exports.generateReport = async (req, res, next) => {
  try {
    const format = req.query.format || 'csv';
    
    if (!['csv', 'xlsx'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use csv or xlsx' });
    }

    // Fetch all products with category information
    const products = await Product.findAll({
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name', 'uniqueId']
      }],
      order: [['createdAt', 'DESC']]
    });

    if (format === 'csv') {
      // Generate CSV with streaming
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=products-report.csv');

      // Write CSV header
      res.write('ID,UniqueID,Name,Price,Image,CategoryName,CategoryUniqueID,CreatedAt\n');

      // Stream data
      for (const product of products) {
        const row = [
          product.id,
          product.uniqueId,
          `"${product.name}"`,
          product.price,
          product.image || '',
          `"${product.category.name}"`,
          product.category.uniqueId,
          product.createdAt.toISOString()
        ].join(',');
        res.write(row + '\n');
      }

      res.end();
    } else {
      // Generate XLSX
      const data = products.map(product => ({
        ID: product.id,
        UniqueID: product.uniqueId,
        Name: product.name,
        Price: product.price,
        Image: product.image || '',
        CategoryName: product.category.name,
        CategoryUniqueID: product.category.uniqueId,
        CreatedAt: product.createdAt.toISOString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=products-report.xlsx');
      res.send(buffer);
    }
  } catch (error) {
    next(error);
  }
};
