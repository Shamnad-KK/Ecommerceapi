const Admin = require('../Model/admin')
const bcrypt = require('bcryptjs');

const { generateJWT } = require('../utils/jwt');
const Category = require('../Model/category');
const SubCategory = require('../Model/subCategory');

const { cloudinary } = require('../utils/clodinary');
const { isValidURL } = require('../utils/utils')

module.exports = {
    login: async (req, res) => {
        const { email, password } = req.body
        try {
            const admin = await Admin.findOne({ email: email });
            if (!admin) return res.status(404).json({ message: "admin not found" });

            const passwordMatch = await bcrypt.compare(password, admin.password);
            if (!passwordMatch) return res.status(401).json({ message: "Password doesnt match" });

            return res.status(200).json({
                message: "success",
                token: generateJWT(admin._id, "admin")
            })
        } catch (error) {
            a
            return res.status(500).json({ message: "Login failed" })
        }
    },

    // {category : name , icon : url/image} ======> request body
    addCategory: async (req, res) => {
        let { category, icon } = req.body;

        category = category.toUpperCase()
        console.log(req.body);
        try {
            const exist = await Category.findOne({ category });
            if (exist) return res.status(403).json({ message: "Category already exists" });

            let iconUrl = icon;

            //if icon image is not a url upload image to cloudinary
            if (!isValidURL(icon)) {
                const uploadResult = await cloudinary.uploader.upload(icon, {
                    upload_preset: "category"
                })
                iconUrl = uploadResult.url;
            }

            const categoryDetails = await Category.create({ category, icon: iconUrl });
            return res.status(201).json({
                message: "category added",
                category: {
                    id: categoryDetails.id,
                    name: categoryDetails.category,
                    iconUrl: categoryDetails.icon
                }
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "failed to add category",
                error: error
            })
        }
    },

    // {category : name , icon : url/image} ===> request body
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: "cant get categories" });
        }
    },

    // id : number =======> request params 
    deleteCategory: async (req, res) => {
        const categoryId = req.params.id
        try {
            const category = await Category.findOne({ id: categoryId });
            if (!category) return res.status(404).json({ message: "requested category to delete is not found" });

            await Category.deleteOne({ id: categoryId });
            res.status(204).json('success')
        } catch (error) {
            res.status(500).json({ message: "cant delete category" });
        }
    },

    // id : number =======> request params 
    getOneCategory: async (req, res) => {
        const { id } = req.params;
        try {
            const category = await Category.findOne({ id })
            if (!category) return res.status(404).json({ message: "requested category not found" })

            delete category._id
            res.status(200).json(category);
        } catch (error) {
            res.status(500).json(error)
        }
    },


    // <<<<<<<<<<<<<<<SUBCATEOGIRES>>>>>>>>>>>>>>>>>>>>>>
    addSubCategory: async (req, res) => {
        let { subCategory } = req.body;

        subCategory = subCategory.toUpperCase()
        console.log(req.body);
        try {
            const exist = await SubCategory.findOne({ subCategory });
            if (exist) return res.status(403).json({ message: "sub-category already exists" });

            const subCategoryDetails = await SubCategory.create({ subCategory});
            return res.status(201).json({
                message: "sub-category added",
                subCategory: {
                    id: subCategoryDetails.id,
                    name: subCategoryDetails.category,
                    iconUrl: subCategoryDetails.icon
                }
            })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "failed to add category",
                error: error
            })
        }
    }
}