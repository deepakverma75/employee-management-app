import { Component, OnInit } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { HighchartsChartComponent } from 'highcharts-angular';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee } from '../../core/models/employee.model';

@Component({
  selector: 'app-dashboard',
  imports: [MatCardModule, MatButtonToggleModule, HighchartsChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  totalEmployees = 0;
  departmentChartType: 'pie' | 'bar' = 'pie';
  employmentChartType: 'pie' | 'bar' = 'bar';
  private readonly departmentColors = ['#118ab2', '#06d6a0', '#ffd166', '#ef476f', '#8338ec'];
  private readonly employmentColors = ['#0f766e', '#ca8a04', '#1d4ed8', '#9333ea'];

  departmentGroups: Array<{ name: string; count: number }> = [];
  employmentGroups: Array<{ name: string; count: number }> = [];

  constructor(private readonly employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.employeeService.getAllEmployees().subscribe((response) => {
      const employees = response.data;
      this.totalEmployees = employees.length;
      this.departmentGroups = this.groupEmployees(employees, (employee) => employee.department);
      this.employmentGroups = this.groupEmployees(employees, (employee) => employee.employmentType);
    });
  }

  get departmentChartOptions(): Highcharts.Options {
    return this.buildChartOptions(
      this.departmentGroups,
      this.departmentColors,
      this.departmentChartType,
      'Employees by Department'
    );
  }

  get employmentChartOptions(): Highcharts.Options {
    return this.buildChartOptions(
      this.employmentGroups,
      this.employmentColors,
      this.employmentChartType,
      'Employment Type Distribution'
    );
  }

  private groupEmployees(
    employees: Employee[],
    pickKey: (employee: Employee) => string
  ): Array<{ name: string; count: number }> {
    const grouped = employees.reduce<Record<string, number>>((acc, employee) => {
      const key = pickKey(employee);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, count]) => ({ name, count }));
  }

  private buildChartOptions(
    groups: Array<{ name: string; count: number }>,
    colors: string[],
    chartType: 'pie' | 'bar',
    title: string
  ): Highcharts.Options {
    if (chartType === 'pie') {
      return {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent',
          animation: true
        },
        title: { text: undefined },
        credits: { enabled: false },
        tooltip: {
          pointFormat: '<b>{point.y}</b> employees ({point.percentage:.1f}%)'
        },
        plotOptions: {
          pie: {
            innerSize: '35%',
            showInLegend: true,
            dataLabels: {
              enabled: true,
              format: '{point.name}: {point.y}'
            }
          }
        },
        legend: {
          align: 'center',
          verticalAlign: 'bottom'
        },
        series: [
          {
            type: 'pie',
            name: title,
            data: groups.map((item, index) => ({
              name: item.name,
              y: item.count,
              color: colors[index % colors.length]
            }))
          }
        ]
      };
    }

    return {
      chart: {
        type: 'bar',
        backgroundColor: 'transparent',
        animation: true
      },
      title: { text: undefined },
      credits: { enabled: false },
      xAxis: {
        categories: groups.map((item) => item.name),
        title: { text: undefined }
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        title: { text: 'Employees' }
      },
      legend: { enabled: false },
      tooltip: {
        pointFormat: '<b>{point.y}</b> employees'
      },
      plotOptions: {
        bar: {
          colorByPoint: true
        }
      },
      colors,
      series: [
        {
          type: 'bar',
          name: title,
          data: groups.map((item) => item.count)
        }
      ]
    };
  }
}
