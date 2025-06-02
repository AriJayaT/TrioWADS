import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

/**
 * Export comprehensive Analytics Dashboard report to PDF (all tabs)
 * @param {Object} analyticsData - The analytics data from the dashboard
 * @param {string} timeRange - Selected time range (today, this-week, this-month)
 */
export const exportAnalyticsToPDF = async (analyticsData, activeTab, timeRange) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 20;

  // Helper function to add a new page if needed
  const checkPageSpace = (requiredSpace) => {
    if (currentY + requiredSpace > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      return true;
    }
    return false;
  };

  // Helper function to format time range for display
  const formatTimeRangeDisplay = (range) => {
    switch (range) {
      case 'today': return 'Today';
      case 'this-week': return 'This Week';
      case 'this-month': return 'This Month';
      default: return range;
    }
  };

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Comprehensive Analytics Report', pageWidth / 2, currentY, { align: 'center' });
  currentY += 12;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${formatTimeRangeDisplay(timeRange)}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;

  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 20;

  // Generate all sections in order
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  
  // 1. Overview Section
  currentY = await generateOverviewReport(doc, analyticsData, currentY, pageWidth, checkPageSpace);
  
  // Add page break before next section
  doc.addPage();
  currentY = 20;
  
  // 2. Resolution Times Section
  currentY = await generateResolutionReport(doc, analyticsData, currentY, pageWidth, checkPageSpace);
  
  // Add page break before next section
  doc.addPage();
  currentY = 20;
  
  // 3. Agent Performance Section
  currentY = await generatePerformanceReport(doc, analyticsData, currentY, pageWidth, checkPageSpace);
  
  // Add page break before next section
  doc.addPage();
  currentY = 20;
  
  // 4. Satisfaction Section
  await generateSatisfactionReport(doc, analyticsData, currentY, pageWidth, checkPageSpace);

  // Save the PDF
  const currentDate = new Date().toISOString().split('T')[0];
  const filename = `analytics-comprehensive-${timeRange}-${currentDate}.pdf`;
  doc.save(filename);
};

// Generate Overview Report
const generateOverviewReport = async (doc, data, startY, pageWidth, checkPageSpace) => {
  let currentY = startY;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('1. OVERVIEW REPORT', 20, currentY);
  currentY += 15;

  // Key Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Performance Metrics', 20, currentY);
  currentY += 10;

  const overviewMetrics = [
    ['Metric', 'Value'],
    ['Total Tickets', data.overview?.totalTickets?.toString() || '0'],
    ['Avg Resolution Time', `${data.overview?.avgResolutionTime || 0}m`],
    ['Avg Response Time', data.agentPerformance?.length > 0 
      ? `${Math.round(data.agentPerformance.reduce((sum, agent) => sum + (agent.avgResponseTime || 0), 0) / data.agentPerformance.length)}m`
      : '0m'],
    ['Customer Satisfaction', (data.overview?.customerSatisfaction || 0).toFixed(1)],
    ['Resolution Rate', `${(data.overview?.resolutionRate || 0).toFixed(1)}%`]
  ];

  doc.autoTable({
    startY: currentY,
    head: [overviewMetrics[0]],
    body: overviewMetrics.slice(1),
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [236, 72, 153] }
  });

  currentY = doc.lastAutoTable.finalY + 20;

  // Tickets by Status
  if (data.ticketsByStatus) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Ticket Status Breakdown', 20, currentY);
    currentY += 10;

    const statusHeaders = ['Status', 'Count'];
    const statusData = Object.entries(data.ticketsByStatus).map(([status, count]) => [
      status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      count.toString()
    ]);

    doc.autoTable({
      startY: currentY,
      head: [statusHeaders],
      body: statusData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [236, 72, 153] }
    });

    currentY = doc.lastAutoTable.finalY + 20;
  }

  // Top Performing Agents
  if (data.agentPerformance && data.agentPerformance.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Performing Agents', 20, currentY);
    currentY += 10;

    const agentHeaders = ['Agent', 'Tickets Resolved', 'Avg Rating', 'Avg Resolution Time'];
    const agentData = data.agentPerformance.slice(0, 5).map(agent => [
      agent.name || 'Unknown',
      (agent.resolvedTickets || 0).toString(),
      agent.avgRating ? agent.avgRating.toFixed(1) : 'N/A',
      agent.avgResolutionTime ? `${agent.avgResolutionTime}m` : 'N/A'
    ]);

    doc.autoTable({
      startY: currentY,
      head: [agentHeaders],
      body: agentData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [236, 72, 153] }
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  return currentY;
};

// Generate Resolution Report
const generateResolutionReport = async (doc, data, startY, pageWidth, checkPageSpace) => {
  let currentY = startY;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('2. RESOLUTION TIMES REPORT', 20, currentY);
  currentY += 15;

  // Resolution Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resolution Performance Metrics', 20, currentY);
  currentY += 10;

  const resolutionMetrics = [
    ['Metric', 'Value'],
    ['Avg Resolution Time', `${data.overview?.avgResolutionTime || 0}m`],
    ['First Response Time', `${data.overview?.avgResponseTime || 0}m`],
    ['Resolution Rate', `${(data.overview?.resolutionRate || 0).toFixed(1)}%`],
    ['Open Tickets', (data.ticketsByStatus?.open || 0).toString()],
    ['In Progress Tickets', (data.ticketsByStatus?.['in-progress'] || 0).toString()],
    ['Waiting for Customer', (data.ticketsByStatus?.['waiting-for-customer'] || 0).toString()]
  ];

  doc.autoTable({
    startY: currentY,
    head: [resolutionMetrics[0]],
    body: resolutionMetrics.slice(1),
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [236, 72, 153] }
  });

  currentY = doc.lastAutoTable.finalY + 20;

  // Resolution by Priority
  if (data.resolutionByPriority && data.resolutionByPriority.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resolution Time by Priority Level', 20, currentY);
    currentY += 10;

    const priorityHeaders = ['Priority', 'Ticket Count', 'Avg Resolution Time', 'Performance Score'];
    const priorityData = data.resolutionByPriority.map(item => [
      item.priority || 'Unknown',
      (item.count || 0).toString(),
      item.current || 'N/A',
      `${item.percentage || 0}%`
    ]);

    doc.autoTable({
      startY: currentY,
      head: [priorityHeaders],
      body: priorityData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [236, 72, 153] }
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  return currentY;
};

// Generate Performance Report
const generatePerformanceReport = async (doc, data, startY, pageWidth, checkPageSpace) => {
  let currentY = startY;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('3. AGENT PERFORMANCE REPORT', 20, currentY);
  currentY += 15;

  // Team Performance Summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Team Performance Summary', 20, currentY);
  currentY += 10;

  const teamAvgResponseTime = data.agentPerformance?.length > 0 
    ? Math.round(data.agentPerformance.reduce((sum, agent) => sum + (agent.avgResponseTime || 0), 0) / data.agentPerformance.length)
    : 0;

  const teamMetrics = [
    ['Metric', 'Value'],
    ['Team Satisfaction Score', (data.satisfaction?.avgRating || 0).toFixed(1)],
    ['Team Avg Response Time', `${teamAvgResponseTime}m`],
    ['Team Avg Resolution Time', `${data.overview?.avgResolutionTime || 0}m`],
    ['Total Tickets Handled', (data.overview?.totalTickets || 0).toString()],
    ['Total Active Agents', (data.agentPerformance?.length || 0).toString()]
  ];

  doc.autoTable({
    startY: currentY,
    head: [teamMetrics[0]],
    body: teamMetrics.slice(1),
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [236, 72, 153] }
  });

  currentY = doc.lastAutoTable.finalY + 20;

  // Individual Agent Performance
  if (data.agentPerformance && data.agentPerformance.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Individual Agent Performance Details', 20, currentY);
    currentY += 10;

    const agentHeaders = ['Agent Name', 'Total Tickets', 'Resolved', 'Resolution Rate', 'Avg Response Time', 'Avg Rating', 'FCR Rate'];
    const agentData = data.agentPerformance.map(agent => [
      agent.name || 'Unknown',
      (agent.totalTickets || 0).toString(),
      (agent.resolvedTickets || 0).toString(),
      `${(agent.resolutionRate || 0).toFixed(1)}%`,
      agent.avgResponseTime ? `${agent.avgResponseTime}m` : 'N/A',
      agent.avgRating ? agent.avgRating.toFixed(1) : 'N/A',
      agent.firstContactResolutionRate ? `${agent.firstContactResolutionRate.toFixed(1)}%` : 'N/A'
    ]);

    doc.autoTable({
      startY: currentY,
      head: [agentHeaders],
      body: agentData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [236, 72, 153] }
    });

    currentY = doc.lastAutoTable.finalY + 15;
  }

  return currentY;
};

// Generate Satisfaction Report
const generateSatisfactionReport = async (doc, data, startY, pageWidth, checkPageSpace) => {
  let currentY = startY;
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('4. CUSTOMER SATISFACTION REPORT', 20, currentY);
  currentY += 15;

  // Satisfaction Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Satisfaction Metrics', 20, currentY);
  currentY += 10;

  const satisfactionMetrics = [
    ['Metric', 'Value'],
    ['Average Satisfaction Score', (data.satisfaction?.avgRating || 0).toFixed(1)],
    ['Total Rating Responses', (data.satisfaction?.totalRatings || 0).toString()],
    ['Response Rate', data.overview?.totalTickets > 0 
      ? `${Math.round((data.satisfaction?.totalRatings || 0) / data.overview.totalTickets * 100)}%` 
      : '0%'],
    ['Satisfaction Target (4.0+)', data.satisfaction?.avgRating >= 4.0 ? 'Met ✓' : 'Not Met ✗']
  ];

  doc.autoTable({
    startY: currentY,
    head: [satisfactionMetrics[0]],
    body: satisfactionMetrics.slice(1),
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [236, 72, 153] }
  });

  currentY = doc.lastAutoTable.finalY + 20;

  // Rating Distribution
  if (data.satisfaction?.distribution) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Rating Distribution Analysis', 20, currentY);
    currentY += 10;

    const distributionHeaders = ['Rating Level', 'Count', 'Percentage', 'Category'];
    const total = Object.values(data.satisfaction.distribution).reduce((sum, count) => sum + count, 0);
    
    const distributionData = Object.entries(data.satisfaction.distribution).map(([rating, count]) => {
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
      let category = '';
      if (rating >= 4) category = 'Satisfied';
      else if (rating >= 3) category = 'Neutral';
      else category = 'Dissatisfied';
      
      return [
        `${rating} Star${rating === '1' ? '' : 's'}`,
        count.toString(),
        `${percentage}%`,
        category
      ];
    });

    doc.autoTable({
      startY: currentY,
      head: [distributionHeaders],
      body: distributionData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [236, 72, 153] }
    });

    currentY = doc.lastAutoTable.finalY + 20;
  }

  // Recent Feedback Summary
  if (data.recentRatings && data.recentRatings.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recent Customer Feedback', 20, currentY);
    currentY += 10;

    const feedbackHeaders = ['Customer', 'Rating', 'Agent', 'Feedback'];
    const feedbackData = data.recentRatings.slice(0, 5).map(rating => [
      rating.name || 'Anonymous',
      `${rating.rating}/5`,
      rating.agent || 'Unassigned',
      rating.feedback ? (rating.feedback.length > 50 ? rating.feedback.substring(0, 50) + '...' : rating.feedback) : 'No feedback'
    ]);

    doc.autoTable({
      startY: currentY,
      head: [feedbackHeaders],
      body: feedbackData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [236, 72, 153] }
    });
  }

  return currentY;
}; 