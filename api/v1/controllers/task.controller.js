const Task = require("../models/task.model");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
  // lọc theo trạng thái
  const find = { deleted: false };
  if (req.query.status) {
    // nếu có status sau dấu "?"
    find.status = req.query.status;
  }
  // Sắp xếp
  const sort = {};

  if (req.query.sortKey && req.query.sortValue) {
    // chỗ này có "[]" vì tên thuộc tính của object có thể có nhiều hơn 2 từ
    sort[req.query.sortKey] = req.query.sortValue;
  }

  const tasks = await Task.find(find).sort(sort);

  res.json(tasks);
};

// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
  const id = req.params.id;

  const task = await Task.findOne({
    _id: id,
    deleted: false,
  });

  res.json(task);
};
