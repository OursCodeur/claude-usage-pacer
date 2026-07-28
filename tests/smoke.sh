#!/bin/sh
set -eu

cup_repo_dir=$(cd -- "$(dirname -- "$0")/.." >/dev/null && pwd)
cup_browser=${CUP_BROWSER:-}

if [ -z "$cup_browser" ]; then
  for cup_candidate in chromium brave google-chrome; do
    if command -v "$cup_candidate" >/dev/null 2>&1; then
      cup_browser=$cup_candidate
      break
    fi
  done
fi

if [ -z "$cup_browser" ]; then
  echo "No Chromium-compatible browser found; set CUP_BROWSER." >&2
  exit 1
fi

run_case() {
  cup_case=$1
  if ! cup_dump=$(
    "$cup_browser" \
      --headless \
      --disable-gpu \
      --virtual-time-budget=200 \
      --dump-dom "file://$cup_repo_dir/tests/usage-layout.html?plan=$cup_case" \
      2>&1
  ); then
    printf '%s\n' "$cup_dump" >&2
    exit 1
  fi

  case "$cup_dump" in
    *'data-test-result="pass"'*)
      echo "usage layout smoke test ($cup_case): pass"
      ;;
    *)
      echo "usage layout smoke test ($cup_case): fail" >&2
      exit 1
      ;;
  esac
}

run_case max
run_case non-max
