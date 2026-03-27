const interviewService = require("./interview.service");

class InterviewController {
  async create(req, res) {
    try {
      const data = req.body;
      const file = req.file;

      const result = await interviewService.createInterview(data, file);

      res.status(201).json({
        success: true,
        message: "Interview created successfully",
        data: result,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const data = await interviewService.getAllInterviews();

      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const data = await interviewService.getInterviewById(req.params.id);

      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const data = req.body;
      const file = req.file;

      const result = await interviewService.updateInterview(
        req.params.id,
        data,
        file
      );

      res.json({
        success: true,
        message: "Interview updated successfully",
        data: result,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await interviewService.deleteInterview(req.params.id);

      res.json({
        success: true,
        message: "Interview deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 👉 Add Round
  async addRound(req, res) {
    try {
      const result = await interviewService.addInterviewRound(
        req.params.id,
        req.body
      );

      res.json({
        success: true,
        message: "Round added",
        data: result,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 👉 Update Round
  async updateRound(req, res) {
    try {
      const { index } = req.params;

      const result = await interviewService.updateInterviewRound(
        req.params.id,
        index,
        req.body
      );

      res.json({
        success: true,
        message: "Round updated",
        data: result,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 👉 Delete Round
  async deleteRound(req, res) {
    try {
      const { index } = req.params;

      const result = await interviewService.deleteInterviewRound(
        req.params.id,
        index
      );

      res.json({
        success: true,
        message: "Round deleted",
        data: result,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new InterviewController();