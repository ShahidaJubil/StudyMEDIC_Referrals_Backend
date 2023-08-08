const fs = require("fs");
const xlsx = require("xlsx");

function updateExcelSheet(existingExcelFilePath, newReferralData) {
  try {
    const workbook = xlsx.readFile(existingExcelFilePath);

    let worksheets = {};
    for (const sheetName of workbook.SheetNames) {
      worksheets[sheetName] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    const requiredFields = ["rfname", "rlname", "remail", "rcontact", "rlocation", "rcourse", "rduration"];

    // Check if all the required fields exist in the newReferralData object
    const isValidData = requiredFields.every(field => newReferralData.hasOwnProperty(field));

    if (isValidData) {
      worksheets.Sheet1.push({
        "First Name": `${newReferralData.rfname}`,
        "Last Name": `${newReferralData.rlname}`,
        "Email": `${newReferralData.remail}`,
        "Contact": `${newReferralData.rcontact}`,
        "Location": `${newReferralData.rlocation}`,
        "Course": `${newReferralData.rcourse}`,
        "Duration": `${newReferralData.rduration}`
      });

      // Update the excel file
      xlsx.utils.sheet_add_json(workbook.Sheets['Sheet1'], worksheets.Sheet1);
      xlsx.writeFile(workbook, existingExcelFilePath);

      return existingExcelFilePath;
    } else {
      console.log("Required fields missing in newReferralData. Data not appended.");
      return null; // Return null to indicate that the data was not appended
    }

  } catch (error) {
    console.log("Failed to update xlsx file:", error);
    return null; // Return null to indicate that the data was not appended
  }
}

module.exports = { updateExcelSheet };




// const fs = require("fs");
// const xlsx = require("xlsx");

// /// Function to update the Excel sheet
// function updateExcelSheet(existingExcelFilePath, newReferralData) {
//     try {
//       // Read the existing data from the Excel sheet
//       const workbook = xlsx.readFile(existingExcelFilePath);
//       const sheetName = workbook.SheetNames[0];
//       const worksheet = workbook.Sheets[sheetName];
  
//       // Convert the worksheet to an array of objects
//       const existingData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
//       // Remove the header row from the existing data
//       existingData.shift();
  
//       // Convert the new referral data to an array of arrays
//       const newReferralArray = newReferralData.map((referral) => Object.values(referral));
  
//       // Combine the existing data and the new referral data
//       const allData = [...existingData, ...newReferralArray];
  
//       // Create a new worksheet with the updated data
//       const newWorksheet = xlsx.utils.aoa_to_sheet([['Email', 'Last Name', 'First Name', 'Contact', 'Location', 'Course', 'Duration'], ...allData]);
  
//       // Update the workbook with the new worksheet
//       workbook.Sheets[sheetName] = newWorksheet;
  
//       // Write the updated workbook back to the Excel file
//       xlsx.writeFile(workbook, existingExcelFilePath);
  
//       return existingExcelFilePath;
//     } catch (error) {
//       console.error('Error updating Excel sheet:', error);
//       return null;
//     }
//   }
  

// module.exports = { updateExcelSheet };
