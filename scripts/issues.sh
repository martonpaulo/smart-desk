#!/usr/bin/env bash

# gather all problem paths
eslint_list=$(npx eslint . --format unix | cut -d: -f1)
prettier_list=$(npx prettier --list-different '**/*.{ts,tsx,js,jsx,json,md}')
tsc_list=$(npx tsc --noEmit --pretty false 2>&1 | grep -Eo '^[^:(]+' )

# merge, drop blanks, uniq
all=$(printf "%s\n%s\n%s\n" \
  "$eslint_list" \
  "$prettier_list" \
  "$tsc_list" \
| sed '/^[[:space:]]*$/d' \
| sort -u
)

[ -z "$all" ] && { echo "no issues found"; exit 0; }

# get all files with local edits
modified=$(git status --porcelain | awk '{print $2}' | sed '/^$/d')

# filter and collect only real, unignored, unmodified files
files=()
while IFS= read -r f; do
  [ ! -e "$f" ] && continue                   # skip if missing
  git check-ignore -q -- "$f" && continue     # skip if git‑ignored
  echo "$modified" | grep -Fxq "$f" && continue  # skip if edited
  files+=("$f")
done <<< "$all"

if [ ${#files[@]} -eq 0 ]; then
  echo "none left to open (all are ignored or have local edits)"
  exit 0
fi

# open in VSCode
code -- "${files[@]}"
