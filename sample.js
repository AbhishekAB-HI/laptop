

const order= require("../PROJECT-NEW/model/orders")

const currentYear = new Date().getFullYear()
const currentMonth = new Date().getMonth()

const yearsToInclude = 4



const defalutMonthsValues = Array.from({ length: 12 }, (a, i) => ({
    month: i + 1,
    total: 0,
    count: 0,
  }))

  const defaultYearlyValues = Array.from(
    { length: yearsToInclude },
    (_, i) => ({
      year: currentYear - yearsToInclude + i + 1,
      total: 0,
      count: 0,
    })
  );

//   find the monthly sales date


const sample = async () => {
    const data = await order.aggregate([{$match:{"products.status": "delivered"}}], { maxTimeMS: 30000 });
console.log(data,'datagethere');
  };
  sample();
  

    const monthlySale = await order.aggregate([
      {
        $match: {
          $and: [
            { "products.status": "delivered" },
            { createdAt: { $gte: new Date(currentYear, currentMonth - 1, 1) } },
          ],
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Use "createdAt" instead of "date"
          data: { $push: { total: "$products.totalPrice" } },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          total: { $sum: "$data.total" },
          count: { $size: "$data" },
        },
      },
    ]);
  
    console.log(monthlySale, 'monthsale');
  
  
 
  

        
            
    




