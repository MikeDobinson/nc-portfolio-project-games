const request = require('supertest');
const app = require('../app');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data/');
const connection = require('../db/connection');
const { get } = require('../app');

beforeEach(() => seed(testData));
afterAll(() => connection.end());

describe('api/categories', () => {
  it('GET 200: returns an array of category objects, with each object having keys of `slug` and `description`', () => {
    return request(app)
      .get('/api/categories')
      .expect(200)
      .then(({ body }) => {
        const { categories } = body;
        expect(categories.length).toBe(4);
        expect(Array.isArray(categories)).toBe(true);
        categories.forEach((category) => {
          expect(category).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe('invalid endpoint', () => {
  it('404: Invalid URL', () => {
    return request(app)
      .get('/wrong-endpoint')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid URL');
      });
  });
});

describe('/api/reviews', () => {
  describe('/api/reviews/:review_id', () => {
    it('returns an object with the correct keys', () => {
      return request(app)
        .get('/api/reviews/2')
        .expect(200)
        .then(({ body }) => {
          const { review } = body;
          expect(review).toMatchObject({
            review_id: 2,
            title: 'Jenga',
            category: 'dexterity',
            designer: 'Leslie Scott',
            owner: 'philippaclaire9',
            review_body: 'Fiddly fun for all the family',
            review_img_url:
              'https://images.pexels.com/photos/4473494/pexels-photo-4473494.jpeg?w=700&h=700',
            created_at: '2021-01-18T10:01:41.251Z',
            votes: 5,
          });
        });
    });
    it('returns with error if an unassigned review ID is entered', () => {
      return request(app)
        .get('/api/reviews/99')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('No review found with that ID');
        });
    });
    it('returns with error if impossible review ID is entered', () => {
      return request(app)
        .get('/api/reviews/not-a-number')
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Invalid request');
        });
    });
  });
  it('should return an array of review objects sorted by created_at in descending order', () => {
    return request(app)
      .get('/api/reviews')
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        const reviewsCopy = [...reviews];
        const sortedReviews = reviewsCopy.sort((reviewA, reviewB) => {
          return reviewB.created_at - reviewA.created_at;
        });
        expect(reviews).toEqual(sortedReviews);
        expect(reviews).toHaveLength(13);
        reviews.forEach((review) => {
          expect(typeof review).toBe('object');
          expect(review).toHaveProperty('owner');
          expect(review).toHaveProperty('title');
          expect(review).toHaveProperty('review_id');
          expect(review).toHaveProperty('category');
          expect(review).toHaveProperty('review_img_url');
          expect(review).toHaveProperty('created_at');
          expect(review).toHaveProperty('votes');
          expect(review).toHaveProperty('designer');
          expect(review).toHaveProperty('comment_count');
        });
      });
  });
});
