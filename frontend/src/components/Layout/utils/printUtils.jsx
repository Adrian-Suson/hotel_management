export const handlePrint = async ({
  profile,
  config,
  userLogs,
  filterType,
  startDate,
  endDate,
  handlePrintDialogClose,
}) => {
  let filteredLogs;
  switch (filterType) {
    case "year":
      filteredLogs = userLogs.filter((log) => {
        const actionDate = new Date(log.action_time);
        return actionDate.getFullYear() === startDate.year();
      });
      break;
    case "month":
      filteredLogs = userLogs.filter((log) => {
        const actionDate = new Date(log.action_time);
        return (
          actionDate.getFullYear() === startDate.year() &&
          actionDate.getMonth() === startDate.month()
        );
      });
      break;
    case "day":
      filteredLogs = userLogs.filter((log) => {
        const actionDate = new Date(log.action_time);
        return (
          actionDate.getFullYear() === startDate.year() &&
          actionDate.getMonth() === startDate.month() &&
          actionDate.getDate() === startDate.date()
        );
      });
      break;
    case "range":
      filteredLogs = userLogs.filter((log) => {
        const actionDate = new Date(log.action_time);
        return (
          (!startDate || actionDate >= startDate.toDate()) &&
          (!endDate || actionDate <= endDate.toDate())
        );
      });
      break;
    default:
      filteredLogs = userLogs;
  }

  try {
    const printContent = `
        <div style="width: 100%; margin: 20px auto; max-width: 800px; font-family: Arial, sans-serif;">
          <div class="header-container" style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; font-family: Arial, sans-serif;">
            <img src="../../../../assets/Logo2.jpg  " alt="Left Logo" style="display: inline-block; vertical-align: middle; width: 100px; height: auto;">
            <div style="display: inline-block; vertical-align: middle; text-align: center; width: 60%;">
              <h1 style="margin: 0; font-size: 18px; font-weight: bold;">Republic of the Philippines</h1>
              <h2 style="margin: 0; font-size: 16px; font-weight: bold;">ZAMBOANGA PENINSULA POLYTECHNIC STATE UNIVERSITY</h2>
              <h3 style="margin: 0; font-size: 14px;">Region IX, Zamboanga Peninsula<br>R.T. Lim Blvd., Zamboanga City</h3>
              <h2 style="margin: 0; font-size: 16px; font-weight: bold;">COLLEGE OF INFORMATION AND COMPUTING SCIENCES</h2>
            </div>
            <img src="../../../../assets/Logo.png" alt="Right Logo" style="display: inline-block; vertical-align: middle; width: 100px; height: auto;">
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-top: 20px;">
            <div>
              <h2 style="margin: 0; color: #333;">User Information</h2>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${
                profile.first_name
              } ${profile.last_name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${
                profile.email
              }</p>
              <p style="margin: 5px 0;"><strong>Phone Number:</strong> ${
                profile.phone_number
              }</p>
              <p style="margin: 5px 0;"><strong>Address:</strong> ${
                profile.address
              }</p>
            </div>
            <div>
              <img
                id="profileImage"
                src="${config.API_URL}/profile_pictures/${profile.image_url}" 
                alt="Profile Picture"
                style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;"
              />
            </div>
          </div>
  
          <h2 style="margin-top: 20px; color: #333;">User Logs</h2>
          <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead style="background-color: #f1f1f1;">
              <tr>
                <th style="padding: 8px; text-align: left;">Action</th>
                <th style="padding: 8px; text-align: left;">Time</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLogs
                .map(
                  (log) => `
                <tr>
                  <td style="padding: 8px; text-align: left;">${log.action}</td>
                  <td style="padding: 8px; text-align: left;">${new Date(
                    log.action_time
                  ).toLocaleString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;

    const printWindow = window.open("", "PRINT", "height=600,width=800");
    printWindow.document.write(`
        <html>
          <head>
            <title>Print</title>
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
              h2 { color: #333; }
              p { margin: 5px 0; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f1f1f1; }
              .header-container img { max-width: 100px; }
              .header-container h1, .header-container h2, .header-container h3 { margin: 0; padding: 0; }
              .header-container h1 { font-size: 18px; font-weight: bold; }
              .header-container h2 { font-size: 16px; font-weight: bold; }
              .header-container h3 { font-size: 14px; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);

    // Add an event listener for the image load event
    const profileImage = printWindow.document.getElementById("profileImage");
    profileImage.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      handlePrintDialogClose();
    };

    // In case the image fails to load, print without it
    profileImage.onerror = () => {
      console.error("Failed to load the profile image.");
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      handlePrintDialogClose();
    };

    // Close the document after writing to it
    printWindow.document.close();
  } catch (error) {
    console.error("An error occurred during the print process:", error);
  }
};
