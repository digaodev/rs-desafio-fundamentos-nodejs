import { uuid } from 'uuidv4';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class TransactionsRepository {
  private transactions: Transaction[];

  constructor() {
    this.transactions = [];
  }

  public all(): Transaction[] {
    return this.transactions;
  }

  public getBalance(): Balance {
    const aggregation = this.transactions.reduce(
      (accum, current) => {
        switch (current.type) {
          case 'income':
            accum.income += current.value;
            break;
          case 'outcome':
            accum.outcome += current.value;
            break;

          default:
            break;
        }

        return accum;
      },
      { income: 0, outcome: 0 },
    );

    const balance = {
      ...aggregation,
      total: aggregation.income - aggregation.outcome,
    };

    return balance;
  }

  public create({ title, value, type }: Omit<Transaction, 'id'>): Transaction {
    if (type === 'outcome') {
      const { total } = this.getBalance();

      if (total - value < 0) {
        throw new Error(
          'Unable to accept this transaction. No funds available.',
        );
      }
    }

    const newTransaction = {
      id: uuid(),
      title,
      value,
      type,
    };

    this.transactions.push(newTransaction);

    return newTransaction;
  }
}

export default TransactionsRepository;
