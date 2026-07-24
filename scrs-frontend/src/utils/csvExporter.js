export const exportComplaintsToCSV = (complaints, filename = "complaints.csv") => {
  if (!complaints || complaints.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = [
    "Complaint ID",
    "Title",
    "Category",
    "Status",
    "Priority",
    "Submitted By",
    "Submitted Email",
    "Assigned Agent",
    "Rating",
    "Resolution Note",
    "Created Date"
  ];

  const rows = complaints.map(c => [
    `"${c._id || ''}"`,
    `"${(c.title || '').replace(/"/g, '""')}"`,
    `"${c.category || ''}"`,
    `"${c.status || ''}"`,
    `"${c.priority || ''}"`,
    `"${(c.user?.name || '').replace(/"/g, '""')}"`,
    `"${c.user?.email || ''}"`,
    `"${(c.assignedTo?.name || 'Unassigned').replace(/"/g, '""')}"`,
    `"${c.rating?.score ? `${c.rating.score}/5` : 'Not Rated'}"`,
    `"${(c.resolutionNote || '').replace(/"/g, '""')}"`,
    `"${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
