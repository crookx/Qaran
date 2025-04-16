const Product = require('../models/Product');
const { Client } = require('@elastic/elasticsearch');
const LoggerService = require('./loggerService');

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
});

class SearchService {
  static async indexProduct(product) {
    try {
      await client.index({
        index: 'products',
        id: product._id.toString(),
        body: {
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          tags: product.tags
        }
      });
    } catch (error) {
      LoggerService.error('Elasticsearch indexing error:', error);
    }
  }

  static async search(query, filters = {}) {
    try {
      const { body } = await client.search({
        index: 'products',
        body: {
          query: {
            bool: {
              must: [
                {
                  multi_match: {
                    query,
                    fields: ['name^2', 'description', 'tags']
                  }
                },
                ...Object.entries(filters).map(([key, value]) => ({
                  term: { [key]: value }
                }))
              ]
            }
          }
        }
      });
      return body.hits.hits.map(hit => ({
        ...hit._source,
        _id: hit._id,
        score: hit._score
      }));
    } catch (error) {
      LoggerService.error('Elasticsearch search error:', error);
      return [];
    }
  }
}

module.exports = SearchService;