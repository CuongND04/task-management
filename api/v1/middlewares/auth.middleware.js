const User = require("../models/user.model");

module.exports.requireAuth = async (req, res, next) => {
  // kiểm tra xem người ta có gửi lên header kèm token hay không
  if (!req.headers.authorization) {
    res.json({
      code: 400,
      message: "Vui lòng gửi kèm token",
    });
    return;
  }
  // lấy token từ chuỗi authorization
  const token = req.headers.authorization.split(" ")[1];
  // tìm xem có tài khoản nào có token đấy không
  const user = await User.findOne({
    token: token,
    deleted: false,
  }).select("fullName email");

  if (!user) {
    res.json({
      code: 400,
      message: "Token không hợp lệ",
    });
    return;
  }
  // đặt user làm biến toàn cục
  req.user = user;
  next();
};
