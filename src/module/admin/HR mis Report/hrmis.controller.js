const service = require("./hrmis.service");

class HRMISController {
  async create(req, res) {
    try {
      const data = req.body;

      // 🔥 created_by from token
      data.created_by = req.auth.sub;

      const result = await service.create(data);

      res.status(201).json({
        success: true,
        message: "HR MIS Report Created",
        data: result,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const data = await service.getAll();
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const data = await service.getById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const data = await service.update(req.params.id, req.body);

      res.json({
        success: true,
        message: "Updated Successfully",
        data,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      await service.delete(req.params.id);

      res.json({
        success: true,
        message: "Deleted Successfully",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new HRMISController();