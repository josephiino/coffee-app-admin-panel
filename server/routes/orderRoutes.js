const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Tüm siparişleri getir
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('machineId productId');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni sipariş oluştur
router.post('/', async (req, res) => {
  const order = new Order({
    machineId: req.body.machineId,
    productId: req.body.productId,
    status: req.body.status,
    metrics: req.body.metrics
  });

  try {
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Sipariş güncelle
router.patch('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      Object.assign(order, req.body);
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Sipariş sil
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.remove();
      res.json({ message: 'Sipariş silindi' });
    } else {
      res.status(404).json({ message: 'Sipariş bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 