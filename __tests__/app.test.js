const request = require('supertest');
const app = require('../app');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data/');
const connection = require('../db/connection');
const { expect } = require('@jest/globals');

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
    describe('/api/reviews/:review_id/comments', () => {
      describe('GET', () => {
        it('returns an array of comments sorted by created_at in desc order', () => {
          return request(app)
            .get('/api/reviews/2/comments')
            .expect(200)
            .then(({ body }) => {
              const { comments } = body;
              expect(Array.isArray(comments)).toBe(true);
              expect(comments.length).toBe(3);
              expect(comments).toBeSortedBy('created_at', { descending: true });
              comments.forEach((comment) => {
                expect(comment).toMatchObject({
                  comment_id: expect.any(Number),
                  body: expect.any(String),
                  review_id: 2,
                  author: expect.any(String),
                  votes: expect.any(Number),
                  created_at: expect.any(String),
                });
              });
            });
        });
        it('returns 200: no comments found if no comments assigned to an existing review ', () => {
          return request(app)
            .get('/api/reviews/10/comments')
            .expect(200)
            .then(({ body }) => {
              const { comments } = body;
              expect(comments).toEqual([]);
            });
        });
        it('returns 404 if url given with review ID that is unassigned', () => {
          return request(app).get('/api/reviews/999/comments').expect(404);
        });
        it('returns 400 if url given with review ID of wrong type', () => {
          return request(app).get('/api/reviews/number/comments').expect(400);
        });
      });
      describe('POST', () => {
        it.only('returns 201 after a succesful post ', () => {
          const newComment = { username: 'dav3rid', body: 'great review' };
          return request(app)
            .post('/api/reviews/3/comments')
            .send(newComment)
            .expect(201)
            .then(({ body }) => {
              const { comment } = body;
              expect(comment).toMatchObject({
                comment_id: expect.any(Number),
                body: 'great review',
                review_id: 3,
                author: 'dav3rid',
                votes: 0,
                created_at: expect.any(String),
              });
            });
        });
      });
    });
  });
  it('should return an array of review objects sorted by created_at in descending order', () => {
    return request(app)
      .get('/api/reviews')
      .expect(200)
      .then(({ body }) => {
        const { reviews } = body;
        expect(reviews).toBeSortedBy('created_at', { descending: true });
        expect(reviews).toHaveLength(13);
        reviews.forEach((review) => {
          expect(review).toMatchObject({
            owner: expect.any(String),
            title: expect.any(String),
            review_id: expect.any(Number),
            category: expect.any(String),
            review_img_url: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            designer: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
});
