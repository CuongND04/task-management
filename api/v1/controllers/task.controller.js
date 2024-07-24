const paginationHelper = require("../../../helpers/pagination");
const searchHelper = require("../../../helpers/search");
const Task = require("../models/task.model");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
  // lọc theo trạng thái
  const find = { deleted: false };
  if (req.query.status) {
    // nếu có status sau dấu "?"
    find.status = req.query.status;
  }
  // Tìm kiếm
  const objectSearch = searchHelper(req.query);
  if (objectSearch.regex) {
    find.title = objectSearch.regex;
  }
  // Phân trang
  let initPagination = {
    currentPage: 1,
    limitItems: 2,
  };
  const countTasks = await Task.countDocuments(find);
  let objectPagination = paginationHelper(
    initPagination,
    req.query,
    countTasks
  );

  // Sắp xếp
  const sort = {};

  if (req.query.sortKey && req.query.sortValue) {
    // chỗ này có "[]" vì tên thuộc tính của object có thể có nhiều hơn 2 từ
    sort[req.query.sortKey] = req.query.sortValue;
  }

  const tasks = await Task.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);

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

// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;

    await Task.updateOne(
      {
        _id: id,
      },
      {
        status: status,
      }
    );

    res.json({
      code: 200,
      message: "Cập nhật trạng thái thành công!",
    });
  } catch (error) {
    // console.log(error);
    res.json({
      code: 400,
      message: "Không tồn tại bản ghi!",
    });
  }
};

// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, key, value } = req.body;

    const listStatus = ["initial", "doing", "finish", "pending", "notFinish"];
    switch (key) {
      case "status":
        await Task.updateMany(
          {
            _id: { $in: ids },
          },
          {
            status: value,
          }
        );
        res.json({
          code: 200,
          message: "Đổi trạng thái thành công!",
        });
        break;
      default:
        res.json({
          code: 400,
          message: `Trạng thái không hợp lệ!`,
        });
        break;
    }
  } catch (error) {}
};

// [POST] /api/v1/tasks/create
module.exports.create = async (req, res) => {
  try {
    const task = new Task(req.body);
    const data = await task.save();

    res.json({
      code: 200,
      message: "Tạo công việc thành công!",
      data: data,
    });
  } catch (error) {
    res.json({
      code: 400,
      message: `Không hợp lệ!`,
    });
  }
};

// [PATCH] /api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    await Task.updateOne(
      {
        _id: id,
      },
      data
    );

    res.json({
      code: 200,
      message: "Cập nhật công việc thành công!",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: `Không hợp lệ!`,
    });
  }
};
// [DELETE] /api/v1/tasks/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    // xóa mềm, vẫn lưu ở database
    await Task.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
        deletedAt: new Date(),
      }
    );

    res.json({
      code: 200,
      message: "Xóa công việc thành công!",
    });
  } catch (error) {
    res.json({
      code: 400,
      message: `Không hợp lệ!`,
    });
  }
};
