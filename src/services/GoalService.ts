import { IGoal, GoalCreateDTO } from '../types/models';
import { IGoalService } from './interfaces';
import { IStorageService } from './storage';
import { generateUUID } from '../utils/uuid';

export class GoalService implements IGoalService {
  private goals: IGoal[] = [];
  private readonly storageKey = 'goals';
  
  constructor(private storage: IStorageService) {
    this.loadFromStorage();
  }
  
  private loadFromStorage(): void {
    const storedGoals = this.storage.get<IGoal[]>(this.storageKey);
    if (storedGoals) {
      this.goals = storedGoals;
    }
  }
  
  private saveToStorage(): void {
    this.storage.set(this.storageKey, this.goals);
  }
  
  getAll(): IGoal[] {
    return [...this.goals];
  }
  
  getById(id: string): IGoal | undefined {
    return this.goals.find(goal => goal.id === id);
  }
  
  add(goalData: GoalCreateDTO): IGoal {
    const newGoal: IGoal = {
      ...goalData,
      id: generateUUID(),
      currentAmount: 0
    };
    
    this.goals.push(newGoal);
    this.saveToStorage();
    
    return newGoal;
  }
  
  updateProgress(id: string, amount: number): IGoal | undefined {
    const goalIndex = this.goals.findIndex(goal => goal.id === id);
    
    if (goalIndex === -1) {
      return undefined;
    }
    
    const updatedGoal: IGoal = {
      ...this.goals[goalIndex],
      currentAmount: this.goals[goalIndex].currentAmount + amount
    };
    
    this.goals[goalIndex] = updatedGoal;
    this.saveToStorage();
    
    return updatedGoal;
  }
  
  remove(id: string): void {
    this.goals = this.goals.filter(goal => goal.id !== id);
    this.saveToStorage();
  }
}
