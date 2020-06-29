// import AppError from '../errors/AppError';

import { getRepository, getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (value > total) {
        throw new AppError('No enough cash, stranger...');
      }
    }

    let checkCategoryExists = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!checkCategoryExists) {
      checkCategoryExists = categoryRepository.create({ title: category });

      await categoryRepository.save(checkCategoryExists);
    }

    const { id: category_id } = checkCategoryExists;

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
