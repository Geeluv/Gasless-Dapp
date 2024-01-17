const cors = require("cors");
const express = require("express");
const { transferAmount } = require("./services/blockchain");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    try {
        return res.status(200).json({ message: "Welcome to transfers" });
    }
    catch (error) {
        return res.status(400).json({ error });
    }
})

app.post("/transfer", async (req, res) => {
    try {
        const receiver = req.body.receiver
        const amount = req.body.amount
        if (!amount || receiver.length < 42) {
            return res.status(400).json({
                message: "invalid input"
            })
        }
        const response = await transferAmount(receiver, amount);
        return res.status(200).json(response);

    } catch (error) {
        return res.status(400).json({ error });
    }
})

app.listen(9000, () => {
    console.log("Listening on port 9000")
})