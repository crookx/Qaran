const Cart = require('../models/Cart');
const Product = require('../models/Product');

const cartService = {
  getCart: async (userId) => {
    let cart = await Cart.findOne({ userId })
      .populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    
    return cart;
  },

  addToCart: async (userId, productId, quantity = 1) => {
    const cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId);

    if (!product) throw new Error('Product not found');

    if (cart) {
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      return await cart.save();
    } else {
      return await Cart.create({
        userId,
        items: [{ product: productId, quantity }]
      });
    }
  },

  updateQuantity: async (userId, productId, quantity) => {
    const cart = await Cart.findOne({ userId });
    
    if (!cart) throw new Error('Cart not found');

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) throw new Error('Item not found in cart');

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    return await cart.save();
  },

  clearCart: async (userId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error('Cart not found');
    
    cart.items = [];
    return await cart.save();
  }
};

module.exports = cartService;