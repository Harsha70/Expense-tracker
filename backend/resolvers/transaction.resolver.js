import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";

const transactionResolver = {
  Query: {
    transactions: async (_, __, context) => {
      try {
        if (!context.getUser()) throw new Error("unauthorized");
        const userId = await context.getUser()._id;
        const transactions = await Transaction.find({ userId: userId });
        return transactions;
      } catch (error) {
        console.error("Error getting transactions: ", error);
        throw new Error("Error getting transactions");
      }
    },
    transaction: async (_, { transactionId }) => {
      try {
        console.log("Transaction", transactionId);
        const transaction = await Transaction.findById(transactionId);
        return transaction;
      } catch (error) {
        console.error("Error getting transaction: ", error);
        throw new Error("Error getting transaction");
      }
    },
    categoryStatistics: async (_, __, context) => {
      if (!context.getUser()) throw new Error("unauthorized");

      const userId = context.getUser()._id;
      const transactions = await Transaction.find({ userId: userId });
      const categoryMap = {};
      transactions.forEach((transaction) => {
        if (!categoryMap[transaction.category]) {
          categoryMap[transaction.category] = 0;
        }
        categoryMap[transaction.category] += transaction.amount;
      });
      console.log("TransactionStatistics", categoryMap);
      return Object.entries(categoryMap).map(([category, totalAmount]) => ({
        category,
        totalAmount,
      }));
    },
    locationStatistics: async (_, __, context) => {
      try {
        if (!context.getUser()) throw new Error("unauthorized");

        const userId = context.getUser()._id;
        const transactions = await Transaction.find({ userId: userId });
        const locationMap = {};
        transactions.forEach((transaction) => {
          if (!locationMap[transaction.location]) {
            locationMap[transaction.location] = 0;
          }
          locationMap[transaction.location] += transaction.amount;
        });
        console.log("locationMapStatistics", locationMap);
        return Object.entries(locationMap).map(([location, totalAmount]) => ({
          location,
          totalAmount,
        }));
      } catch (err) {
        console.log("Error getting location");
      }
    },
  },
  Mutation: {
    createTransaction: async (_, { input }, context) => {
      try {
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
        });
        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        console.error("Error creating transaction: ", error);
        throw new Error("Error creating transaction");
      }
    },
    updateTransaction: async (_, { input }) => {
      try {
        console.log("UpdateTransaction", input);
        const updateTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          input,
          { new: true }
        );
        console.log("UpdateTransaction", input, updateTransaction);
        return updateTransaction;
      } catch (err) {
        console.error("Error updating transaction: ", err);
        throw new Error("Error updating transaction");
      }
    },
    deleteTransaction: async (_, { transactionId }) => {
      try {
        console.log("Deleting transaction", transactionId);
        const deleteTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deleteTransaction;
      } catch (err) {
        console.error("Error deleting transaction: ", err);
        throw new Error("Error deleting transaction");
      }
    },
  },
  Transaction: {
    user: async (parent, _) => {
      const userId = parent.userId;
      try {
        const user = await User.findById(userId);
        return user;
      } catch (err) {
        console.error("Error getting user: ", err);
        throw new Error("Error getting user");
      }
    },
  },
};

export default transactionResolver;
