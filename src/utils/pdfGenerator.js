import jsPDF from 'jspdf';

export const generateAnalyticsPDF = (metrics) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yOffset = margin;

  // Helper function to add new page if needed
  const checkAndAddPage = (requiredSpace) => {
    if (yOffset + requiredSpace > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      yOffset = margin;
      return true;
    }
    return false;
  };

  // Add header
  pdf.setFontSize(24);
  pdf.setTextColor(33, 33, 33);
  pdf.text('Analytics Report', pageWidth / 2, yOffset, { align: 'center' });
  
  // Add date
  yOffset += 10;
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    pageWidth / 2,
    yOffset,
    { align: 'center' }
  );

  yOffset += 20;

  // Overview Section
  if (metrics.overview) {
    pdf.setFontSize(18);
    pdf.setTextColor(33, 33, 33);
    pdf.text('Overview', margin, yOffset);
    yOffset += 10;

    pdf.setFontSize(12);
    const overview_metrics = [
      { label: 'Total Tickets', value: metrics.overview.totalTickets },
      { label: 'Average Resolution Time', value: metrics.overview.avgResolutionTime },
      { label: 'First Response Time', value: metrics.overview.firstResponseTime },
      { label: 'Customer Satisfaction', value: metrics.overview.customerSatisfaction }
    ];

    overview_metrics.forEach(item => {
      pdf.text(`${item.label}: ${item.value}`, margin + 5, yOffset);
      yOffset += 8;
    });

    yOffset += 10;
  }

  // Resolution Times Section
  if (metrics.resolution) {
    checkAndAddPage(50);
    pdf.setFontSize(18);
    pdf.text('Resolution Times', margin, yOffset);
    yOffset += 10;

    pdf.setFontSize(12);
    const resolution_metrics = [
      { label: 'Average Resolution Time', value: metrics.resolution.avgResolutionTime },
      { label: 'First Response Time', value: metrics.resolution.firstResponseTime },
      { label: 'Within SLA', value: metrics.resolution.withinSLA },
      { label: 'Overdue Tickets', value: metrics.resolution.overdueTickets }
    ];

    resolution_metrics.forEach(item => {
      pdf.text(`${item.label}: ${item.value}`, margin + 5, yOffset);
      yOffset += 8;
    });

    yOffset += 10;
  }

  // Agent Performance Section
  if (metrics.performance) {
    checkAndAddPage(50);
    pdf.setFontSize(18);
    pdf.text('Agent Performance', margin, yOffset);
    yOffset += 10;

    pdf.setFontSize(12);
    const performance_metrics = [
      { label: 'Team Satisfaction', value: metrics.performance.teamSatisfaction },
      { label: 'Average Response Time', value: metrics.performance.avgResponseTime },
      { label: 'Average Resolution Time', value: metrics.performance.avgResolutionTime },
      { label: 'Total Tickets', value: metrics.performance.totalTickets }
    ];

    performance_metrics.forEach(item => {
      pdf.text(`${item.label}: ${item.value}`, margin + 5, yOffset);
      yOffset += 8;
    });

    yOffset += 10;
  }

  // Satisfaction Section
  if (metrics.satisfaction) {
    checkAndAddPage(50);
    pdf.setFontSize(18);
    pdf.text('Customer Satisfaction', margin, yOffset);
    yOffset += 10;

    pdf.setFontSize(12);
    const satisfaction_metrics = [
      { label: 'Satisfaction Score', value: metrics.satisfaction.score },
      { label: 'Total Responses', value: metrics.satisfaction.totalResponses },
      { label: 'Response Rate', value: metrics.satisfaction.responseRate }
    ];

    satisfaction_metrics.forEach(item => {
      pdf.text(`${item.label}: ${item.value}`, margin + 5, yOffset);
      yOffset += 8;
    });
  }

  // Save the PDF
  pdf.save('analytics-report.pdf');
}; 