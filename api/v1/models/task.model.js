const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: String,
    status: String,
    content: String,
    createdBy: String,
    listUser: Array,
    timeStart: Date,
    taskParentId: String,
    timeFinish: Date,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema, "tasks");

module.exports = Task;
