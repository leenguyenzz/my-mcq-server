const express = require('express');
const router = express.Router();
const Mcq = require('../models/Mcq');

router.get('/', async (req, res) => {
  try {
    const mcqs = await Mcq.find();
    const text = mcqs.map(mcq => mcq.text);
    res.json(mcqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const mcq = await Mcq.findById(req.params.id);
    if (mcq == null) return res.status(404).json({ message: 'Cannot find MCQ' });
    res.json(mcq);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
