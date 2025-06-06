const Product = require('../model/product');

module.exports.getAllProducts = (req, res) => {
	const limit = Number(req.query.limit) || 0;
	const sort = req.query.sort == 'desc' ? -1 : 1;

	Product.find()
		.select(['-_id'])
		.limit(limit)
		.sort({ id: sort })
		.then((products) => {
			res.json(products);
		})
		.catch((err) => console.log(err));
};

module.exports.getProduct = (req, res) => {
	const id = req.params.id;

	Product.findOne({
		id,
	})
		.select(['-_id'])
		.then((product) => {
			res.json(product);
		})
		.catch((err) => console.log(err));
};

module.exports.getProductCategories = (req, res) => {
	Product.distinct('category')
		.then((categories) => {
			res.json(categories);
		})
		.catch((err) => console.log(err));
};

module.exports.getProductsInCategory = (req, res) => {
	const category = req.params.category;
	const limit = Number(req.query.limit) || 0;
	const sort = req.query.sort == 'desc' ? -1 : 1;

	Product.find({
		category,
	})
		.select(['-_id'])
		.limit(limit)
		.sort({ id: sort })
		.then((products) => {
			res.json(products);
		})
		.catch((err) => console.log(err));
};

module.exports.addProduct = async (req, res) => {
  if (!req.body) {
    return res.json({
      status: 'error',
      message: 'data is undefined',
    });
  }

  try {
    const productCount = await Product.countDocuments();

    const product = new Product({
      id: productCount + 1,
      title: req.body.title,
      price: req.body.price,
      description: req.body.description,
      image: req.body.image,
      category: req.body.category,
    });

    const savedProduct = await product.save();
    res.json(savedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while saving the product',
      error: err.message,
    });
  }
};

module.exports.editProduct = (req, res) => {
	if (typeof req.body == undefined || req.params.id == null) {
		res.json({
			status: 'error',
			message: 'something went wrong! check your sent data',
		});
	} else {
		res.json({
			id: parseInt(req.params.id),
			title: req.body.title,
			price: req.body.price,
			description: req.body.description,
			image: req.body.image,
			category: req.body.category,
		});
	}
};

module.exports.deleteProduct = async (req, res) => {
	if (req.params.id == null) {
		return res.json({
			status: 'error',
			message: 'product id should be provided',
		});
	}
	
	try {
		const deletedProduct = await Product.findOneAndDelete({ id: req.params.id });
		
		if (!deletedProduct) {
			return res.status(404).json({
				status: 'error',
				message: 'Product not found',
			});
		}
		
		res.json({
			status: 'success',
			message: 'Product has been deleted',
			deletedProduct: deletedProduct
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			status: 'error',
			message: 'An error occurred while deleting the product',
			error: err.message
		});
	}
};
