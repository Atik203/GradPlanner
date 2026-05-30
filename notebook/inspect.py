import csv
from collections import Counter

# QS 2026 count
with open('dataset/qs-2026.csv', encoding='utf-8') as f:
    qs = list(csv.DictReader(f))
print(f'QS 2026: {len(qs)} universities')
print(f'QS sample: {qs[0]}')
print()

# THE all years
with open('dataset/the-2016-2026.csv', encoding='utf-8') as f:
    the_all = list(csv.DictReader(f))
the_years = sorted(set(r.get('Year','').strip() for r in the_all))
print(f'THE years available: {the_years}')
the_2026 = [r for r in the_all if r.get('Year','').strip() == '2026']
print(f'THE 2026: {len(the_2026)} universities')
print(f'THE sample: {the_2026[0]}')
print()

# ARWU years
with open('dataset/arwu-2003-2025.csv', encoding='utf-8') as f:
    arwu_all = list(csv.DictReader(f))
arwu_years = sorted(set(r.get('year','').strip() for r in arwu_all))
print(f'ARWU years available (last 5): {arwu_years[-5:]}')
arwu_2025 = [r for r in arwu_all if r.get('year','').strip() == '2025']
print(f'ARWU 2025: {len(arwu_2025)} universities')
print(f'ARWU sample: {arwu_2025[0]}')
