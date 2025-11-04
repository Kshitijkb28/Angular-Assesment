const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');

// Define associations
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products',
  onDelete: 'CASCADE'
});

Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

module.exports = {
  User,
  Category,
  Product
};
