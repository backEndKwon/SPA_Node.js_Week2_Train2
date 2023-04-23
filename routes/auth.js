const express = require("express");
const router = express.Router();
const User = require("../schemas/user")
const jwt = require("jsonwebtoken")//jsonwebtoken 라이브러리 사용하려고


//(2)로그인 API( (1)은 회원가입(users))
router.post('/auth',async(req,res)=>{
    const {email, password} = req.body;
//이메일이 일치하는 유저를 찾기
    const user = await User.findOne({email});
    //1.이메일에 일치하는 유저가 존재하지 않거나,
    //2.유저를 찾았지만, 유저의 비밀번호와 입력한 비밀번호가 다를경우
    if(!user || user.password !== password){
        res.status(400).json({
            errorMessage : "로그인에 실패하였습니다."
        });
        return; //다음단계 막아주기
    }

//jwt를 생성
const token = jwt.sign({userId : user.userId}, "customized-secret-key")//userId에 user안에있는 userId를 할당할거다

res.cookie("Authorization",`Bearer ${token}`);
//Authorizaion이름 형태로 전달할건데 Bearer 타입으로 token을 전달한다.
//왜 cookie값을 Bearer타입으로 정하는지는 찾아보기

res.status(200).json({token});


});

module.exports = router;