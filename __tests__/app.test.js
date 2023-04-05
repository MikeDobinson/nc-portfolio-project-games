const request = require('supertest');
const app = require('../app');
const seed = require('../db/seeds/seed');
const testData = require('../db/data/test-data/');
const connection = require('../db/connection');
const { expect } = require('@jest/globals');

beforeEach(() => seed(testData));
afterAll(() => connection.end());

describe.only('/api/categories', () => {
  it('200: returns an array of category objects, with each object having keys of `slug` and `description`', () => {
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
  describe('GET', () => {
    it('200: returns an array of review objects sorted by created_at in descending order', () => {
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
  describe('QUERIES', () => {
    describe('category', () => {
      it('200: returns an array of review objects where all categories match an input', () => {
        return request(app)
          .get('/api/reviews?category=dexterity')
          .expect(200)
          .then(({ body }) => {
            const { reviews } = body;
            expect(reviews.length).not.toBe(0);
            reviews.forEach((review) => {
              expect(review.category).toBe('dexterity');
            });
          });
      });
      it('404: if given category is not present in the table', () => {
        return request(app)
          .get('/api/reviews?category=video')
          .expect(404)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe('Reviews not found');
          });
      });
    });
    describe('order', () => {
      it('200: can change order of sort', () => {
        return request(app)
          .get('/api/reviews?order=ASC')
          .expect(200)
          .then(({ body }) => {
            const { reviews } = body;
            expect(reviews).toBeSortedBy('created_at', { ascending: true });
          });
      });
      it('400: if anything other than ASC or DESC are input', () => {
        return request(app)
          .get('/api/reviews?order=ABC')
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe('Invalid query');
          });
      });
    });
    describe('sort_by', () => {
      it('200: change the key that the array is sorted by', () => {
        return request(app)
          .get('/api/reviews?sort_by=review_id')
          .expect(200)
          .then(({ body }) => {
            const { reviews } = body;
            expect(reviews).toBeSortedBy('review_id', { descending: true });
          });
      });
      it('400: wrong query input', () => {
        return request(app)
          .get('/api/reviews?sort_by=anything')
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe('Bad sort query');
          });
      });
    });
    describe('multiple queries', () => {
      it('200: can handle multiple queries at once', () => {
        return request(app)
          .get('/api/reviews?category=social deduction&sort_by=owner&order=ASC')
          .expect(200)
          .then(({ body }) => {
            const { reviews } = body;
            expect(reviews).toBeSortedBy('owner', { ascending: true });
            reviews.forEach((review) => {
              expect(review.category).toBe('social deduction');
            });
          });
      });
    });
  });
});

describe('/api/reviews/:review_id', () => {
  describe('GET', () => {
    it('200: returns an object with the correct keys', () => {
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
    it('200: returns a review object with a comment_count key representing total count of all reviews with this id', () => {
      return request(app)
        .get('/api/reviews/3')
        .expect(200)
        .then(({ body }) => {
          const { review } = body;
          expect(review.length).not.toBe(0);
          expect(review).toHaveProperty('comment_count');
        });
    });
    it('404: returns with error if an unassigned review ID is entered', () => {
      return request(app)
        .get('/api/reviews/99')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('No review found with that ID');
        });
    });
    it('400: returns with error if impossible review ID is entered', () => {
      return request(app)
        .get('/api/reviews/not-a-number')
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Invalid request');
        });
    });
  });
  describe('PATCH', () => {
    it('200: returns with the updated review object', () => {
      return request(app)
        .patch('/api/reviews/3')
        .send({ inc_votes: 2 })
        .expect(200)
        .then(({ body }) => {
          const { updatedReview } = body;
          expect(updatedReview.votes).toBe(7);
        });
    });
    it('400: wrong data type', () => {
      return request(app)
        .patch('/api/reviews/number')
        .send({ inc_votes: 2 })
        .expect(400);
    });
    it('404: if given an ID that is not yet assigned to a review', () => {
      return request(app)
        .patch('/api/reviews/999')
        .send({ inc_votes: 2 })
        .expect(404);
    });
    it('400: if given an object with the wrong key', () => {
      return request(app)
        .patch('/api/reviews/10')
        .send({ incvotes: 2 })
        .expect(400);
    });
    it('400: if given an object with the wrong value type', () => {
      return request(app)
        .patch('/api/reviews/10')
        .send({ inc_votes: 'hello' })
        .expect(400);
    });
  });
});

describe('/api/reviews/:review_id/comments', () => {
  describe('GET', () => {
    it('200: returns an array of comments sorted by created_at in desc order', () => {
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
    it('200: returns no comments found if no comments assigned to an existing review ', () => {
      return request(app)
        .get('/api/reviews/10/comments')
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toEqual([]);
        });
    });
    it('404: if url given with review ID that is unassigned', () => {
      return request(app).get('/api/reviews/999/comments').expect(404);
    });
    it('400: if url given with review ID of wrong type', () => {
      return request(app).get('/api/reviews/number/comments').expect(400);
    });
  });
  describe('POST', () => {
    it('201: succesful post ', () => {
      return request(app)
        .post('/api/reviews/3/comments')
        .send({ username: 'dav3rid', body: 'great review' })
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
    it('400: if trying to post to a review ID of invalid type', () => {
      return request(app)
        .post('/api/reviews/number/comments')
        .send({ username: 'dav3rid', body: 'great review' })
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Invalid request');
        });
    });
    it('404: if trying to post to a review ID that doesnt exist yet', () => {
      return request(app)
        .post('/api/reviews/999/comments')
        .send({ username: 'dav3rid', body: 'great review' })
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('No review found with that ID');
        });
    });
    it('400: if trying to post a comment in the wrong format', () => {
      return request(app)
        .post('/api/reviews/3/comments')
        .send({ body: 'good review' })
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Invalid format');
        });
    });
    it('404: if username does not exist in user db', () => {
      return request(app)
        .post('/api/reviews/3/comments')
        .send({ username: 'mike_d', body: 'good review' })
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('User not found');
        });
    });
    it('200: ignores extra kvs on the object,', () => {
      return request(app)
        .post('/api/reviews/3/comments')
        .send({
          username: 'dav3rid',
          body: 'great review',
          hotel: 'trivago',
        })
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

describe('/api/comments/:comment_id', () => {
  describe('DELETE', () => {
    it('204: deletes the relevant comment from the table', () => {
      return request(app)
        .delete('/api/comments/2')
        .expect(204)
        .then(({ body }) => {
          expect(body).toEqual({});
        })
        .then(() => {
          return connection.query(
            `SELECT * FROM comments WHERE comment_id = 2`
          );
        })
        .then(({ rows }) => {
          expect(rows.length).toBe(0);
        });
    });
    it('404: if given a comment ID that does not exist/', () => {
      return request(app)
        .delete('/api/comments/999')
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('No comment found with that ID');
        });
    });
    it('400: if given a comment ID of wrong type', () => {
      return request(app)
        .delete('/api/comments/number')
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe('Invalid request');
        });
    });
  });
});

describe('/api/users', () => {
  describe('GET', () => {
    it('200: returns an array of all users that match the correct user object', () => {
      return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body }) => {
          const { users } = body;
          expect(users.length).toBe(4);
          users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});
