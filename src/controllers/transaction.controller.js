const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.service")
const mongoose = require("mongoose")


async function createTransaction(req,res){

    /**
     * 1.Validate request
     */
    const { toAccount , amount , idempotencyKey} = req.body
    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"toAccount , amount , idempotencyKey are required"
        })
    }
    const fromUserAccount = await accountModel.findOne({
        _id:req.user._id
    })
    const fromAccount = fromUserAccount._id
    const toUserAccount = await accountModel.findOne({
        _id:toAccount
    })
    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            mesage:"Inavlid fromAccount or ToAccount"
        })
    }

    /**
     * 2. Validate Idempotency Key
     */
    const isTransactionAlreadyExist = await transactionModel.findOne({
        idempotencykey:idempotencyKey
    })
    if(isTransactionAlreadyExist){
        if(isTransactionAlreadyExist.status === "COMPLETED"){
            return res.status(200).json({
                message:"transaction already processed",
                transaction:isTransactionAlreadyExist
            })
        }
        if(isTransactionAlreadyExist.status === "PENDING"){
            return res.status(200).json({
                message:"transaction is still processing",
            })
        }
        if(isTransactionAlreadyExist.status === "FAILED"){
            return res.status(500).json({
                message:"transaction  processing failed, please retry",
            })
        }
        if(isTransactionAlreadyExist.status === "REVERSED"){
            return res.status(500).json({
                message:"transaction was reversed,please retry",
            })
        }
    }

    /**
     * 3. Check Account Status
     */
    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message:"Both fromAccount and toAccount must be ACTIVE to procees transfer"
        })
    }

    /**
     * 4. Derive Sender balance from Ledger
     */
    const balance = await fromUserAccount.getbalance()
    if(balance < amount){
        return res.status(400).json({
            message:`Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    /**
     * 5. Create Transaction (PENDING)
     */
    let transaction;
    try{

    
    const session = await mongoose.startSession() //mongoose give functionality: ya to saare step (5 to 9) complete kro ya koi bhi mat kro
    session.startTransaction()

    transaction = (await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencykey,
        status:"PENDING"
    }],{session}) )[0]


    /**
     * 6. Create Debit Entry
     */
    const debitLEdgerEntry = await ledgerModel.create([{
        account:fromAccount,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
    }],{session})


    //creating simulation of paise cut gye pr phohoche nhi
    //is dauran firse req daali to dobara pese nhi jaayenge coz idempotency key is same
    await (()=>{
        return new Promise((resolve)=> setTimeout(resolve,15*1000))()
    })

    /**
     * 7. Create Credit Entry
     */
    const creditEdgerEntry = await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
    }],{session})

    /**
     * 8. Mark transaction COMPLETED
     */
    await transactionModel.findByIdAndUpdate(
        {_id:transaction._id},
        {status:"COMPLETED"},
        {session}
    )

    /**
     * 9. COMMIT mongoDb session
     */
    await session.commitTransaction()
    session.endSession()
    } catch(error){
        return res.status(400).json({
            message:"Transaction is pending due to some issue, please retry after some time"
        })
    }
    /**
     * 10. Send email Notification
     */
    await emailService.sendRegistrationEmail(req.user.email,req.user.name , amount , toAccount)
    return res.status(201).json({
        mesage:"Transaction completed succesfully",
        transaction:transaction
    })
}

async function createInitialFundsTransaction(req,res){
    const {toAccount , amount , idempotencyKey} = req.body

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"toAccount , amount , idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id:toAccount
    })
    if(!toUserAccount){
        return res.status(400).json({
            mesage:"Inavlid ToAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        systemUser:true,
        user:req.user._id
    })
    if(!fromUserAccount){
        return res.status(400).json({
            mesage:"System User account not found"
        })
    }

    const fromAccount = fromUserAccount._id

    const session = await mongoose.startSession() 
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount,
        toAccount,
        amount,
        idempotencykey,
        status:"PENDING"
    })
    
     const debitLEdgerEntry = await ledgerModel.create([{
        account:fromAccount,
        amount:amount,
        transaction:transaction._id,
        type:"DEBIT"
    }],{session})


    const creditEdgerEntry = await ledgerModel.create([{
        account:toAccount,
        amount:amount,
        transaction:transaction._id,
        type:"CREDIT"
    }],{session})


    transaction.status = "COMPLETED"
    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        mesage:"Initial funds transaction completed successfully",
        transaction:transaction
    })

}

module.exports = {
    createTransaction,
    createInitialFundsTransaction
}