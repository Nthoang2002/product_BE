const ProductCategory = require("../../models/product-category.model");

const systemConfig = require("../../config/system.js")

const createTreeHelper = require("../../helpers/createTree.js")

// [GET] /admin/product-category
module.exports.index = async (req, res) => {
    let find = {
        deleted: false,
    }


    const records = await ProductCategory.find(find);
    
    const newRecords = createTreeHelper.tree(records);

    res.render("admin/pages/products-category/index", {
        pageTitle: "Danh mục sản phẩm",
        records: newRecords
    });
}

// [GET] /admin/product-category/create
module.exports.create = async (req, res) => {
    let find = {
        deleted: false,
    }

    const records = await ProductCategory.find(find);

    const newRecords = createTreeHelper.tree(records);
    console.log((newRecords))


    res.render("admin/pages/products-category/create", {
        pageTitle: "Tạo danh mục sản phẩm",
        records: records
    });
}

// [POST] /admin/products-category/create
module.exports.createPost = async (req, res) => {

    //position
    if(req.body.position == ""){
        const count = await ProductCategory.countDocuments();
        req.body.position = count + 1;
    }else{
        req.body.position = parseInt(req.body.position);
    }

    const product = new ProductCategory(req.body);
    await product.save();

    res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    
}

// [GET] /admin/product-category/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await ProductCategory.findOne({
            _id: id,
            deleted: false
        });

        const records = await ProductCategory.find({
            deleted: false
        });

        const newRecords = createTreeHelper.tree(records);

        res.render("admin/pages/products-category/edit", {
            pageTitle: "Chỉnh sửa danh mục sản phẩm",
            data: data,
            records: newRecords
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products-category`);
    }
    
}

// [PATCH] /admin/product-category/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;
    req.body.position = parseInt(req.body.position);

    await ProductCategory.updateOne({ _id: id }, req.body);

    res.redirect("back");
}



