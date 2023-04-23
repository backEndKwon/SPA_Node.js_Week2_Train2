// routes/users.js

const express = require("express");
const router = express.Router();
const User = require("../schemas/user");

//사용자인증 미들웨어
const authMiddleware = require("../middlewares/auth-middleware")

// (2) 내 정보조회 API

router.get("/users/me", authMiddleware, async(req,res)=>{
///사용자가 get으로users/me에 들어왔다 authMiddleware에서 인증거친 후 req,res진행
const {email, nickname} = res.locals.user;
res.status(200).json({
  user : {
    email : email,
    nickname : nickname
  }
});


});


// (1) 회원가입 API
router.post("/users", async (req, res) => {
  const { email, nickname, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(400).json({
      errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
    });
    return;
  }

  // email 또는 nickname이 동일한 데이터가 있는지 확인하기 위해 가져온다.
  const existsUsers = await User.findOne({
    $or: [{ email }, { nickname }],
  });
  if (existsUsers) {
    // NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않습니다.
    res.status(400).json({
      errorMessage: "이메일 또는 닉네임이 이미 사용중입니다.",
    });
    return;
  }

  const user = new User({ email, nickname, password });
  await user.save();

  res.status(201).json({});
});


module.exports = router;