import axios from 'axios';

const API_URL = 'https://qaran.onrender.com/api';
const TEST_PRODUCT_ID = '680e6e7071d895e0f53b642e';

const headers = {
  'Origin': 'https://baby-shop-xi.vercel.app',
  'Content-Type': 'application/json'
};

const testEndpoints = async () => {
  try {
    // Test Reviews
    const reviews = await axios.get(
      `${API_URL}/reviews/${TEST_PRODUCT_ID}`,
      { headers }
    );
    console.log('Reviews Test:', reviews.data.status === 'success' ? 'PASSED ✅' : 'FAILED ❌');
    
    // Test Q&A
    const questions = await axios.get(
      `${API_URL}/questions/product/${TEST_PRODUCT_ID}`,
      { headers }
    );
    console.log('Q&A Test:', questions.data.status === 'success' ? 'PASSED ✅' : 'FAILED ❌');
    
    // Test Related Products
    const related = await axios.get(
      `${API_URL}/products/${TEST_PRODUCT_ID}/related`,
      { headers }
    );
    console.log('Related Products Test:', related.data.status === 'success' ? 'PASSED ✅' : 'FAILED ❌');

  } catch (error) {
    console.error('Test Failed:', error.response?.data || error.message);
  }
};

testEndpoints();