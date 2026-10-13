
const express = require("express");
const Notice = require("../models/notice");

const router = express.Router();

// Get all notices
router.get("/", async (req, res) => {
    try {
        const notices = await Notice.find().sort({ createdAt: -1 });
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a notice
router.post("/", async (req, res) => {
    try {
        const notice = new Notice(req.body);
        await notice.save();

        res.status(201).json({
            message: "Notice posted successfully!",
            notice
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a notice
router.delete("/:id", async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);

        if (!notice) {
            return res.status(404).json({
                message: "Notice not found"
            });
        }

        res.json({ message: "Notice deleted successfully!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;

