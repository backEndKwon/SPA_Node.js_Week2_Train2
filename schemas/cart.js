const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  //(5)특정사용자의 장바구니 조회를 위해
  userId : {
    type : String,
    required : true //무조건 있는 사람이기 때문에
  },
  goodsId: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model("Cart", cartSchema);