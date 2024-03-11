  const order ={
    "_id": 1,
    "items": [
      {"product": "Apples", "quantity": 10},
      {"product": "Bananas", "quantity": 5},
      {"product": "Oranges", "quantity": 8}
    ]
  }

  

  order.aggregate([
    { $unwind: "$items" },
    { $group: { _id: "$items.product", totalQuantity: { $sum: "$items.quantity" } } }
  ])