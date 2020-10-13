// Registration Credentials
const { registerUser } = require("./dist/index");
const registerinfo = require("./dist/registerinfo");

registerUser({ ...registerinfo });