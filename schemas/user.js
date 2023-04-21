const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email : { //이메일 중복불가

        type : String,
        required : true,
        unique : true, // 
    },
    nickname:{
        type : String,
        required : true,
        required : true,
    },
    password :{
        type : String,
        required : true,
        
    }
});

//UserId값을 사용할수잇도록 vitrual값을 넣어준다.
//그 값을 언제 넣어주냐? get할때 
//get할대 this(여기에) _id를 넣어준다.
UserSchema.virtual("userId").get(function(){
    return this._id.toHexString();
});
//get을 받으면 virtual을 이용해서 userId라는 변수명에 -_id를 생성시켜준다
UserSchema.set("toJSON",{
virtuals : true, //json형태로 가공할때, userId를 출력해준다.
});


module.exports = mongoose.model("User",UserSchema)