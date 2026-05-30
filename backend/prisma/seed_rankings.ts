import { prisma } from '../src/lib/prisma';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

async function main() {
  const csvPath = path.resolve(__dirname, '../../notebook/universities.csv');
  console.log(`Reading rankings CSV from: ${csvPath}`);

  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found!');
    process.exit(1);
  }

  const parser = fs.createReadStream(csvPath).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      cast: (value, context) => {
        if (value === '') return null;
        if (value === 'True') return true;
        if (value === 'False') return false;
        if (context.header) return value;
        
        // Try to parse numbers, but keep them as string if it's rankDisplay
        if (context.column.includes('rank') && !context.column.includes('display')) {
            const parsed = parseInt(value, 10);
            return isNaN(parsed) ? null : parsed;
        }
        if (context.column.includes('score') || context.column === 'the_teaching' || context.column === 'the_research_env' || context.column === 'the_research_quality' || context.column === 'the_industry' || context.column === 'the_international' || context.column === 'arwu_alumni' || context.column === 'arwu_award' || context.column === 'arwu_hici' || context.column === 'arwu_ns' || context.column === 'arwu_pub' || context.column === 'arwu_pcp') {
            const parsed = parseFloat(value);
            return isNaN(parsed) ? null : parsed;
        }
        return value;
      }
    })
  );

  let count = 0;
  const batchSize = 100;
  let batch: any[] = [];

  // Clear existing rankings to avoid duplicates
  await prisma.universityRanking.deleteMany({});
  console.log('Cleared existing rankings.');

  for await (const row of parser) {
    batch.push({
      institutionName: row.institution_name,
      country: row.country,
      region: row.region,
      inQs: Boolean(row.in_qs),
      inThe: Boolean(row.in_the),
      inArwu: Boolean(row.in_arwu),
      qs2026Rank: row.qs_2026_rank,
      qs2026RankDisplay: row.qs_2026_rank_display,
      qs2026Score: row.qs_2026_score,
      qsArScore: row.qs_ar_score,
      qsErScore: row.qs_er_score,
      qsFsrScore: row.qs_fsr_score,
      qsCpfScore: row.qs_cpf_score,
      qsIfrScore: row.qs_ifr_score,
      qsIsrScore: row.qs_isr_score,
      qsEoScore: row.qs_eo_score,
      qsSusScore: row.qs_sus_score,
      the2026Rank: row.the_2026_rank,
      the2026RankDisplay: row.the_2026_rank_display,
      the2026Score: row.the_2026_score,
      theTeaching: row.the_teaching,
      theResearchEnv: row.the_research_env,
      theResearchQuality: row.the_research_quality,
      theIndustry: row.the_industry,
      theInternational: row.the_international,
      arwu2025Rank: row.arwu_2025_rank,
      arwu2025Score: row.arwu_2025_score,
      arwuAlumni: row.arwu_alumni,
      arwuAward: row.arwu_award,
      arwuHici: row.arwu_hici,
      arwuNs: row.arwu_ns,
      arwuPub: row.arwu_pub,
      arwuPcp: row.arwu_pcp
    });

    if (batch.length >= batchSize) {
      await prisma.universityRanking.createMany({
        data: batch,
        skipDuplicates: true,
      });
      count += batch.length;
      console.log(`Inserted ${count} rankings...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await prisma.universityRanking.createMany({
      data: batch,
      skipDuplicates: true,
    });
    count += batch.length;
  }

  console.log(`\nSeeding complete! Inserted ${count} university rankings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
