To fix the image fetching in the Approved and Rejected sections, you need to update your **Google Apps Script** backend code (`Code.gs` or similar).

Currently, the backend only returns the `photo` field when fetching `Pending` players. You need to include the `photo` field (and any other missing fields like `age`, `foot`, `experience` that you'll need for the Verified Players cards) in the JSON response for `getApprovedPlayers` and `getRejectedPlayers`.

### Step-by-Step Update:

1. Open your **Google Apps Script** project associated with the backend URL.
2. Locate the `doGet` function (or the functions that handle `getApprovedPlayers` and `getRejectedPlayers`).
3. Update the data mapping for both functions to include the `photo` column from your Google Sheet.

**Example of how it should look:**

```javascript
// INSIDE getApprovedPlayers logic
let approvedPlayers = sheetData.filter(row => row[STATUS_COLUMN_INDEX] === 'Approved')
  .map(row => ({
    id: row[0],
    name: row[1],
    position: row[2], // Adjust column indices based on your sheet
    mobile: row[3],
    photo: row[4],    // 👈 ADD THIS: Index of the Photo column
    age: row[5],      // 👈 Add these if needed for Verified Players page
    foot: row[6],
    experience: row[7],
    updated: row[8]
  }));
```

Make sure to map the exact column indices that correspond to the `Photo`, `Age`, `Foot`, and `Experience` in your Google Sheet (remember that arrays are 0-indexed in Apps Script).

4. **IMPORTANT**: After making the changes in Google Apps Script, click **Deploy > Manage deployments > Edit > New version > Deploy**. This step is required for the changes to take effect on the frontend.
