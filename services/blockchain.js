const { ethers } = require("ethers");
require("dotenv").config();

const fromWei = (num) => ethers.utils.formatEther(num);
const toWei = (num) => ethers.utils.parseEther(num.toString());

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const transferAmount = async (receiver, amount) => {
    return new Promise(async (resolve, reject) => {
        const balance = await provider.getBalance(wallet.address);

        if (balance.lt(toWei(amount))) {
            return reject({
                status: 400,
                message: "Insufficient balance to transfer",
            })
        }

        let transaction = {
            to: receiver,
            gasPrice: await provider.getGasPrice(),
            gasLimit: 21000,
            value: toWei(amount),
        }

        try {
            console.log("Starting...");
            const estimatedCost = await calculateTotalCost(provider, transaction)

            transaction = {
                to: receiver,
                gasPrice: await provider.getGasPrice(),
                gasLimit: 21000,
                value: toWei((amount - fromWei(estimatedCost)).toString()),
            }

            const signedTransaction = await wallet.sendTransaction(transaction);
            await signedTransaction.wait();
            const txReceipt = await provider.getTransactionReceipt(signedTransaction.hash)
            const block = await provider.getBlock(txReceipt.blockNumber);
            console.log("Completed...");

            resolve({
                ...signedTransaction,
                status: "Transfer succeeded",
                gasPrice: fromWei(transaction.gasPrice),
                gasLimit: transaction.gasLimit,
                totalGas: fromWei(estimatedCost),
                transferAmount: (amount - fromWei(estimatedCost)).toString(),
                explore: process.env.CHAIN_URL + signedTransaction.hash,
                timestamp: block.timestamp
            })

        } catch (error) {
            reject({ ...error, status: 400 })
        }
    })
}

const calculateTotalCost = async (provider, transaction) => {
    try {
        const gasLimit = await provider.estimateGas(transaction)
        return gasLimit;
    } catch (error) {
        console.log("Error estimating gas price", error);
        return null;
    }
}

module.exports = { transferAmount }