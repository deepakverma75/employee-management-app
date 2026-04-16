import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		redirectTo: 'dashboard'
	},
	{
		path: 'dashboard',
		loadChildren: () => import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES)
	},
	{
		path: 'employees',
		loadChildren: () => import('./features/employees/employees.routes').then((m) => m.EMPLOYEES_ROUTES)
	},
	{
		path: '**',
		redirectTo: 'dashboard'
	}
];
