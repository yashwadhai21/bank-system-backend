const mongoose = require("mongoose")

const ledgerSchema = new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Ledger must be s=associated with an accont"],
        index:true,
        immutable:true
    },
    ammount:{
        type:Number,
        required:[true,"AMount is required for creating a ledger entry"],
        immuatable:true
    },
    transaction:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"transaction",
            required:[true,"Ledger must be associated with a tranc=saction"],
            index:true,
            immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"type can be either CREDIT or DEBIT"
        },
        required:[true,"Ledger type is required"],
        immutable:true
    }
})

function preventLedgerModification(){
    throw new Error("Ledger entries are immutable and cannot be modified or deleted")
}

ledgerSchema.pre('findOneAndUpdate',preventLedgerModification)
ledgerSchema.pre('updateOne',preventLedgerModification)
ledgerSchema.pre('updateMany',preventLedgerModification)
ledgerSchema.pre('findOneAndDelete',preventLedgerModification)
ledgerSchema.pre('deleteOne',preventLedgerModification)
ledgerSchema.pre('deleteMany',preventLedgerModification)
ledgerSchema.pre('remove',preventLedgerModification)
ledgerSchema.pre('findOneAndReplace',preventLedgerModification)


const ledgeModel = mongoose.model('Ledger',ledgerSchema)

module.exports = ledgeModel