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


/**
 * -GET  /api/accounts
 * -Get all accounts of logged-in user
 * -Protected Route
 */
router.get("/",authMiddleware.authMiddleware,accountContoller.getUserAcountController)

/**
 * GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId",authMiddleware.authMiddleware,accountContoller.getUserAcountBalanceController)

module.exports = router