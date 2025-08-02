import { NextRequest, NextResponse } from 'next/server';
import { getUserResultsForExport } from '@/actions/admin/user-results';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Get all users with USER role and their results
    const usersWithResults = await getUserResultsForExport();

    // Prepare data for Excel export - one row per user
    const exportData: any[] = [];

    usersWithResults.forEach((user) => {
      // Create a single row for this user
      const userRow: any = {
        'User Name': user.name || 'N/A',
        Email: user.email || 'N/A',
        Role: user.role
      };

      // Initialize assessment type columns
      userRow['LISTENING Score'] = 'N/A';
      userRow['LISTENING Correct Answers'] = 'N/A';
      userRow['LISTENING Date'] = 'N/A';

      userRow['READING Score'] = 'N/A';
      userRow['READING Correct Answers'] = 'N/A';
      userRow['READING Date'] = 'N/A';

      userRow['WRITING Score'] = 'N/A';
      userRow['WRITING Assessment Status'] = 'N/A';
      userRow['WRITING Date'] = 'N/A';

      // Fill in LISTENING and READING results
      user.results.forEach((result) => {
        const sectionType = result.assessment?.sectionType;
        if (sectionType === 'LISTENING') {
          userRow['LISTENING Score'] = result.score || 'N/A';
          userRow['LISTENING Correct Answers'] =
            `${result.totalCorrectAnswers}/${result.assessment?.totalQuestions || 'N/A'}`;
          userRow['LISTENING Date'] = result.createdAt.toLocaleDateString();
        } else if (sectionType === 'READING') {
          userRow['READING Score'] = result.score || 'N/A';
          userRow['READING Correct Answers'] =
            `${result.totalCorrectAnswers}/${result.assessment?.totalQuestions || 'N/A'}`;
          userRow['READING Date'] = result.createdAt.toLocaleDateString();
        }
      });

      // Fill in WRITING results
      if (user.userEssays.length > 0) {
        const essay = user.userEssays[0]; // Take the first/latest essay
        userRow['WRITING Score'] = essay.score || 'Not Assessed';
        userRow['WRITING Assessment Status'] = essay.isAssessed
          ? 'Assessed'
          : 'Pending Assessment';
        userRow['WRITING Date'] = essay.createdAt.toLocaleDateString();
      }

      exportData.push(userRow);
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...exportData.map((row) => String(row[key] || '').length)
      )
    }));
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User Results Summary');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx'
    });

    // Create filename with current date
    const now = new Date();
    const fileName = `user-results-summary-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;

    // Return the file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } catch (error) {
    console.error('Error exporting user results:', error);
    return NextResponse.json(
      { error: 'Failed to export user results' },
      { status: 500 }
    );
  }
}
