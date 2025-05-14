import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoalService } from '../../services/GoalService';
import { IStorageService } from '../../services/storage';
import { IGoal } from '../../types/models';

// Mock storage service
const mockStorage: IStorageService = {
  get: vi.fn(),
  set: vi.fn(),
  remove: vi.fn(),
};

describe('GoalService', () => {
  let service: GoalService;
  const testGoal = {
    category: 'Vacation',
    amount: 5000,
    endDate: '2024-12-31',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock storage to return empty array by default
    (mockStorage.get as any).mockReturnValue([]);
    service = new GoalService(mockStorage);
  });

  it('should add a goal', () => {
    const goal = service.add(testGoal);
    
    // Verify goal is created with ID and initial currentAmount
    expect(goal.id).toBeDefined();
    expect(goal.amount).toBe(5000);
    expect(goal.category).toBe('Vacation');
    expect(goal.currentAmount).toBe(0);
    
    // Verify storage was updated
    expect(mockStorage.set).toHaveBeenCalledTimes(1);
    
    // Verify getAll returns the added goal
    const all = service.getAll();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(goal.id);
  });

  it('should update goal progress', () => {
    const goal = service.add(testGoal);
    
    // Update progress
    const updatedGoal = service.updateProgress(goal.id, 1000);
    
    // Verify goal was updated
    expect(updatedGoal).toBeDefined();
    expect(updatedGoal?.currentAmount).toBe(1000);
    
    // Verify storage was updated
    expect(mockStorage.set).toHaveBeenCalledTimes(2);
    
    // Update again
    const updatedGoal2 = service.updateProgress(goal.id, 500);
    expect(updatedGoal2?.currentAmount).toBe(1500);
  });

  it('should return undefined when updating non-existent goal', () => {
    const result = service.updateProgress('non-existent-id', 1000);
    expect(result).toBeUndefined();
  });

  it('should remove a goal', () => {
    const goal = service.add(testGoal);
    expect(service.getAll().length).toBe(1);
    
    service.remove(goal.id);
    expect(service.getAll().length).toBe(0);
  });

  it('should load goals from storage', () => {
    const savedGoals: IGoal[] = [
      { 
        id: '1', 
        category: 'Vacation', 
        amount: 5000, 
        currentAmount: 1000, 
        endDate: '2024-12-31' 
      }
    ];
    
    (mockStorage.get as any).mockReturnValue(savedGoals);
    
    // Create a new service instance that should load from storage
    const newService = new GoalService(mockStorage);
    
    expect(newService.getAll().length).toBe(1);
    expect(newService.getAll()[0].id).toBe('1');
    expect(newService.getAll()[0].currentAmount).toBe(1000);
  });
});
