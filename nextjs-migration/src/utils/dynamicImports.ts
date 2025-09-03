import dynamic from 'next/dynamic';

// Chart library dynamic imports with no SSR
export const RechartsChart = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
);

export const ChartJSChart = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Chart),
  { ssr: false }
);

export const ApexChart = dynamic(
  () => import('react-apexcharts'),
  { ssr: false }
);

// Heavy component dynamic imports
export const HeavyDataTable = dynamic(
  () => import('@tanstack/react-table').then(mod => mod.useReactTable),
  { ssr: false }
);

// PDF generator dynamic imports
export const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
  { ssr: false }
);

export const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
);