const Product = require("../../models/product.model")

const systemConfig = require("../../config/system.js")

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
// const { Query } = require("mongoose");

// [GET] /admin/products
module.exports.index = async (req, res) => {

    const filterStatus = filterStatusHelper(req.query);
    // ....

    let find = {
        deleted: false
    }
    if (req.query.status) {
        find.status = req.query.status
    }

    const objectSearch = searchHelper(req.query);

    if (objectSearch.regex) {
        find.title = objectSearch.regex;
    }



    // Pagination phân trang
    const countProducts = await Product.countDocuments(find);
    let objectPagination = paginationHelper(
        {
            currentPage: 1,
            limitItem: 4
        },
        req.query,
        countProducts
    );
    // End Pagination


    const products = await Product.find(find).sort({position: "desc"}).limit(objectPagination.limitItem).skip(objectPagination.skip);
    // console.log(products)

    res.render("admin/pages/products/index", {
        pageTitle: "Trang danh sách sản phẩm",
        products: products,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
}

// [PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    await Product.updateOne({ _id: id }, { status: status })
    req.flash('success', 'cập nhật trạng thái thành công!');

    res.redirect("back")
}; //khi click nó sẽ chuyển về trang trước đó 


// [PATCH] /admin/products/change-multi/
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    switch (type) {
        case "active":
            await Product.updateMany({ _id: { $in: ids } }, { status: "active" });
            req.flash('success', `cập nhật trạng thái ${ids.length} sản phẩm thành công!`);
            break;
        case "inactive":
            await Product.updateMany({ _id: { $in: ids } }, { status: "inactive" });
            req.flash('success', `cập nhật trạng thái ${ids.length} sản phẩm thành công!`);
            break;
        case "delete-all":
            await Product.updateMany({ _id: { $in: ids } }, {
                deleted: "true",
                deleteAt: new Date(),
            });
            req.flash('success', `Đã xóa ${ids.length} sản phẩm thành công!`);
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-");
                position = parseInt(position);

                await Product.updateMany({ _id: id }, {
                    position: position
                });
            }
            req.flash('success', `Đã đổi vị trí ${ids.length} sản phẩm thành công!`);
            break;
        default:
            break;
    }
    res.redirect("back"); //khi click nó sẽ chuyển về trang trước đó 
    console.log(ids.length);
    // res.send("ok");
}

// [DELETE ] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id  = req.params.id;
    // const ids = req.body.ids.split(", ");
    // await Product.deleteOne({ _id: id }) // xóa vĩnh viễn
    await Product.updateOne({ _id: id }, {
        deleted: true,
        deleteAt: new Date()
    }); //xóa mềm,vẫn lưu trong database
    // req.flash('success', `Đã xóa ${ids.length} sản phẩm thành công!`);
    res.redirect("back")
}; //khi click nó sẽ chuyển về trang trước đó 


// [GET] /admin/products/create
module.exports.create = async (req, res) => {

    res.render("admin/pages/products/create", {
        pageTitle: "Thêm mới sản phẩm"
    });
}

// [POST] /admin/products/create
module.exports.createPost = async (req, res) => {

    // chuyển về kiểu number
    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);

    //position
    if(req.body.position == ""){
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    }else{
        req.body.position = parseInt(req.body.position);
    }

    if(req.file){
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }

    const product = new Product(req.body);
    await product.save();

    res.redirect(`${systemConfig.prefixAdmin}/products`);
    // console.log(req.body);
}


// [GET] /admin/products/edit/:id
module.exports.edit = async (req, res) => {

    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };
    
        const product = await Product.findOne(find)
    
        res.render("admin/pages/products/edit", {
            pageTitle: "Chỉnh sửa sản phẩm",
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
    
}

// [PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {

    const id = req.params.id;

    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);

    if(req.file){
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }

    try {
        await Product.updateOne({ _id: id }, req.body);
        req.flash('success', 'cập nhật thành công!');

    } catch (error) {
        // res.redirect(`${systemConfig.prefixAdmin}/products`);
        req.flash('error', 'cập nhật thất bại!');

    }

    res.redirect("back");
}




// [GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {

    try {
        const find = {
            deleted: false,
            _id: req.params.id
        };
    
        const product = await Product.findOne(find)

        console.log(product)
    
        res.render("admin/pages/products/detail", {
            pageTitle: "Chi tiết sản phẩm",
            product: product
        });
    } catch (error) {
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
    
}