const transactionsInMemory = [
  {
    id: 'TX-1021',
    item: 'Crimson Ballgown',
    date: 'May 10, 2026',
    status: 'Reserved',
    amount: '₱2,000'
  },
  {
    id: 'TX-1022',
    item: 'Emerald Evening Gown',
    date: 'May 12, 2026',
    status: 'Reserved',
    amount: '₱3,500'
  },
  {
    id: 'TX-1023',
    item: 'Sapphire Tuxedo',
    date: 'May 15, 2026',
    status: 'Reserved',
    amount: '₱2,800'
  }
];

export default {
  async find() {
    return transactionsInMemory;
  },

  async create(txData) {
    // Added backticks around the template literal here
    const formattedAmount = typeof txData.amount === 'number' 
      ? `₱${txData.amount.toLocaleString()}` 
      : txData.amount;

    // Added backticks around the template literal for the ID generation here
    const newTransaction = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      item: txData.item || "Standard Rental Item",
      date: txData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: txData.status || 'Reserved',
      amount: formattedAmount || '₱0'
    };

    transactionsInMemory.push(newTransaction);
    console.log("Successfully saved transaction! Total memory list:", transactionsInMemory);
    return newTransaction;
  }
};