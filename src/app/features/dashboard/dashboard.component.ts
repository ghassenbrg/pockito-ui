import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

// Interfaces for type safety
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'pending' | 'archived';
  lastUpdated: Date;
}

interface Activity {
  id: string;
  type: 'project' | 'task' | 'user' | 'system';
  description: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Dashboard statistics
  totalProjects = 0;
  activeProjects = 0;
  completedProjects = 0;
  pendingTasks = 0;

  // Data arrays
  recentProjects: Project[] = [];
  recentActivity: Activity[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Load dashboard data from services
   * In a real application, this would call actual API services
   */
  private loadDashboardData(): void {
    // Mock data for demonstration
    this.loadMockStatistics();
    this.loadMockProjects();
    this.loadMockActivity();
  }

  /**
   * Load mock statistics data
   */
  private loadMockStatistics(): void {
    this.totalProjects = 24;
    this.activeProjects = 8;
    this.completedProjects = 12;
    this.pendingTasks = 15;
  }

  /**
   * Load mock projects data
   */
  private loadMockProjects(): void {
    this.recentProjects = [
      {
        id: '1',
        name: 'E-commerce Platform Redesign',
        description: 'Modernizing the user interface and improving user experience for the online store.',
        status: 'active',
        lastUpdated: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Mobile App Development',
        description: 'Creating a cross-platform mobile application for iOS and Android.',
        status: 'pending',
        lastUpdated: new Date('2024-01-14')
      },
      {
        id: '3',
        name: 'Database Migration',
        description: 'Migrating from legacy database system to modern cloud-based solution.',
        status: 'completed',
        lastUpdated: new Date('2024-01-12')
      },
      {
        id: '4',
        name: 'API Integration',
        description: 'Integrating third-party services and building RESTful APIs.',
        status: 'active',
        lastUpdated: new Date('2024-01-10')
      }
    ];
  }

  /**
   * Load mock activity data
   */
  private loadMockActivity(): void {
    this.recentActivity = [
      {
        id: '1',
        type: 'project',
        description: 'New project "E-commerce Platform Redesign" was created',
        timestamp: new Date('2024-01-15T10:30:00')
      },
      {
        id: '2',
        type: 'task',
        description: 'Task "Design Review" was completed in project "Mobile App Development"',
        timestamp: new Date('2024-01-15T09:15:00')
      },
      {
        id: '3',
        type: 'user',
        description: 'John Doe joined the project "API Integration"',
        timestamp: new Date('2024-01-15T08:45:00')
      },
      {
        id: '4',
        type: 'system',
        description: 'System backup completed successfully',
        timestamp: new Date('2024-01-15T08:00:00')
      },
      {
        id: '5',
        type: 'project',
        description: 'Project "Database Migration" was marked as completed',
        timestamp: new Date('2024-01-14T17:30:00')
      }
    ];
  }

  /**
   * Get SVG icon for activity type
   */
  getActivityIcon(type: string): string {
    const icons = {
      project: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>',
      task: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>',
      user: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>',
      system: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>'
    };
    
    return icons[type as keyof typeof icons] || icons.system;
  }

  /**
   * Navigate to project details
   */
  viewProject(projectId: string): void {
    // In a real application, this would navigate to project details
    console.log(`Viewing project: ${projectId}`);
    // this.router.navigate(['/app/projects', projectId]);
  }

  /**
   * Create new project
   */
  createProject(): void {
    // In a real application, this would open a create project modal or navigate to create page
    console.log('Creating new project');
    // this.router.navigate(['/app/projects/create']);
  }

  /**
   * Import project from external source
   */
  importProject(): void {
    // In a real application, this would open an import dialog
    console.log('Importing project');
  }

  /**
   * View analytics dashboard
   */
  viewAnalytics(): void {
    // In a real application, this would navigate to analytics page
    console.log('Viewing analytics');
    // this.router.navigate(['/app/analytics']);
  }

  /**
   * Open application settings
   */
  openSettings(): void {
    // In a real application, this would open settings modal or navigate to settings page
    console.log('Opening settings');
    // this.router.navigate(['/app/settings']);
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard(): void {
    this.loadDashboardData();
  }

  /**
   * Get project status count for a specific status
   */
  getProjectCountByStatus(status: string): number {
    return this.recentProjects.filter(project => project.status === status).length;
  }

  /**
   * Get recent projects by status
   */
  getRecentProjectsByStatus(status: string, limit: number = 3): Project[] {
    return this.recentProjects
      .filter(project => project.status === status)
      .slice(0, limit);
  }

  /**
   * Get formatted date for display
   */
  getFormattedDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get severity level for project status tags
   */
  getStatusSeverity(status: string): string {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'pending':
        return 'warning';
      case 'archived':
        return 'secondary';
      default:
        return 'info';
    }
  }
}
