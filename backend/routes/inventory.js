const express = require('express');
const router = express.Router();

// Mock inventory data
const mockInventory = [
  { code: 'ENG001', name: 'Engine Oil 5W-30', price: 450, stock: 50 },
  { code: 'FIL001', name: 'Oil Filter', price: 250, stock: 30 },
  { code: 'BRA001', name: 'Brake Pad Set', price: 1200, stock: 20 },
  { code: 'AIR001', name: 'Air Filter', price: 350, stock: 40 },
  { code: 'SPK001', name: 'Spark Plug', price: 150, stock: 100 },
  { code: 'BAT001', name: 'Battery 12V', price: 3500, stock: 15 },
  { code: 'TYR001', name: 'Tyre 17 inch', price: 4500, stock: 10 },
  { code: 'CLT001', name: 'Coolant 5L', price: 600, stock: 25 },
  { code: 'BEL001', name: 'Timing Belt', price: 1800, stock: 12 },
  { code: 'LMP001', name: 'Headlight Bulb', price: 400, stock: 35 },
  { code: 'WIN001', name: 'Windshield Wiper', price: 500, stock: 28 },
  { code: 'FUL001', name: 'Fuel Filter', price: 300, stock: 45 },
  { code: 'RAD001', name: 'Radiator Cap', price: 200, stock: 50 },
  { code: 'HOS001', name: 'Radiator Hose', price: 800, stock: 18 },
  { code: 'GAS001', name: 'Gasket Set', price: 1200, stock: 22 }
];

// Get all inventory or search by code
router.get('/', (req, res) => {
  try {
    const { q } = req.query;

    if (q) {
      // Search by code (case-insensitive)
      const filtered = mockInventory.filter(item =>
        item.code.toLowerCase().includes(q.toLowerCase())
      );
      return res.json(filtered);
    }

    // Return all inventory
    res.json(mockInventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get inventory item by code
router.get('/:code', (req, res) => {
  try {
    const item = mockInventory.find(
      inv => inv.code.toLowerCase() === req.params.code.toLowerCase()
    );

    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

