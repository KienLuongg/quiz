import { ApexTheme, ApexTitleSubtitle } from 'ng-apexcharts';
import {
    ApexAxisChartSeries,
    ApexNonAxisChartSeries,
    ApexChart,
    ApexXAxis,
    ApexDataLabels,
    ApexStroke,
    ApexYAxis,
    ApexLegend,
    ApexFill,
    ApexGrid,
    ApexPlotOptions,
    ApexTooltip,
    ApexMarkers
} from 'ng-apexcharts';

export interface LoginResponse {
    token: string;
    message: string;
}

export interface LoginRequest {
    email?: string;
    password?: string;
}

export interface ChangePassword {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
}

export interface ValidationError {
    [key: string]: string | undefined;
}

export type ChartOptions = {
    series: ApexAxisChartSeries | ApexNonAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    tooltip: ApexTooltip;
    labels: string[];
    colors: string[];
    legend: ApexLegend;
    fill: ApexFill;
    grid: ApexGrid;
    markers: ApexMarkers;
    theme: ApexTheme;
    title: ApexTitleSubtitle;
};