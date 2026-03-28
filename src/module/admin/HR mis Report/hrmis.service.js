const HRMIS = require("./hrmis.model");

class HRMISService {
  async create(data) {
    return await HRMIS.create(data);
  }

  async getAll() {
    return await HRMIS.find().sort({ createdAt: -1 });
  }

  async getById(id) {
    return await HRMIS.findById(id);
  }

  async update(id, data) {
    return await HRMIS.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await HRMIS.findByIdAndDelete(id);
  }
}

module.exports = new HRMISService();