const orderItem = document.getElementById("orderitem");
const orderQuantity = document.getElementById("orderquantity");
const header2 = document.getElementById("contractaddress");
var address = "0x9b6938B30aB1260Ce52A37368cF5381f1F2Ab9e4";

document.addEventListener("DOMContentLoaded", async function (event) {
  web3 = new Web3("HTTP://127.0.0.1:7545");
  contract = new web3.eth.Contract(abi, address);
  await getAccounts();
  await checkIfAddr();
});

document.getElementById("revealcontractaddress").onclick = () => {
  header2.innerText = "Contract address: " + address;
  header2.style = "margin: 0px;";
  document.getElementById("revealcontractaddress").style = "display: none;";
};

async function getCourierAddr(){
    const courierAddr = await contract.methods.returnCourier().call();
    return courierAddr;
}

async function getOwnerAddr(){
    const ownerAddr = await contract.methods.returnOwner().call();
    return ownerAddr;
}

const selectedAccount = document.getElementById("selectedAccount");

async function getAccounts() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const currentAccount = accounts[0];
  const ownerAddr = await getOwnerAddr();
  const courierAddr = await getCourierAddr();

  if (ownerAddr.toLowerCase() == currentAccount) {
    selectedAccount.innerHTML = "Selected account (owner): " + currentAccount;
  } else if(courierAddr.toLowerCase()== currentAccount) {
    selectedAccount.innerHTML = "Selected account (courier): " + currentAccount;
  } else {
    selectedAccount.innerHTML = "Selected account (buyer): " + currentAccount; 
  }
  return currentAccount;
}

const sellerInterface = document.getElementById("sellerInterface");

const buyerInterface = document.getElementById("buyerInterface");

const courierInterface = document.getElementById("courierInterface");

async function checkIfAddr() {
  const curAcc = await getAccounts();
  const ownerAddr = await getOwnerAddr();
  const courierAddr = await getCourierAddr();

  sellerInterface.style = "Display: none;";
  courierInterface.style = "Display: none;";
  buyerInterface.style = "Display: none;";

  if (courierAddr.toLowerCase() == curAcc.toLowerCase()) {
    courierInterface.style = "Display: inherit;";
  } else if (ownerAddr.toLowerCase() == curAcc.toLowerCase()) {
    sellerInterface.style = "Display: inherit;";
  } else {
    buyerInterface.style = "Display: inherit;";
  }
}

const sendOrder = document.getElementById("sendOrder");
const sendPayment = document.getElementById("sendPayment");
const confirmDelivery = document.getElementById("confirmDelivery");

confirmDelivery.onclick = async () => {
  const invoiceIndex = document.getElementById("invoiceIndex");
  const timeStamp = document.getElementById("timeStamp");
  const currentAccount = await getAccounts();

  await contract.methods
    .delivery(invoiceIndex.value, timeStamp.value)
    .send({ from: currentAccount })
    .on("transactionHash", (hash) => {
      alert("Delivery completed!");
    });
};
const orderPrice = document.getElementById("orderPrice");

sendOrder.onclick = async () => {
  const orderItem = document.getElementById("orderitem");
  const orderQuantity = document.getElementById("orderquantity");
  const currentAccount = await getAccounts();

  await contract.methods
    .sendOrder(orderItem.value, parseInt(orderQuantity.value))
    .send({ from: currentAccount, gas: 1500000, gasPrice: '300' })
    .on("transactionHash", (hash) => {
      alert("Item ordered");
    });  
//   var orderIndex = await contract.methods.orderIndex().call(); 
//   orderPrice.innerText = "Pay for order" + orderIndex;
};

sendPayment.onclick = async () => {
  const sendToOrderId = document.getElementById("sendToOrderId");
  const currentAccount = await getAccounts();
  const orderInfo = await contract.methods.queryOrder(sendToOrderId.value).call();
  const priceToPay = parseInt(orderInfo.price) + parseInt(orderInfo.delivery_price);
  console.log(priceToPay);
  await contract.methods
    .sendSafepay(sendToOrderId.value).send( {from: currentAccount, value: priceToPay} ).on("error", () => {
        console.log("rejected");
    }).on("transactionHash", (hash) => {
        alert("Payment sent!");
    });
  const ownerAddr = await contract.methods.returnOwner().call();
  const d = new Date();
  const dMonth = d.getMonth+1;
  await contract.methods
    .sendInvoice(sendToOrderId.value, d.getFullYear+dMonth+d.getDate()).send( {from: ownerAddr} );
};

const findOrder = document.getElementById("findOrder");

findOrder.onclick = async () => {
    const orderDetails = document.getElementById("orderDetails");
    const checkOrderID = document.getElementById("checkOrderID");
    const moreOrderDetails = document.getElementById("moreOrderDetails");
    const orderInfo = await contract.methods.queryOrder(checkOrderID.value).call();
    console.log(orderInfo);    
    //var orderIndex = await contract.methods.orderIndex().call();
    orderDetails.innerText = "Order " + checkOrderID.value + " details: "; 
    moreOrderDetails.innerText = "Goods: " + orderInfo.goods + "\n"
                               + "Quantity: " + orderInfo.quantity + "\n"
                               + "Price: " + orderInfo.price + "\n"
                               + "Delivery price: " + orderInfo.delivery_price + "\n"
                               + "Price paid: " + orderInfo.safepay + "\n"
                               + "Delivery price paid: " + orderInfo.delivery_safepay; 
}

const findInvoice = document.getElementById("findInvoice");

findInvoice.onclick = async () => {
    const invoiceDetails = document.getElementById("invoiceDetails");
    const checkInvoiceID = document.getElementById("checkInvoiceID");
    const moreInvoiceDetails = document.getElementById("moreInvoiceDetails");
    const invoiceInfo = await contract.methods.getInvoice(checkInvoiceID.value).call();
    console.log(invoiceInfo);

    invoiceDetails.innerText = "Invoice " + checkInvoiceID.value + " details: ";
    moreInvoiceDetails.innerText = "Confirmed order no.: " + invoiceInfo[1] + "\n" 
                                 + "Delivery date: " + invoiceInfo[2].substring(0, 4) + "-"
                                 + invoiceInfo[2].substring(4, 6) + "-"
                                 + invoiceInfo[2].substring(6, 8);
    
}

const sendOrderPrice = document.getElementById("sendOrderPrice");
const sendShipmentPrice = document.getElementById("sendShipPrice");

sendOrderPrice.onclick = async () => {
    const orderIndex = document.getElementById("orderIndex");
    const price = document.getElementById("price");
    const currentAccount = await getAccounts();

    await contract.methods
        .sendPrice(orderIndex.value, price.value, 1).send({ from: currentAccount }).on("transactionHash", (hash) => {
            alert("Price set!")
        })
}

sendShipmentPrice.onclick = async () => {
    const orderIndex = document.getElementById("orderIndex");
    const price = document.getElementById("price");
    const currentAccount = await getAccounts();
    
    await contract.methods
        .sendPrice(orderIndex.value, price.value, 2).send({ from: currentAccount }).on("transactionHash", (hash) => {
            alert("Shipment price set!")
        })
}

window.ethereum.on("accountsChanged", async function (accounts) {
  await getAccounts();
  checkIfAddr();
});

//contract.methods.sendOrder(orderItem.value, orderQuantity.value).send();
