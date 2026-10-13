
const express = require("express");
const Driver = require("../models/driver");
const Bus = require("../models/bus");

const router = express.Router();

// Get all drivers with their assigned bus details
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("bus", "busNumber registrationNumber startPoint destination");

    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a driver
router.post("/", async (req, res) => {
  try {
    const { name, phoneNumber, bus } = req.body;

    if (!name?.trim() || !phoneNumber?.trim() || !bus) {
      return res.status(400).json({
        message: "Enter the driver's name, phone number, and assigned bus."
      });
    }

    const selectedBus = await Bus.findById(bus);

    if (!selectedBus) {
      return res.status(404).json({
        message: "Selected bus not found."
      });
    }

    const driver = new Driver({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      bus
    });

    await driver.save();
    await driver.populate(
      "bus",
      "busNumber registrationNumber startPoint destination"
    );

    res.status(201).json({
      message: "Driver added successfully!",
      driver
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit driver details
router.put("/:id", async (req, res) => {
  try {
    const { name, phoneNumber, bus } = req.body;

    if (!name?.trim() || !phoneNumber?.trim() || !bus) {
      return res.status(400).json({
        message: "Enter the driver's name, phone number, and assigned bus."
      });
    }

    const selectedBus = await Bus.findById(bus);

    if (!selectedBus) {
      return res.status(404).json({
        message: "Selected bus not found."
      });
    }

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        bus
      },
      { new: true, runValidators: true }
    ).populate(
      "bus",
      "busNumber registrationNumber startPoint destination"
    );

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found."
      });
    }

    res.json({
      message: "Driver updated successfully!",
      driver
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a driver
router.delete("/:id", async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found."
      });
    }

    res.json({ message: "Driver deleted successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
