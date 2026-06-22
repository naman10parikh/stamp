#!/usr/bin/env bash
# brain-search.sh — the queryable MEMORY LAYER for stamp.
#
# What stamp remembers = the compliance corpus in brain/**.md, NOT git/code history.
# This is the CANONICAL brain searcher (HARNESS-OVERRIDES §2): a real BM25 ranker over
# brain/**.md that returns ranked, CITED hits. It does NOT fall back to the generic
# memory-search.sh (which searches memory/vault/rules and returns garbage like react.md
# for a compliance query — confirmed cold). Pick one canonical brain searcher: this one.
#
# Ranking: Okapi BM25 (IDF-weighted term frequency + document-length normalization).
#   - IDF discriminates: a rare term ("tamper-evident", "erasure", "DSAR") outweighs a
#     common one ("audit" appears 40+× in every file), so results reflect RELEVANCE, not
#     "which brain file is biggest".
#   - Length-normalization stops a long file from winning purely on size.
# k1=1.5, b=0.75 (standard). Zero external deps — pure bash + awk (matches the inherited
# scripts' no-dep convention).
#
# Usage: scripts/brain-search.sh "<query>" [--limit N] [--context]
#   --limit N    top N results (default 5)
#   --context    also print the best-matching cited line from each hit (default: on for TTY)

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BRAIN_DIR="$PROJECT_DIR/brain"

QUERY=""
LIMIT=5
SHOW_CONTEXT=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --limit)   LIMIT="$2"; shift 2 ;;
    --context) SHOW_CONTEXT=1; shift ;;
    --no-context) SHOW_CONTEXT=0; shift ;;
    --help|-h)
      echo "Usage: brain-search.sh \"query\" [--limit N] [--context]"
      echo ""
      echo "BM25 search over stamp's brain/**.md (the queryable memory layer)."
      echo "Returns ranked, cited hits from the 6 brain files + research/raw."
      exit 0 ;;
    *) if [ -z "$QUERY" ]; then QUERY="$1"; else QUERY="$QUERY $1"; fi; shift ;;
  esac
done

if [ -z "$QUERY" ]; then
  echo "Error: no query provided" >&2
  echo "Usage: brain-search.sh \"query\" [--limit N] [--context]" >&2
  exit 1
fi

if [ ! -d "$BRAIN_DIR" ]; then
  echo "Error: brain/ not found at $BRAIN_DIR" >&2
  exit 1
fi

# Collect the brain corpus: top-level brain/*.md + research/raw/*.md (recursive **.md).
# NUL-delimited so paths with spaces ("MOC - stamp.md") survive.
FILE_LIST="$(mktemp)"
trap 'rm -f "$FILE_LIST"' EXIT
find "$BRAIN_DIR" -type f -name '*.md' -print0 > "$FILE_LIST"

if [ ! -s "$FILE_LIST" ]; then
  echo "No brain/*.md files found." >&2
  exit 1
fi

# BM25 in two stages (pure bash + awk, zero deps):
#   1) a while-read loop emits per-file term-frequencies + doc-length as TSV
#   2) one awk pass computes Okapi BM25 (IDF + length-norm) and ranks.
#
# 1) term frequencies + doc lengths, emitted as TSV: <path>\t<doclen>\t<term>\t<tf>
STATS="$(mktemp)"
trap 'rm -f "$FILE_LIST" "$STATS"' EXIT

# Lowercased, space-separated unique query terms.
read -r -a RAW_TERMS <<< "$(echo "$QUERY" | tr '[:upper:]' '[:lower:]')"

while IFS= read -r -d '' f; do
  # doc length = word count (for length normalization)
  dl=$(wc -w < "$f" | tr -d ' ')
  [ -z "$dl" ] && dl=1
  [ "$dl" -eq 0 ] && dl=1
  for term in "${RAW_TERMS[@]}"; do
    [ -z "$term" ] && continue
    # case-insensitive substring occurrence count (term frequency).
    # `|| true` keeps a no-match grep (exit 1) from tripping `set -o pipefail`.
    tf=$( { grep -o -i -F "$term" "$f" 2>/dev/null || true; } | wc -l | tr -d ' ')
    tf=${tf:-0}
    printf '%s\t%s\t%s\t%s\n' "$f" "$dl" "$term" "$tf" >> "$STATS"
  done
done < "$FILE_LIST"

# 2) BM25 ranking in awk.
RANKED="$(mktemp)"
trap 'rm -f "$FILE_LIST" "$STATS" "$RANKED"' EXIT

LC_ALL=C awk -F'\t' -v k1=1.5 -v b=0.75 '
  {
    path=$1; dl=$2+0; term=$3; tf=$4+0;
    # record doc length once per path
    if (!(path in DL)) { DL[path]=dl; N++; sumdl+=dl; order[N]=path }
    tfk[path SUBSEP term]=tf;
    if (tf>0) { if (!(term SUBSEP path in seen)) { df[term]++; seen[term SUBSEP path]=1 } }
    terms[term]=1;
  }
  END {
    if (N==0) exit 0;
    avgdl=sumdl/N;
    for (i=1;i<=N;i++){
      p=order[i]; dl=DL[p]; score=0;
      for (t in terms){
        tf=tfk[p SUBSEP t]+0;
        if (tf<=0) continue;
        d=df[t]+0;
        # Okapi BM25 IDF (always positive variant)
        idf=log( (N - d + 0.5)/(d + 0.5) + 1 );
        denom = tf + k1*(1 - b + b*(dl/avgdl));
        score += idf * (tf*(k1+1))/denom;
      }
      if (score>0) printf "%.6f\t%s\n", score, p;
    }
  }
' "$STATS" | sort -t$'\t' -k1,1 -nr > "$RANKED"

if [ ! -s "$RANKED" ]; then
  echo "No brain results for: $QUERY"
  exit 0
fi

echo "=== Brain Search: \"$QUERY\" ==="
echo ""

# Display only: a downstream `| head` closes the pipe early (SIGPIPE) — that is the
# caller's intent, not an error. Drop errexit/pipefail here so a benign broken-pipe
# write doesn't print "printf: write error" or non-zero-exit the script.
set +e +o pipefail

RANK=0
# read top-N ranked rows
while IFS=$'\t' read -r score path; do
  RANK=$((RANK + 1))
  [ "$RANK" -gt "$LIMIT" ] && break
  rel="${path#$PROJECT_DIR/}"
  printf '[%d] %s (score: %s)\n' "$RANK" "$rel" "$score"
  if [ "$SHOW_CONTEXT" -eq 1 ]; then
    # cite the single line richest in query terms (a real citation, not a header echo)
    best_line="$(LC_ALL=C awk -v q="$(echo "$QUERY" | tr '[:upper:]' '[:lower:]')" '
      BEGIN{ n=split(q,T," ") }
      { line=tolower($0); s=0; for(i=1;i<=n;i++){ if(T[i]!="" && index(line,T[i])>0) s++ }
        if(s>best){ best=s; bl=$0 } }
      END{ if(best>0) print bl }' "$path")"
    if [ -n "$best_line" ]; then
      # trim + cap length for a clean citation
      printf '    ↳ %s\n' "$(echo "$best_line" | sed 's/^[[:space:]]*//' | cut -c1-200)"
    fi
  fi
  echo ""
done < "$RANKED"

TOTAL=$(wc -l < "$RANKED" | tr -d ' ')
echo "Ranked $TOTAL brain files (BM25). Showing top $LIMIT."
