const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountContoller = require("../controllers/account.controller")

const router = express.Router()

/**
 * -Post /api/accounts/
 *  - create a new account
 * - protected route
 */
router.post("/",authMiddleware.authMiddleware,accountContoller.creatAccountController)


module.exports = router