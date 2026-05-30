"""
GradPlanner — University Rankings Data Preprocessing
====================================================
Merges QS 2026, THE 2026, and ARWU 2025 into a single unified CSV.

Output columns:
  institution_name     Canonical university name (QS > THE > ARWU preference)
  country              Country
  region               Geographic region (from QS when available)
  qs_2026_rank         QS 2026 integer rank (None if unranked)
  qs_2026_rank_display Raw QS rank string
  qs_2026_score        QS 2026 overall score
  qs_ar_score          Academic Reputation score
  qs_er_score          Employer Reputation score
  qs_fsr_score         Faculty/Student Ratio score
  qs_cpf_score         Citations per Faculty score
  qs_ifr_score         International Faculty Ratio score
  qs_isr_score         International Student Ratio score
  qs_eo_score          Employment Outcomes score
  qs_sus_score         Sustainability score
  the_2026_rank        THE 2026 integer rank (None if range)
  the_2026_rank_display Raw THE rank string
  the_2026_score       THE 2026 overall score
  the_teaching         Teaching score
  the_research_env     Research Environment score
  the_research_quality Research Quality score
  the_industry         Industry Impact score
  the_international    International Outlook score
  arwu_2025_rank       ARWU 2025 integer rank
  arwu_2025_score      ARWU 2025 total score
  arwu_alumni          Alumni score
  arwu_award           Award score
  arwu_hici            Highly Cited Researchers score
  arwu_ns              Nature & Science score
  arwu_pub             Publications score
  arwu_pcp             Per Capita Performance score
  in_qs                Boolean — appears in QS 2026
  in_the               Boolean — appears in THE 2026
  in_arwu              Boolean — appears in ARWU 2025
"""

import csv
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATASET = ROOT / "dataset"
OUTPUT  = ROOT / "notebook" / "universities.csv"

# ─── Helpers ─────────────────────────────────────────────────────────────────

def normalize(name: str) -> str:
    """Lowercase, strip accents, remove punctuation — for fuzzy key matching."""
    name = name.strip().lower()
    # Decompose unicode (e.g. é → e + combining accent) then keep only ASCII
    name = unicodedata.normalize("NFD", name)
    name = "".join(c for c in name if unicodedata.category(c) != "Mn")
    # Remove parenthetical abbreviations like "(MIT)"
    name = re.sub(r"\s*\(.*?\)\s*", " ", name)
    # Collapse common suffix variants
    name = re.sub(r"\bthe\b", "", name)
    name = re.sub(r"[^a-z0-9 ]", "", name)
    name = re.sub(r"\s+", " ", name).strip()
    return name


def parse_rank(raw: str) -> int | None:
    """Return the first integer in a rank string, or None."""
    raw = str(raw).strip().replace("=", "")
    m = re.search(r"\d+", raw)
    return int(m.group()) if m else None


def parse_float(raw: str) -> float | None:
    """Return float or None for empty/dash values."""
    raw = str(raw).strip()
    if raw in ("", "-", "N/A", "nan"):
        return None
    try:
        return float(raw.replace(",", ""))
    except ValueError:
        return None


# ─── Load QS 2026 ────────────────────────────────────────────────────────────

qs_rows: dict[str, dict] = {}
with open(DATASET / "qs-2026.csv", encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        name = row["Institution Name"].strip()
        key  = normalize(name)
        qs_rows[key] = {
            "institution_name":    name,
            "country":             row.get("Country/Territory", "").strip(),
            "region":              row.get("Region", "").strip(),
            "qs_2026_rank":        parse_rank(row.get("2026 Rank", "")),
            "qs_2026_rank_display": row.get("2026 Rank", "").strip(),
            "qs_2026_score":       parse_float(row.get("Overall SCORE", "")),
            "qs_ar_score":         parse_float(row.get("AR SCORE", "")),
            "qs_er_score":         parse_float(row.get("ER SCORE", "")),
            "qs_fsr_score":        parse_float(row.get("FSR SCORE", "")),
            "qs_cpf_score":        parse_float(row.get("CPF SCORE", "")),
            "qs_ifr_score":        parse_float(row.get("IFR SCORE", "")),
            "qs_isr_score":        parse_float(row.get("ISR SCORE", "")),
            "qs_eo_score":         parse_float(row.get("EO SCORE", "")),
            "qs_sus_score":        parse_float(row.get("SUS SCORE", "")),
        }

print(f"✅ QS 2026 loaded: {len(qs_rows)} universities")

# ─── Load THE 2026 ───────────────────────────────────────────────────────────

the_rows: dict[str, dict] = {}
with open(DATASET / "the-2016-2026.csv", encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        if row.get("Year", "").strip() != "2026":
            continue
        name = row["Name"].strip()
        key  = normalize(name)
        the_rows[key] = {
            "institution_name":     name,
            "country":              row.get("Country", "").strip(),
            "the_2026_rank":        parse_rank(row.get("Rank", "")),
            "the_2026_rank_display": str(row.get("Rank", "")).strip(),
            "the_2026_score":       parse_float(row.get("Overall Score", "")),
            "the_teaching":         parse_float(row.get("Teaching", "")),
            "the_research_env":     parse_float(row.get("Research Environment", "")),
            "the_research_quality": parse_float(row.get("Research Quality", "")),
            "the_industry":         parse_float(row.get("Industry Impact", "")),
            "the_international":    parse_float(row.get("International Outlook", "")),
        }

print(f"✅ THE 2026 loaded: {len(the_rows)} universities")

# ─── Load ARWU 2025 ──────────────────────────────────────────────────────────

arwu_rows: dict[str, dict] = {}
with open(DATASET / "arwu-2003-2025.csv", encoding="utf-8-sig") as f:
    for row in csv.DictReader(f):
        if row.get("year", "").strip() != "2025":
            continue
        name = row["name"].strip()
        key  = normalize(name)
        arwu_rows[key] = {
            "institution_name": name,
            "country":          row.get("region", "").strip(),
            "arwu_2025_rank":   parse_rank(row.get("rank", "")),
            "arwu_2025_score":  parse_float(row.get("total_score", "")),
            "arwu_alumni":      parse_float(row.get("Alumni", "")),
            "arwu_award":       parse_float(row.get("Award", "")),
            "arwu_hici":        parse_float(row.get("HiCi", "")),
            "arwu_ns":          parse_float(row.get("N&S", "")),
            "arwu_pub":         parse_float(row.get("PUB", "")),
            "arwu_pcp":         parse_float(row.get("PCP", "")),
        }

print(f"✅ ARWU 2025 loaded: {len(arwu_rows)} universities")

# ─── Merge ───────────────────────────────────────────────────────────────────

# Union of all normalised keys
all_keys = set(qs_rows) | set(the_rows) | set(arwu_rows)
print(f"\n📊 Total unique universities (before dedup): {len(all_keys)}")

EMPTY_QS = {k: None for k in [
    "qs_2026_rank", "qs_2026_rank_display", "qs_2026_score",
    "qs_ar_score", "qs_er_score", "qs_fsr_score", "qs_cpf_score",
    "qs_ifr_score", "qs_isr_score", "qs_eo_score", "qs_sus_score",
]}
EMPTY_THE = {k: None for k in [
    "the_2026_rank", "the_2026_rank_display", "the_2026_score",
    "the_teaching", "the_research_env", "the_research_quality",
    "the_industry", "the_international",
]}
EMPTY_ARWU = {k: None for k in [
    "arwu_2025_rank", "arwu_2025_score",
    "arwu_alumni", "arwu_award", "arwu_hici",
    "arwu_ns", "arwu_pub", "arwu_pcp",
]}

merged: list[dict] = []
for key in all_keys:
    qs   = qs_rows.get(key)
    the  = the_rows.get(key)
    arwu = arwu_rows.get(key)

    # Canonical name: prefer QS > THE > ARWU
    name = (qs or the or arwu)["institution_name"]  # type: ignore

    # Country: prefer QS > THE > ARWU
    country = ""
    if qs:
        country = qs["country"]
    elif the:
        country = the["country"]
    elif arwu:
        country = arwu["country"]

    region = qs["region"] if qs else ""

    row: dict = {
        "institution_name": name,
        "country":          country,
        "region":           region,
        "in_qs":            bool(qs),
        "in_the":           bool(the),
        "in_arwu":          bool(arwu),
    }

    qs_data = {k: qs[k] for k in EMPTY_QS if qs} if qs else EMPTY_QS.copy()
    row.update(qs_data if qs else EMPTY_QS)

    the_data = {k: the[k] for k in EMPTY_THE if the} if the else EMPTY_THE.copy()
    row.update(the_data if the else EMPTY_THE)

    arwu_data = {k: arwu[k] for k in EMPTY_ARWU if arwu} if arwu else EMPTY_ARWU.copy()
    row.update(arwu_data if arwu else EMPTY_ARWU)

    merged.append(row)

# Sort: universities ranked in all 3 first, then 2, then 1
merged.sort(key=lambda r: (
    -(int(r["in_qs"]) + int(r["in_the"]) + int(r["in_arwu"])),
    r["qs_2026_rank"] if r["qs_2026_rank"] is not None else 9999,
))

# ─── Write output ────────────────────────────────────────────────────────────

FIELDNAMES = [
    "institution_name", "country", "region",
    "in_qs", "in_the", "in_arwu",
    "qs_2026_rank", "qs_2026_rank_display", "qs_2026_score",
    "qs_ar_score", "qs_er_score", "qs_fsr_score", "qs_cpf_score",
    "qs_ifr_score", "qs_isr_score", "qs_eo_score", "qs_sus_score",
    "the_2026_rank", "the_2026_rank_display", "the_2026_score",
    "the_teaching", "the_research_env", "the_research_quality",
    "the_industry", "the_international",
    "arwu_2025_rank", "arwu_2025_score",
    "arwu_alumni", "arwu_award", "arwu_hici",
    "arwu_ns", "arwu_pub", "arwu_pcp",
]

with open(OUTPUT, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
    writer.writeheader()
    writer.writerows(merged)

# ─── Stats ───────────────────────────────────────────────────────────────────

in_all_3    = sum(1 for r in merged if r["in_qs"] and r["in_the"] and r["in_arwu"])
in_qs_the   = sum(1 for r in merged if r["in_qs"] and r["in_the"] and not r["in_arwu"])
in_qs_arwu  = sum(1 for r in merged if r["in_qs"] and r["in_arwu"] and not r["in_the"])
in_the_arwu = sum(1 for r in merged if r["in_the"] and r["in_arwu"] and not r["in_qs"])
only_qs     = sum(1 for r in merged if r["in_qs"] and not r["in_the"] and not r["in_arwu"])
only_the    = sum(1 for r in merged if r["in_the"] and not r["in_qs"] and not r["in_arwu"])
only_arwu   = sum(1 for r in merged if r["in_arwu"] and not r["in_qs"] and not r["in_the"])

print(f"\n📄 Output: {OUTPUT}")
print(f"   Total universities in merged CSV : {len(merged)}")
print(f"   Ranked in ALL 3 (QS+THE+ARWU)   : {in_all_3}")
print(f"   Ranked in QS + THE only          : {in_qs_the}")
print(f"   Ranked in QS + ARWU only         : {in_qs_arwu}")
print(f"   Ranked in THE + ARWU only        : {in_the_arwu}")
print(f"   QS only                          : {only_qs}")
print(f"   THE only                         : {only_the}")
print(f"   ARWU only                        : {only_arwu}")
print("\n✅ universities.csv written successfully!")
