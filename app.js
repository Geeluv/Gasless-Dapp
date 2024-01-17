const cors = require("cors");
const express = require("express");
const { transferAmount } = require("./services/blockchain");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("assets"));
app.use(express.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    try {
        return res.status(200).json({ message: "Welcome to transfers" });
    } catch (error) {
        return res.status(400).json({ error });
    }
});

app.post("/transfer", (req, res) => {
    try {
        const receiver = req.body.receiver;
        const amount = req.body.amount;

        // Validate amount
        if (!amount || receiver.length < 42 || amount > 0.1) {
            return res.status(400).json({
                message: "Invalid input"
            });
        }

        const data = fs.readFileSync(path.join(__dirname, "assets", "address-data.json"), 'utf8');
        let jsonData = JSON.parse(data);

        // Check if the address has already received a transfer
        if (jsonData.addressArray.includes(receiver)) {
            return res.status(400).json({ message: "You have used this faucet already" });
        }

        // Perform the transfer
        const response = transferAmount(receiver, amount);

        // Add the address to the array to prevent future transfers
        jsonData.addressArray.push(receiver);
        const updatedData = JSON.stringify(jsonData, null, 2);

        fs.writeFileSync(path.join(__dirname, "assets", "address-data.json"), updatedData, 'utf8');
        console.log('Data has been added to the array.');
        return res.status(200).json(response);

    } catch (error) {
        console.log(error);
        return res.status(400).json({ error });
    }
});

app.listen(9000, () => {
    console.log("Listening on port 9000");
});
