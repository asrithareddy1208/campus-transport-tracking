
const express = require("express");
const Bus = require("../models/bus");

const router = express.Router();

// Add a new bus
router.post("/", async (req, res) => {
    try {
        const bus = new Bus(req.body);
        await bus.save();

        res.status(201).json({
            message: "Bus added successfully!",
            bus
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all buses
router.get("/", async (req, res) => {
    try {
        const buses = await Bus.find();
        res.json(buses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update bus status
router.patch("/:id", async (req, res) => {
    try {
        const { status } = req.body;

        if (!["Active", "Inactive", "Maintenance"].includes(status)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const bus = await Bus.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        res.json({
            message: "Bus status updated successfully!",
            bus
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a bus by ID
router.delete("/:id", async (req, res) => {
    try {
        const bus = await Bus.findByIdAndDelete(req.params.id);

        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        res.json({ message: "Bus deleted successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

 // Save or update a bus route
router.put("/:id/route", async (req, res) => {
    try {
        const { startPoint, destination, stops } = req.body;

        if (
            !startPoint?.trim() ||
            !destination?.trim() ||
            !Array.isArray(stops) ||
            stops.some(
                (stop) =>
                    !stop.stopName?.trim() ||
                    !stop.arrivalTime
            )
        ) {
            return res.status(400).json({
                message: "Enter the starting point, destination, and valid stop timings."
            });
        }

        const bus = await Bus.findByIdAndUpdate(
            req.params.id,
            {
                startPoint: startPoint.trim(),
                destination: destination.trim(),
                stops: stops.map((stop) => ({
                    stopName: stop.stopName.trim(),
                    arrivalTime: stop.arrivalTime
                }))
            },
            { new: true, runValidators: true }
        );

        if (!bus) {
            return res.status(404).json({
                message: "Bus not found"
            });
        }

        res.json({
            message: "Bus route saved successfully!",
            bus
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
