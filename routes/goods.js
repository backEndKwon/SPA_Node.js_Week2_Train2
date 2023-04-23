const express = require("express");
const router = express.Router();
const Goods = require("../schemas/goods");
const authMiddleware = require("../middlewares/auth-middleware");
const Cart = require("../schemas/cart.js");


////(5)carts에 있던거 가져오기///////////
// localhost:3000/api/carts GET Method
// (5) 장바구니 조회 api
router.get("/goods/cart", authMiddleware, async(req,res) => {
  
  const {userId} = res.locals.user;
  const carts = await Cart.find({userId : userId});
 
  const goodsIds = carts.map((cart) => {
      return cart.goodsId;
  })
 
  const goods = await Goods.find({goodsId: goodsIds});
  // Goods에 해당하는 모든 정보를 가지고 올건데,
  // 만약 goodsIds 변수 안에 존재하는 값일 때에만 조회하라.
  const results = carts.map((cart) => {
      return {
          "quantity": cart.quantity,
          "goods": goods.find((item) => item.goodsId === cart.goodsId),
      }
  })
  res.json({
      "carts": results,
  })
});
//////////////////////////////////////////////////////





///(3) 상품 목록(전체/카테고리별)조회 API////
router.get("/goods", async (req, res) => {
  //query스트링으로 받아서 사용
  const { category } = req.query;
  const goods = await Goods.find(category ? { category } : {} )//삼항연산자
  ////catgory가 존재하면? category를 가져오고, 존재하지않으면? 전체를 조회한다
    .sort("-date")//날짜 내림차순 정렬(최신이 위로)
    .exec();//해당 쿼리 마무리

  //굳이 다시 results값을 생성해서 map돌리는 이유
  //그냥 goods내보내면 배열이기 때문에 맨 뒤에 __v이런거 생겨서
  const results = goods.map((item) => {
    //goods가 배열이기 때문에 map사용가능
    return { //return 까먹지 말기(map안에서 return)
      goodsId: item.goodsId,
      name: item.name,
      price: item.price,
      thumbnailUrl: item.thumbnailUrl,
      category: item.category,
    };
  });
  res.status(200).json({ goods: results });
})
////////////////////////////

///(4) 상품 상세조회 API////
router.get("/goods/:goodsId", async (req, res) => {
  
  const { goodsId } = req.params
  const goods =  await Goods.findOne({ goodsId : goodsId })
  ////catgory가 존재하면? category를 가져오고, 존재하지않으면? 전체를 조회한다
  .sort("-date")//날짜 내림차순 정렬(최신이 위로)
  .exec();//해당 쿼리 마무리

  //goods가 배열이 아니기 때문에 바로 객체할당 가능
  const result = { 
      goodsId: goods.goodsId,
      name: goods.name,
      price: goods.price,
      thumbnailUrl: goods.thumbnailUrl,
      category: goods.category,
    };
    res.status(200).json({ goods: result });
  });

////////////////////////////


/// 장바구니 등록 API /////
router.post("/goods/:goodsId/cart",authMiddleware, async (req, res) => {
  const {userId} = res.locals.user; //밑에꺼 작업후 auth만들고나서 작업
  const { goodsId } = req.params;
  const { quantity } = req.body;

  //사용자 정보(userId)를 가지고 장바구니를 조회
  const existsCarts = await Cart.find({ userId, goodsId });
  if (existsCarts.length) {
    return res.status(400).json({
      success: false,
      errorMessage: "이미 장바구니에 해당하는 상품이 존재합니다.",
    })
  }

  //사용자 정보(userId)를 가지고 장바구니에 넣기
  await Cart.create({ userId, goodsId, quantity });

  res.json({ result: "success" });
})


/// 장바구니 수정 API /////
router.put("/goods/:goodsId/cart", authMiddleware, async (req, res) => {
  const {userId} = req.locals.user;
  
  const { goodsId } = req.params;
  const { quantity } = req.body;

  const existsCarts = await Cart.find({userId, goodsId });
  if (existsCarts.length) {
    await Cart.updateOne(
      { userId, goodsId: goodsId },//해당하는 사용자 정보의 goodsId변경
      { $set: { quantity: quantity } }
    )
  }
  res.status(200).json({ success: true });
})

/// 장바구니 삭제 API /////
router.delete("/goods/:goodsId/cart",authMiddleware , async (req, res) => {
  const {userId} = res.locals.user;
  
  const { goodsId } = req.params;

  const existsCarts = await Cart.find({userId, goodsId });
  if (existsCarts.length) {
    await Cart.deleteOne({ userId, goodsId });
  }

  res.json({ result: "success" });
})

router.post("/goods", async (req, res) => {
  const { goodsId, name, thumbnailUrl, category, price } = req.body;

  const goods = await Goods.find({ goodsId });

  if (goods.length) {
    return res.status(400).json({
      success: false,
      errorMessage: "이미 존재하는 GoodsId입니다."
    });
  }

  const createdGoods = await Goods.create({ goodsId, name, thumbnailUrl, category, price });

  res.json({ goods: createdGoods });
})

module.exports = router;