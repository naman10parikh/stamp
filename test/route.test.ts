// D1 — the dispatch router IS the boundary. It must run the JTBD-0 mechanism↔governance gate
// FIRST (a "mechanism" task → a badge handoff, NOT a stamp handler), then map a governance
// task to its JTBD + handler. The discriminating case is the SCIM/SSO seam: "fix the SCIM
// webhook" is badge's mechanism, but "prove deprovisioning fired" is stamp's posture.

import { describe, expect, it } from "vitest";
import { route, type GovernanceRoute, type MechanismRoute } from "../src/dispatch/route.js";

function gov(task: string): GovernanceRoute {
  const r = route(task);
  if (r.boundary !== "governance") throw new Error(`expected governance for ${JSON.stringify(task)}, got ${JSON.stringify(r)}`);
  return r;
}
function mech(task: string): MechanismRoute {
  const r = route(task);
  if (r.boundary !== "mechanism") throw new Error(`expected mechanism for ${JSON.stringify(task)}, got ${JSON.stringify(r)}`);
  return r;
}

describe("route — the board's exact verify (JTBD-0 gate + JTBD router)", () => {
  it('"the SCIM webhook is dropping events" → mechanism, handoff badge', () => {
    const r = mech("the SCIM webhook is dropping events");
    expect(r.boundary).toBe("mechanism");
    expect(r.handoff).toBe("badge");
    expect(r.badge_command).toContain("badge init");
  });

  it('"will we pass SOC 2" → governance, jtbd 1, handler audit', () => {
    const r = gov("will we pass SOC 2");
    expect(r.jtbd).toBe(1);
    expect(r.handler).toBe("audit");
  });
});

describe("route — JTBD-0 gate sends every MECHANISM task to badge (KP P25)", () => {
  const mechanismTasks = [
    "validate the SAML signature",
    "fix event ordering in the SCIM pipe",
    "implement SAML SSO",
    "implement MCP OAuth with PKCE",
    "enforce RBAC scopes at the token",
    "pick the auth provider on price breakpoints",
  ];
  for (const task of mechanismTasks) {
    it(`"${task}" → badge`, () => {
      expect(mech(task).handoff).toBe("badge");
    });
  }
});

describe("route — governance tasks map to the right JTBD + handler", () => {
  const cases: Array<[string, number, string]> = [
    ["are we audit-ready for ISO 27001", 1, "audit"],
    ["which GRC platform should we pick", 2, "advise"],
    ["run a quarterly access review for agent identities", 3, "access-review"],
    ["is our logging tamper-evident for CC7", 4, "audit-log"],
    ["can we tell the buyer EU residency", 5, "residency"],
    ["handle a GDPR erasure DSAR", 6, "dsar"],
    ["answer the SIG questionnaire", 7, "questionnaire"],
    ["do we need SSO to close this deal", 8, "sso-plan"],
    ["prove our deprovisioning actually fired", 9, "access-review"],
  ];
  for (const [task, jtbd, handler] of cases) {
    it(`"${task}" → jtbd ${jtbd} / ${handler}`, () => {
      const r = gov(task);
      expect(r.jtbd).toBe(jtbd);
      expect(r.handler).toBe(handler);
    });
  }
});

describe("route — the SCIM/SSO seam discriminates mechanism from posture", () => {
  it('"fix the SCIM webhook" is MECHANISM (badge) but "prove deprovisioning fired" is POSTURE (stamp)', () => {
    expect(route("fix the SCIM webhook that is dropping events").boundary).toBe("mechanism");
    const posture = gov("prove deprovisioning fired");
    expect(posture.jtbd).toBe(9);
    expect(posture.handler).toBe("access-review");
  });

  it('"do we need SSO" is the PROGRAM (stamp) but "implement the SAML" is the MECHANISM (badge)', () => {
    expect(gov("do we need SSO to close this deal").handler).toBe("sso-plan");
    expect(route("implement the SAML assertion consumer endpoint").boundary).toBe("mechanism");
  });
});

describe("route — unrecognized compliance task falls back to the posture job", () => {
  it("an empty / vague task → governance jtbd 1 (audit), never crashes", () => {
    const r = gov("");
    expect(r.jtbd).toBe(1);
    expect(r.handler).toBe("audit");
  });
});
