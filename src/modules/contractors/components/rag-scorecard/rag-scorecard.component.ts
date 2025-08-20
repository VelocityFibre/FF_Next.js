import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { RAGScore } from '../../models/contractor.model';

@Component({
  selector: 'app-rag-scorecard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="rag-scorecard">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>assessment</mat-icon>
          RAG Compliance Scorecard
        </mat-card-title>
        <mat-card-subtitle>
          Last Updated: {{ ragScore?.lastUpdated | date:'short' }}
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div class="overall-score">
          <div class="score-indicator" [class]="'status-' + ragScore?.overall">
            <mat-icon>{{ getStatusIcon(ragScore?.overall) }}</mat-icon>
            <span>{{ ragScore?.overall | uppercase }}</span>
          </div>
          <p class="score-description">Overall Compliance Status</p>
        </div>

        <div class="category-scores">
          <div class="score-category" *ngFor="let category of getCategories()">
            <div class="category-header">
              <mat-icon>{{ getCategoryIcon(category.name) }}</mat-icon>
              <span>{{ category.label }}</span>
              <mat-chip [class]="'status-chip-' + category.status">
                {{ category.status | uppercase }}
              </mat-chip>
            </div>
            <div class="category-score">
              <span class="score-value">{{ getScore(category.name) }}%</span>
            </div>
            <mat-progress-bar 
              mode="determinate" 
              [value]="getScore(category.name)"
              [color]="getProgressColor(category.status)">
            </mat-progress-bar>
          </div>
        </div>

        <div class="score-details" *ngIf="ragScore?.details?.length">
          <h3>Detailed Assessment</h3>
          <div class="detail-item" *ngFor="let detail of ragScore.details">
            <div class="detail-header">
              <span class="detail-category">{{ detail.category }}</span>
              <span class="detail-score">{{ detail.score }}/{{ detail.maxScore }}</span>
            </div>
            <mat-progress-bar 
              mode="determinate" 
              [value]="(detail.score / detail.maxScore) * 100"
              [color]="getProgressColor(detail.status)">
            </mat-progress-bar>
            <div class="detail-issues" *ngIf="detail.issues?.length">
              <mat-chip-set>
                <mat-chip *ngFor="let issue of detail.issues" color="warn">
                  <mat-icon>warning</mat-icon>
                  {{ issue }}
                </mat-chip>
              </mat-chip-set>
            </div>
          </div>
        </div>

        <div class="score-legend">
          <div class="legend-item">
            <span class="legend-indicator status-green"></span>
            <span>Green: Fully Compliant (80-100%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-indicator status-amber"></span>
            <span>Amber: Partially Compliant (50-79%)</span>
          </div>
          <div class="legend-item">
            <span class="legend-indicator status-red"></span>
            <span>Red: Non-Compliant (0-49%)</span>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .rag-scorecard {
      margin-bottom: 24px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .overall-score {
      text-align: center;
      padding: 24px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
      border-radius: 12px;
      margin-bottom: 32px;
    }

    .score-indicator {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 16px 32px;
      border-radius: 50px;
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .score-indicator mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .status-green {
      background: #d4f4dd;
      color: #2e7d32;
    }

    .status-amber {
      background: #fff3cd;
      color: #f57c00;
    }

    .status-red {
      background: #ffcdd2;
      color: #c62828;
    }

    .score-description {
      color: #666;
      margin: 8px 0 0;
      font-size: 14px;
    }

    .category-scores {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .score-category {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .category-header mat-icon {
      color: #666;
    }

    .category-header span {
      flex: 1;
      font-weight: 500;
    }

    .status-chip-green {
      background: #d4f4dd !important;
      color: #2e7d32 !important;
    }

    .status-chip-amber {
      background: #fff3cd !important;
      color: #f57c00 !important;
    }

    .status-chip-red {
      background: #ffcdd2 !important;
      color: #c62828 !important;
    }

    .category-score {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .score-value {
      font-size: 20px;
      font-weight: 600;
    }

    .score-details {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .score-details h3 {
      margin: 0 0 16px;
      font-size: 18px;
      font-weight: 500;
    }

    .detail-item {
      margin-bottom: 20px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .detail-category {
      font-weight: 500;
    }

    .detail-score {
      color: #666;
      font-size: 14px;
    }

    .detail-issues {
      margin-top: 12px;
    }

    .detail-issues mat-chip {
      font-size: 12px;
    }

    .score-legend {
      display: flex;
      justify-content: space-around;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
      margin-top: 24px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #666;
    }

    .legend-indicator {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: inline-block;
    }

    .legend-indicator.status-green {
      background: #4caf50;
    }

    .legend-indicator.status-amber {
      background: #ff9800;
    }

    .legend-indicator.status-red {
      background: #f44336;
    }
  `]
})
export class RagScorecardComponent implements OnInit {
  @Input() ragScore: RAGScore | null = null;

  categories = [
    { name: 'financial', label: 'Financial Health', icon: 'account_balance' },
    { name: 'compliance', label: 'Compliance', icon: 'verified_user' },
    { name: 'performance', label: 'Performance', icon: 'trending_up' },
    { name: 'safety', label: 'Safety', icon: 'health_and_safety' }
  ];

  ngOnInit(): void {
    if (!this.ragScore) {
      this.ragScore = this.getDefaultScore();
    }
  }

  getCategories() {
    return this.categories.map(cat => ({
      ...cat,
      status: this.ragScore?.[cat.name as keyof RAGScore] || 'amber'
    }));
  }

  getScore(category: string): number {
    const detail = this.ragScore?.details?.find(d => 
      d.category.toLowerCase().includes(category.toLowerCase())
    );
    return detail ? Math.round((detail.score / detail.maxScore) * 100) : 0;
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'green': return 'check_circle';
      case 'amber': return 'warning';
      case 'red': return 'error';
      default: return 'help';
    }
  }

  getCategoryIcon(category: string): string {
    const cat = this.categories.find(c => c.name === category);
    return cat?.icon || 'category';
  }

  getProgressColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'green': return 'primary';
      case 'amber': return 'accent';
      case 'red': return 'warn';
      default: return 'primary';
    }
  }

  private getDefaultScore(): RAGScore {
    return {
      overall: 'amber',
      financial: 'green',
      compliance: 'amber',
      performance: 'green',
      safety: 'green',
      lastUpdated: new Date(),
      details: []
    };
  }
}