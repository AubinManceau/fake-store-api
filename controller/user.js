const User = require('../model/user');

module.exports.getAllUser = (req, res) => {
	const limit = Number(req.query.limit) || 0;
	const sort = req.query.sort == 'desc' ? -1 : 1;

	User.find()
		.select(['-_id'])
		.limit(limit)
		.sort({
			id: sort,
		})
		.then((users) => {
			res.json(users);
		})
		.catch((err) => console.log(err));
};

module.exports.getUser = (req, res) => {
	const id = req.params.id;

	User.findOne({
		id,
	})
		.select(['-_id'])
		.then((user) => {
			res.json(user);
		})
		.catch((err) => console.log(err));
};

module.exports.addUser = async (req, res) => {
	if (!req.body) {
		return res.json({
		status: 'error',
		message: 'data is undefined',
		});
	}

	try {
		const userCount = await User.countDocuments();

		const user = new User({
		id: userCount + 1,
		email: req.body.email,
		username: req.body.username,
		password: req.body.password,
		});

		const savedUser = await user.save();
		res.json(savedUser);
	} catch (err) {
		console.error(err);
		res.status(500).json({
		status: 'error',
		message: 'Error while creating user',
		error: err.message,
		});
	}
};

module.exports.editUser = (req, res) => {
	if (typeof req.body == undefined || req.params.id == null) {
		res.json({
			status: 'error',
			message: 'something went wrong! check your sent data',
		});
	} else {
		res.json({
			id: parseInt(req.params.id),
			email: req.body.email,
			username: req.body.username,
			password: req.body.password,
		});
	}
};

module.exports.deleteUser = (req, res) => {
	if (req.params.id == null) {
		return res.json({
			status: 'error',
			message: 'user id should be provided',
		});
	}

	User.deleteOne({ id: req.params.id })
		.then((result) => {
			if (result.deletedCount === 0) {
				return res.status(404).json({
					status: 'error',
					message: 'User not found',
				});
			}
			res.json({
				status: 'success',
				message: 'User deleted successfully',
			});
		})
		.catch((err) => {
			console.error(err);
			res.status(500).json({
				status: 'error',
				message: 'Error deleting user',
				error: err.message,
			});
		});
};
