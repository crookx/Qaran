import fetch from 'node-fetch';

const testReviewStatsAPI = async () => {
  try {
    const productId = '680e6e7071d895e0f53b642e';
    const response = await fetch(
      `http://localhost:8080/api/reviews/stats/${productId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
};

testReviewStatsAPI();