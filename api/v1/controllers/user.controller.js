const md5 = require("md5");
const User = require("../models/user.model");
const ForgotPassword = require("../models/forgot-password.model");
const sendEmailHelper = require("../../../helpers/sendMail.js");
const generateHelper = require("../../../helpers/generate.js");
// [POST] /api/v1/users/register
module.exports.register = async (req, res) => {
  // Kiểm tra tài khoản tồn tại chưa
  const existEmail = await User.findOne({
    email: req.body.email,
    deleted: false,
  });

  if (existEmail) {
    res.json({
      code: 400,
      message: "Email đã tồn tại!",
    });
    return;
  }
  // END Kiểm tra tài khoản tồn tại chưa
  // Tạo user mới lưu vào db
  const dataUser = {
    fullName: req.body.fullName,
    email: req.body.email,
    password: md5(req.body.password),
    token: generateHelper.generateRandomString(30),
  };
  const user = new User(dataUser);
  await user.save();
  const token = user.token;
  // END Tạo user mới lưu vào db
  res.cookie("token", token);
  res.json({
    code: 200,
    message: "Đăng ký tài khoản thành công!",
    token: token,
  });
};
// [POST] /api/v1/users/login
module.exports.login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const existUser = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!existUser) {
    res.json({
      code: 400,
      message: "Email không tồn tại!",
    });
    return;
  }

  if (md5(password) != existUser.password) {
    res.json({
      code: 400,
      message: "Sai mật khẩu!",
    });
    return;
  }

  const token = existUser.token;
  res.cookie("token", token);
  res.json({
    code: 200,
    message: "Đăng nhập thành công!",
    token: token,
  });
};

// [POST] /api/v1/users/password/forgot
module.exports.forgotPassword = async (req, res) => {
  const email = req.body.email;

  const existUser = await User.findOne({
    email: email,
    deleted: false,
  });

  if (!existUser) {
    res.json({
      code: 400,
      message: "Email không tồn tại!",
    });
    return;
  }
  const otp = generateHelper.generateRandomNumber(6);
  // Việc 1: Lưu email, OTP vào database
  const timeExpire = 1;
  const objectForgotPassword = {
    email: email,
    otp: otp,
    expireAt: Date.now() + timeExpire * 60 * 1000,
  };
  const forgotPassword = new ForgotPassword(objectForgotPassword);
  await forgotPassword.save();
  // Việc 2: Gửi mã OTP qua mail cho người dùng
  const subject = "Lấy lại mật khẩu.";
  const text = `Mã OTP xác thực tài khoản của bạn là: ${otp}. Mã OTP có hiệu lực trong vòng ${timeExpire} phút. Vui lòng không cung cấp mã OTP này với bất kỳ ai.`;
  sendEmailHelper.sendEmail(email, subject, text);

  res.json({
    code: 200,
    message: "Đã gửi mã OTP qua email!",
  });
};
// [POST] /api/v1/users/password/otp
module.exports.otpPassword = async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  const result = await ForgotPassword.findOne({
    email: email,
    otp: otp,
  });

  if (!result) {
    res.json({
      code: 400,
      message: "OTP không hợp lệ",
    });
    return;
  }

  const user = await User.findOne({
    email: email,
  });

  const token = user.token;

  res.json({
    code: 200,
    message: "Xác thực thành công!",
    token: token,
  });
};
// [POST] /api/v1/users/password/reset
module.exports.resetPassword = async (req, res) => {
  const token = req.body.token;
  const password = req.body.password;
  const user = await User.findOne({
    token: token,
  });
  if (md5(password) === user.password) {
    res.json({
      code: 400,
      message: "Vui lòng nhập mật khẩu khác mật khẩu cũ",
    });
    return;
  }
  await User.updateOne(
    {
      token: token,
      deleted: false,
    },
    {
      password: md5(password),
    }
  );

  res.json({
    code: 200,
    message: "Đổi mật khẩu thành công!",
  });
};

// [GET] /api/v1/users/detail/
module.exports.detail = async (req, res) => {
  // Muốn kiểm tra một tính năng đăng nhập mới thực hiện được, phải check qua token
  // const user = await User.findOne({
  //   token: req.cookies.token,
  //   deleted: false,
  // }).select("fullName email");

  res.json({
    code: 200,
    message: "Thành công!",
    user: req.user,
  });
};

// [GET] /api/v1/users/list
module.exports.list = async (req, res) => {
  const users = await User.find({
    deleted: false,
  }).select("fullName email");

  res.json({
    code: 200,
    message: "Thành công!",
    users: users,
  });
};
