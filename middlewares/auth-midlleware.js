const jwt = require("jsonwebtoken");
const User = require("../schemas/user");
module.exports = async (req, res, next) => {
    const { authorization } = req.cookies;
    //req.cookies는 쿠키정보를 객체형태로 가져온다.

    //만약 authorization이 존재하지않으면(쿠키가 존재하지 않았을때는 undefined)
    //그렇게 되면 오류발생되니 없을대는 무조건 빈 문자열로 되게끔 만들어줌
    const [authType, authToken] = (authorization ?? "").split(" ");
    //TOKEN이 bearer형태인데 그 형태가
    // => Bearer 앞앞앞.중간중간.뒤뒤뒤 이런형식이니까 split으로 나눠서생각한다. 
    //=> Bearer(타입)과 뒷값(앞앞.중간중간.뒤뒤)을 따로 볼수있게 세팅
    ///authorization변수가 undefined거나 null값일 경우인 조건을 구분하기 위해 "널 병합 연산자" ??를 사용한 것


    //1. authType이 Bearer 값인지 확인
    //atuhToken 검증
    //Bearer만 보내고 authToken이 비어있을수도있음(안보내졌을때 그렇게됨)
    if (authType !== "Bearer" || !authToken) {
        res.status(400).json({
            errorMessage: "로그인 후에 이용할 수 있는 기능입니다."

        });
        return;
    }


    //JWT검증
    try {
        //1.authToken 만료 여부 검증 = jwt의 verify로 검증
        //2.authToken이 서버가 발급한 토큰이 맞는지 검증 = 이전에 login api구현때 설정한 customized-secret-key로 검증
        /////routes폴더의 auth.js(로그인 구현 페이지/user는 회원가입페이지 )
        const { userId } = jwt.verify(authToken, "customized-secret-key")//1과 2 검증완료



        //3.authToken에 있는 userId에 해당하는 사용자가 실제 DB에 존재하는지 확인
        const user = await User.findById(userId);
        res.locals.user = user //해당하는 user값을 locals.user에 넣는다.
        ///res.locals.user은 미들웨어 다음으로 데이터를 전달해주기 위해서 넣어준거임
        //즉 그냥 res.locals.user라는 곳에 데이터를 할당한다고 보면됨(아직 이해못해도괜찮)
        ///res.locals는 Express에서 제공하는 변수로, 특정 요청에서만 유효한 데이터를 저장하고 전달하는데 사용됩니다.
        ////이후에 이 사용자의 정보를 다른 미들웨어나 라우터에서 사용할 경우, 해당 정보를 res.locals.user에서 가져와서 사용할 수 있습니다.
        ////즉슨, 나중에 게시글이나 댓글같은거 만들때 이 유효한 user값으로 활용한다는 것임


        next(); //이 미들웨어 다음으로 보낸다.
    } catch (error) {
        console.error(error);//이렇게 하면 사용자 인증에 실패한 다른사용자들을 확인할수있다.
        //하지만 이렇게 하면 나중에 사람 많아졌을대 관리 힘들어짐
        res.status(400).json({ errorMessage: "로그인 후에 이용할 수 있는 기능입니다." });
        return;
    }
}