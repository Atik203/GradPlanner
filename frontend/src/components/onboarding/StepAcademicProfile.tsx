"use client";

import React from "react";
import type { WizardData } from "./OnboardingWizard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const BD_UNIVERSITIES = [
  "UIU Dhaka",
  "BUET",
  "DU",
  "NSU",
  "BRAC",
  "IUT",
  "AUST",
  "EWU",
  "AIUB",
  "MIST",
  "KUET",
  "CUET",
  "RUET",
  "SUST",
];

const DEGREE_OPTIONS = ["MSc", "PhD", "MSc → PhD track"];

const INTAKE_OPTIONS = ["Sep 2028", "Jan 2029", "Sep 2029", "Other"];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const YEARS = Array.from({ length: 6 }, (_, i) => String(2025 + i));

interface Props {
  data: WizardData;
  updateData: (patch: Partial<WizardData>) => void;
}

export function StepAcademicProfile({ data, updateData }: Props) {
  const [otherIntake, setOtherIntake] = React.useState(
    data.targetIntake && !INTAKE_OPTIONS.includes(data.targetIntake)
      ? data.targetIntake
      : ""
  );
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleUniChange = (val: string) => {
    updateData({ university: val });
    setShowSuggestions(val.length > 0);
  };

  const selectUni = (val: string) => {
    updateData({ university: val });
    setShowSuggestions(false);
  };

  const handleIntakeSelect = (val: string) => {
    if (val === "Other") {
      updateData({ targetIntake: "" });
      setOtherIntake("");
    } else {
      updateData({ targetIntake: val });
      setOtherIntake("");
    }
  };

  const handleOtherIntake = (val: string) => {
    setOtherIntake(val);
    updateData({ targetIntake: val });
  };

  const filteredUniversities = BD_UNIVERSITIES.filter(
    (u) => u.toLowerCase().includes(data.university.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-xl font-bold text-foreground bg-linear-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
          Academic Profile
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          This takes about 2 minutes and powers all your recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* University */}
        <div className="sm:col-span-2 relative">
          <Label htmlFor="uni" className="text-xs text-muted-foreground">
            University
          </Label>
          <Input
            id="uni"
            placeholder="Search BD universities..."
            value={data.university}
            onChange={(e) => handleUniChange(e.target.value)}
            onFocus={() => setShowSuggestions(data.university.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="bg-background border-border"
          />
          {showSuggestions && filteredUniversities.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredUniversities.map((u) => (
                <button
                  key={u}
                  type="button"
                  onMouseDown={() => selectUni(u)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer"
                >
                  {u}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CGPA */}
        <div>
          <Label htmlFor="cgpa" className="text-xs text-muted-foreground">
            CGPA
          </Label>
          <Input
            id="cgpa"
            type="number"
            min="0"
            max="4"
            step="0.01"
            placeholder="3.80"
            value={data.cgpa}
            onChange={(e) => updateData({ cgpa: e.target.value })}
            className="bg-background border-border"
          />
        </div>

        {/* Target Degree */}
        <div>
          <Label htmlFor="degree" className="text-xs text-muted-foreground">
            Target Degree
          </Label>
          <select
            id="degree"
            value={data.targetDegree}
            onChange={(e) => updateData({ targetDegree: e.target.value })}
            className="w-full h-10 rounded-lg border border-border bg-background text-foreground text-sm px-3 cursor-pointer"
          >
            <option value="">Select degree</option>
            {DEGREE_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Graduation Month */}
        <div>
          <Label htmlFor="gradMonth" className="text-xs text-muted-foreground">
            Graduation Month
          </Label>
          <select
            id="gradMonth"
            value={data.graduationMonth}
            onChange={(e) => updateData({ graduationMonth: e.target.value })}
            className="w-full h-10 rounded-lg border border-border bg-background text-foreground text-sm px-3 cursor-pointer"
          >
            <option value="">Month</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Graduation Year */}
        <div>
          <Label htmlFor="gradYear" className="text-xs text-muted-foreground">
            Graduation Year
          </Label>
          <select
            id="gradYear"
            value={data.graduationYear}
            onChange={(e) => updateData({ graduationYear: e.target.value })}
            className="w-full h-10 rounded-lg border border-border bg-background text-foreground text-sm px-3 cursor-pointer"
          >
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Target Intake */}
        <div>
          <Label className="text-xs text-muted-foreground">
            Target Intake
          </Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {INTAKE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleIntakeSelect(opt)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  (opt === "Other" && data.targetIntake && !INTAKE_OPTIONS.includes(data.targetIntake)) ||
                  data.targetIntake === opt
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          {(data.targetIntake && !INTAKE_OPTIONS.includes(data.targetIntake)) || otherIntake ? (
            <Input
              placeholder="Enter intake (e.g. May 2029)"
              value={otherIntake}
              onChange={(e) => handleOtherIntake(e.target.value)}
              className="bg-background border-border mt-2"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
