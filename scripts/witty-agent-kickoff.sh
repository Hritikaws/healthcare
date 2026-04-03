#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <initiative-slug>"
  echo "Example: $0 payments-rollout"
  exit 1
fi

slug="$1"
date_str="$(date +%F)"
out_dir="workplans"
mkdir -p "$out_dir"

base="$out_dir/${date_str}-${slug}"
plan_file="${base}.md"
adr_file="${base}-adr.md"
release_file="${base}-release-checklist.md"
risk_file="${base}-risk-register.md"

cp docs/agents/wittydoctor-plan-template.md "$plan_file"

cat > "$adr_file" <<ADR
# ADR - ${slug}

## Context
-

## Decision
-

## Consequences
-
ADR

cat > "$release_file" <<REL
# Release Checklist - ${slug}

- [ ] Environment variables validated
- [ ] Migrations applied safely
- [ ] Health/readiness endpoints green
- [ ] Monitoring dashboards and alerts active
- [ ] Rollback command verified
REL

cat > "$risk_file" <<RISK
# Risk Register - ${slug}

| Risk | Impact | Probability | Mitigation | Owner |
|---|---|---|---|---|
RISK

echo "✅ Generated:"
echo "- $plan_file"
echo "- $adr_file"
echo "- $release_file"
echo "- $risk_file"
