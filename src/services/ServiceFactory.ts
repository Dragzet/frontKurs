import { IExpenseService } from './interfaces';
import { IIncomeService } from './interfaces';
import { IGoalService } from './interfaces';
import { ExpenseService } from './ExpenseService';
import { IncomeService } from './IncomeService';
import { GoalService } from './GoalService';
import { storageService } from './storage';

export class ServiceFactory {
  private static expenseService: IExpenseService;
  private static incomeService: IIncomeService;
  private static goalService: IGoalService;
  
  static getExpenseService(): IExpenseService {
    if (!this.expenseService) {
      this.expenseService = new ExpenseService(storageService);
    }
    return this.expenseService;
  }
  
  static getIncomeService(): IIncomeService {
    if (!this.incomeService) {
      this.incomeService = new IncomeService(storageService);
    }
    return this.incomeService;
  }
  
  static getGoalService(): IGoalService {
    if (!this.goalService) {
      this.goalService = new GoalService(storageService);
    }
    return this.goalService;
  }
}
