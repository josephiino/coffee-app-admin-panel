const express = require('express');
const router = express.Router();
const Machine = require('../models/Machine');

// Tüm makineleri getir
router.get('/', async (req, res) => {
  try {
    const machines = await Machine.find();
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni makine ekle
router.post('/', async (req, res) => {
  const machine = new Machine({
    name: req.body.name,
    location: req.body.location,
    status: req.body.status,
    metrics: req.body.metrics
  });

  try {
    const newMachine = await machine.save();
    res.status(201).json(newMachine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Makine güncelle
router.patch('/:id', async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (machine) {
      Object.assign(machine, req.body);
      const updatedMachine = await machine.save();
      res.json(updatedMachine);
    } else {
      res.status(404).json({ message: 'Makine bulunamadı' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Makine sil
router.delete('/:id', async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (machine) {
      await machine.remove();
      res.json({ message: 'Makine silindi' });
    } else {
      res.status(404).json({ message: 'Makine bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 