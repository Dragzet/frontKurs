import React, { Component } from 'react';
import { getCurrentMonth } from '../utils/formatters';

export abstract class BasePage<P = {}, S = {}> extends Component<P, S> {
  protected abstract getPageTitle(): string;

  protected renderActions(): React.ReactNode {
    return null;
  }

  render() {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{this.getPageTitle()}</h1>
          {this.renderActions()}
        </div>
        {this.renderContent()}
      </div>
    );
  }

  protected abstract renderContent(): React.ReactNode;
}

export interface MonthPageState {
  currentMonth: string;
}

export abstract class MonthBasePage<P = {}, S extends MonthPageState = MonthPageState> extends BasePage<P, S> {
  constructor(props: P) {
    super(props);
    this.state = {
      ...this.getInitialState(),
      currentMonth: getCurrentMonth(),
    } as S;
  }

  protected getInitialState(): Partial<S> {
    return {};
  }

  protected handleMonthChange = (month: string): void => {
    this.setState({ currentMonth: month } as Pick<S, keyof S>);
  };
}
