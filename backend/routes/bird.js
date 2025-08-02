const express = require('express');
const {
  getAllBirds,
  buyBird,
  getMyBirds,
  getBirdDetails
} = require('../controllers/birdController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All bird routes require authentication
router.use(protect);

router.get('/', getAllBirds);
router.get('/my-birds', getMyBirds);
router.get('/:id', getBirdDetails);
router.post('/buy/:birdId', buyBird);

module.exports = router;