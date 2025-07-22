#!/usr/bin/env bash

echo "[INFO] Listing tracked source files"
tracked=()
while IFS= read -r f; do
  tracked+=( "$f" )
done < <(git ls-files | grep -E '\.(ts|tsx|js|jsx|json|md)$')
echo "[INFO] Found ${#tracked[@]} files"

echo "[INFO] Running ESLint"
eslint_list=$(npx eslint "${tracked[@]}" --format unix 2>/dev/null | cut -d: -f1)
echo "[INFO] ESLint issues in $(echo "$eslint_list" | sed '/^[[:space:]]*$/d' | wc -l) files"

echo "[INFO] Running Prettier"
prettier_list=$(npx prettier --list-different "${tracked[@]}" 2>/dev/null)
echo "[INFO] Prettier issues in $(echo "$prettier_list" | sed '/^[[:space:]]*$/d' | wc -l) files"

# Step 3: only .ts/.tsx under version control
ts_files=()
for f in "${tracked[@]}"; do
  case "$f" in
    *.ts|*.tsx) ts_files+=( "$f" );;
  esac
done

if [ ${#ts_files[@]} -gt 0 ]; then
  echo "[INFO] Running TypeScript compiler on tracked TS files"
  raw_tsc=$(npx tsc --noEmit --pretty false "${ts_files[@]}" 2>&1)
  tsc_list=$(echo "$raw_tsc" | grep -Eo '^[^:(]+' | sort -u)
else
  tsc_list=""
fi
echo "[INFO] TypeScript errors in $(echo "$tsc_list" | sed '/^[[:space:]]*$/d' | wc -l) files"

# Merge all issue paths
all=$(printf "%s\n%s\n%s\n" "$eslint_list" "$prettier_list" "$tsc_list" \
  | sed '/^[[:space:]]*$/d' \
  | sort -u)
echo "[INFO] Total unique files with issues: $(echo "$all" | wc -l)"

[ -z "$all" ] && { echo "[INFO] No issues found"; exit 0; }

# Filter out missing or locally edited
modified=$(git status --porcelain | awk '{print $2}')
files=()
while IFS= read -r f; do
  [ ! -e "$f" ] && continue
  echo "$modified" | grep -Fxq "$f" && continue
  files+=( "$f" )
done <<< "$all"

[ ${#files[@]} -eq 0 ] && { echo "[INFO] None left to open"; exit 0; }

echo "[INFO] Opening ${#files[@]} files"
code -- "${files[@]}"
exit 1
