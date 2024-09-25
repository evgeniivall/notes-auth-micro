const User = require("../models/User");
const HanlderFactory = require("./handlerFactory");

const userHandlers = new HanlderFactory(User, "user");

exports.getAllUsers = userHandlers.getAll();
exports.getUser = userHandlers.getOne();
exports.createUser = userHandlers.createOne();
exports.updateUser = userHandlers.updateOne(["name", "email"]);
exports.deleteUser = userHandlers.deleteOne();
