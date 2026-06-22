// B2 — `stamp audit` SOC2 gap-scan contract (acceptance half 1; EM JTBD-1).
// Tests the control-mapper directly (deterministic, no spawn) AND the never-claim-
// "compliant" boundary on the serialized JSON the CLI emits.

import { describe, expect, it } from "vitest";
import { scanForGaps } from "../src/lib/control-mapper.js";

const FIXTURE = "test/fixtures/app-under-audit";

describe("stamp audit — control-mapper gap-scan", () => {
  it("returns a SOC2 report with control-mapped findings (CC7.2 + CC6.3)", () => {
    const report = scanForGaps(FIXTURE, "soc2");
    expect(report.framework).toBe("soc2");
    expect(report.findings.length).toBeGreaterThanOrEqual(1);
    const controls = report.findings.map((f) => f.control);
    // The fixture seeds a missing audit trail (CC7.2) and no access review (CC6.3).
    expect(controls).toContain("CC7.2");
    expect(controls).toContain("CC6.3");
  });

  it("every finding carries a severity and a concrete fix", () => {
    const report = scanForGaps(FIXTURE, "soc2");
    for (const f of report.findings) {
      expect(["critical", "high", "medium", "low"]).toContain(f.severity);
      expect(f.fix.length).toBeGreaterThan(0);
      expect(f.brain_cite).toMatch(/brain\//);
    }
  });

  it('NEVER serializes the claim word "compliant" (OP O24; KP P7 boundary-FAIL)', () => {
    const json = JSON.stringify(scanForGaps(FIXTURE, "soc2"));
    // The boundary guard greps for the quoted JSON token; assert it is absent.
    expect(json.toLowerCase()).not.toContain('"compliant"');
    expect(json).toMatch(/audit-ready evidence/);
  });

  it("is deterministic — the same tree yields the same finding set (pass^k stability)", () => {
    const a = scanForGaps(FIXTURE, "soc2");
    const b = scanForGaps(FIXTURE, "soc2");
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("rejects an unknown framework and a missing path (deterministic error shape)", () => {
    expect(() => scanForGaps(FIXTURE, "pci")).toThrow(/unsupported framework/);
    expect(() => scanForGaps("test/fixtures/does-not-exist", "soc2")).toThrow(/not found/);
  });
});
