const express =  require('express');
const router = express.Router();

const controller = require("../../controllers/client/product.controller");

router.get("/", controller.index);

// Chi tiết sản phẩm
router.get("/:slug", controller.detail);

module.exports = router;


