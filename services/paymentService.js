const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  async createPaymentIntent(amount, currency = 'usd') {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency
    });
  }

  async createCustomer(email, paymentMethod) {
    return await stripe.customers.create({
      email,
      payment_method: paymentMethod,
      invoice_settings: { default_payment_method: paymentMethod }
    });
  }

  async processRefund(paymentIntentId) {
    return await stripe.refunds.create({
      payment_intent: paymentIntentId
    });
  }
}

module.exports = new PaymentService();