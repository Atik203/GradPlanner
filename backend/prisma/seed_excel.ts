import { prisma } from '../src/lib/prisma';
import * as xlsx from 'xlsx';
import path from 'path';

async function main() {
  const userEmail = 'atikurrahaman0304@gmail.com';

  const user = await prisma.user.findUnique({
    where: { email: userEmail }
  });

  if (!user) {
    console.error(`User with email ${userEmail} not found. Please ensure the user exists first.`);
    process.exit(1);
  }

  const excelPath = path.resolve(__dirname, '../../ML_AI_Graduate_Planner_v3.xlsx');
  console.log(`Reading Excel file from: ${excelPath}`);
  
  const workbook = xlsx.readFile(excelPath);
  
  const countrySheets = [
    '🇮🇪 Ireland', '🇸🇪 Sweden', '🇩🇪 Germany', '🇦🇺 Australia', 
    '🇺🇸 USA (PhD)', '🇨🇦 Canada', '🇰🇷 South Korea', '🇨🇳 China', 
    '🇯🇵 Japan', '🇦🇪 UAE', '🇳🇱 Netherlands', '🇨🇭 Switzerland', '🇫🇮 Finland'
  ];

  let totalInserted = 0;

  for (const sheetName of countrySheets) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      console.warn(`Sheet ${sheetName} not found, skipping.`);
      continue;
    }

    const data: any[][] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const country = sheetName.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '').trim(); // Remove flag emojis
    console.log(`\nProcessing country: ${country}`);

    let currentTier: any = null;
    let foundUniversityList = false;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const firstCell = String(row[0] || '').trim();

      // Look for the "SECTION 8 — UNIVERSITY LIST" or similar header
      if (firstCell.includes('UNIVERSITY LIST') || (firstCell.includes('SECTION 8') && firstCell.includes('UNIVERSITY'))) {
        foundUniversityList = true;
        continue;
      }

      if (foundUniversityList) {
        // Detect tier headers
        if (firstCell.includes('Ambitious') || firstCell.includes('Ambitious')) {
          currentTier = 'DREAM';
          continue;
        }
        if (firstCell.includes('Middle Ground')) {
          currentTier = 'MATCH';
          continue;
        }
        if (firstCell.includes('CONFIRM CHANCE') || firstCell.includes('Confirm Chance') || firstCell.includes('Safety')) {
          currentTier = 'SAFETY';
          continue;
        }

        // Detect table header rows like "#", "University", "Program" and skip them
        if (firstCell === '#' || (row[1] && String(row[1]).trim() === 'University')) {
          continue;
        }

        // If it looks like a valid university row (has a number in first column or is clearly data)
        // Usually: [ #, University, Program, Tuition, Min CGPA, English Req, Deadline, Intake, Acceptance, Website, Notes ]
        if (currentTier && row[1] && String(row[1]).trim() !== '' && !String(row[1]).includes('University')) {
          const name = String(row[1]).trim();
          const program = row[2] ? String(row[2]).trim() : null;
          const tuitionPerYr = row[3] ? String(row[3]).trim() : null;
          // min cgpa in row 4, english req in row 5
          const deadline = row[6] ? String(row[6]).trim() : null;
          const intake = row[7] ? String(row[7]).trim() : null;
          const acceptance = row[8] ? String(row[8]).trim() : null;
          const website = row[9] ? String(row[9]).trim() : null;
          const notes = row[10] ? String(row[10]).trim() : null;
          
          let combinedNotes = [];
          if (acceptance) combinedNotes.push(`Acceptance Rate: ${acceptance}`);
          if (row[4]) combinedNotes.push(`Min CGPA: ${row[4]}`);
          if (row[5]) combinedNotes.push(`English Req: ${row[5]}`);
          if (notes) combinedNotes.push(notes);

          try {
            await prisma.university.create({
              data: {
                userId: user.id,
                name: name,
                country: country,
                tier: currentTier,
                program: program,
                tuitionPerYr: tuitionPerYr,
                deadline: deadline,
                intake: intake,
                website: website,
                notes: combinedNotes.join(' | ')
              }
            });
            console.log(`  Inserted: ${name} (${currentTier})`);
            totalInserted++;
          } catch (e) {
            console.error(`  Error inserting ${name}:`, e);
          }
        }
      }
    }
  }

  console.log(`\nSeeding complete! Inserted ${totalInserted} universities for ${userEmail}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
