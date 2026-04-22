const Interview = require("./interview.model");
const { uploadMulterFile } = require("../../../core/config/cloudinary");

class InterviewService {
  async createInterview(data, file) {
    if (file) {
      data.candidateResume = await uploadMulterFile(file, {
        folder: "bitmax/interviews/resumes",
        resource_type: "auto",
      });
    }

    return await Interview.create(data);
  }

  async getAllInterviews() {
    return await Interview.find().sort({ createdAt: -1 });
  }

  async getInterviewById(id) {
    return await Interview.findById(id);
  }

  async updateInterview(id, data, file) {
    if (file) {
      data.candidateResume = await uploadMulterFile(file, {
        folder: "bitmax/interviews/resumes",
        resource_type: "auto",
      });
    }

    return await Interview.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async deleteInterview(id) {
    return await Interview.findByIdAndDelete(id);
  }

  // 👉 Add Interview Round
  async addInterviewRound(id, roundData) {
    return await Interview.findByIdAndUpdate(
      id,
      {
        $push: { interviewRounds: roundData },
      },
      { new: true }
    );
  }

  // 👉 Update Round (by index)
  async updateInterviewRound(id, index, roundData) {
    const interview = await Interview.findById(id);

    if (!interview) throw new Error("Interview not found");

    interview.interviewRounds[index] = roundData;
    return await interview.save();
  }

  // 👉 Delete Round
  async deleteInterviewRound(id, index) {
    const interview = await Interview.findById(id);

    if (!interview) throw new Error("Interview not found");

    interview.interviewRounds.splice(index, 1);
    return await interview.save();
  }
}

module.exports = new InterviewService();
