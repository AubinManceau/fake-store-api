const Cart = require('../model/cart');

module.exports.getAllCarts = (req, res) => {
	const limit = Number(req.query.limit) || 0;
	const sort = req.query.sort == 'desc' ? -1 : 1;
	const startDate = req.query.startdate || new Date('1970-1-1');
	const endDate = req.query.enddate || new Date();

	console.log(startDate, endDate);

	Cart.find({
		date: { $gte: new Date(startDate), $lt: new Date(endDate) },
	})
		.select('-_id -products._id')
		.limit(limit)
		.sort({ id: sort })
		.then((carts) => {
			res.json(carts);
		})
		.catch((err) => console.log(err));
};

module.exports.getCartsbyUserid = (req, res) => {
	const userId = req.params.userid;
	const startDate = req.query.startdate || new Date('1970-1-1');
	const endDate = req.query.enddate || new Date();

	console.log(startDate, endDate);
	Cart.find({
		userId,
		date: { $gte: new Date(startDate), $lt: new Date(endDate) },
	})
		.select('-_id -products._id')
		.then((carts) => {
			res.json(carts);
		})
		.catch((err) => console.log(err));
};

module.exports.getSingleCart = (req, res) => {
	const id = req.params.id;
	Cart.findOne({
		id,
	})
		.select('-_id -products._id')
		.then((cart) => res.json(cart))
		.catch((err) => console.log(err));
};

module.exports.addCart = async (req, res) => {
  if (!req.body) {
    return res.json({
      status: 'error',
      message: 'data is undefined',
    });
  }

  try {
    const cartCount = await Cart.countDocuments();

    const cart = new Cart({
      id: cartCount + 1,
      userId: req.body.userId,
      date: req.body.date,
      products: req.body.products,
    });

    const savedCart = await cart.save();
    res.json(savedCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      message: 'Error while creating cart',
      error: err.message,
    });
  }
};

module.exports.editCart = async (req, res) => {
	if (!req.body || req.params.id == null) {
		return res.json({
			status: 'error',
			message: 'something went wrong! check your sent data',
		});
	}
	
	try {
		const updatedCart = await Cart.findOneAndUpdate(
			{ id: req.params.id },
			{
				userId: req.body.userId,
				date: req.body.date,
				products: req.body.products,
			},
			{ new: true }
		).select('-_id -products._id');

		if (!updatedCart) {
			return res.status(404).json({
				status: 'error',
				message: 'Cart not found',
			});
		}
		
		res.json(updatedCart);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			status: 'error',
			message: 'Error while updating cart',
			error: err.message,
		});
	}
};

module.exports.deleteCart = (req, res) => {
	if (req.params.id == null) {
		return res.json({
			status: 'error',
			message: 'cart id should be provided',
		});
	}
	
	Cart.findOneAndDelete({ id: req.params.id })
		.select('-_id -products._id')
		.then((deletedCart) => {
			if (!deletedCart) {
				return res.status(404).json({
					status: 'error',
					message: 'Cart not found',
				});
			}
			res.json({
				status: 'success',
				message: 'Cart deleted successfully',
				deletedCart: deletedCart
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({
				status: 'error',
				message: 'Error while deleting cart',
				error: err.message
			});
		});
};
