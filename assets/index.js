const address = document.querySelector("#address");
const amount = document.querySelector("#amount");
const sendBtn = document.querySelector("button");
const displayTx = document.querySelector(".displaytx");

fetchTxns();

sendBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    sendBtn.innerText = "Transferring..."
    const response = await fetch("http://localhost:9000/transfer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ receiver: address.value, amount: Number(amount.value) })
    });
    if (response.ok) {
        const txDetails = await response.json();
        console.log(txDetails)
        alert("Transfer successful");
        let getTxDetails = fetchTxns();
        if (getTxDetails) {
            getTxDetails.push(txDetails);
            localStorage.setItem("Gasless-tx", JSON.stringify(getTxDetails))
        } else {
            localStorage.setItem("Gasless-tx", JSON.stringify([txDetails]))
        }

    } else {
        alert("Transfer failed")
    }
    sendBtn.innerText = "Send"
    window.location.reload()
})

function fetchTxns() {
    const allTxns = JSON.parse(localStorage.getItem("Gasless-tx"));
    if (allTxns) {
        displayTx.innerHTML = allTxns.map(txn => (`
        <div>
            <span><b>status</b>=> ${txn.status} ✅</span>
            <span><b>tx-hash</b>=> ${(txn.hash).slice(0, 40) + ". . ."}</span>
            <span><b>amount</b>=> ${(txn.transferAmount).slice(0, 6) + " MATIC"}</span>
            <span><b>receiver</b>=> ${txn.to}</span>
            <span><b>timestamp</b>=> ${(new Date(txn.timestamp * 1000)).toLocaleTimeString("default")}</span>
            <span><b>explorer</b>=> <a href=${txn.explore}>🔗 Go to explorer</a></span>
        </div>
        `
        )).join("")
    }
    return allTxns;
}


