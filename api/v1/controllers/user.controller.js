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
  console.log(objectForgotPassword);
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