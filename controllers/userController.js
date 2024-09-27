const User = require("../models/User");
const HandlerFactory = require("./handlerFactory");

const userHandlers = new HandlerFactory(User, "user");

exports.getAllUsers = userHandlers.getAll();
exports.getUser = userHandlers.getOne();
exports.createUser = userHandlers.createOne();
exports.updateUser = userHandlers.updateOne(["name", "email"]);
exports.deleteUser = userHandlers.deleteOne();
