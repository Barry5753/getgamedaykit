#!/bin/sh
set -eu

BASE_URL="${1:-http://localhost:3002}"

check_status() {
  path="$1"
  expected_status="$2"

  status="$(curl -sS -o /tmp/gamedaykit-launch-check-body -w "%{http_code}" --max-time 30 "$BASE_URL$path")"

  if [ "$status" != "$expected_status" ]; then
    echo "FAIL $path: expected HTTP $expected_status, received HTTP $status"
    cat /tmp/gamedaykit-launch-check-body
    exit 1
  fi

  echo "OK   $path: HTTP $status"
}

check_header() {
  path="$1"
  expected_status="$2"
  expected_content_type="$3"

  headers="$(curl -sSI --max-time 30 "$BASE_URL$path")"
  status="$(printf "%s" "$headers" | awk 'NR == 1 { print $2 }')"
  content_type="$(printf "%s" "$headers" | awk -F': ' 'tolower($1) == "content-type" { print tolower($2) }' | tr -d '\r')"

  if [ "$status" != "$expected_status" ]; then
    echo "FAIL $path: expected HTTP $expected_status, received HTTP $status"
    printf "%s\n" "$headers"
    exit 1
  fi

  case "$content_type" in
    *"$expected_content_type"*) ;;
    *)
      echo "FAIL $path: expected content-type containing $expected_content_type, received $content_type"
      printf "%s\n" "$headers"
      exit 1
      ;;
  esac

  echo "OK   $path: HTTP $status $content_type"
}

check_status "/" "200"
check_status "/robots.txt" "200"
check_status "/sitemap.xml" "200"
check_header "/opengraph-image" "200" "image/png"
check_header "/api/og?teamA=Mexico&teamB=South%20Africa&date=11%20JUN%202026&time=15%3A00&bgUrl=%2Fimages%2Fbg-neon-bar.jpg&venueName=Corner%20Pub&offer=%245%20Pints&isVip=false" "200" "image/png"
check_status "/api/auth/get-session" "200"

rm -f /tmp/gamedaykit-launch-check-body

echo "Launch URL checks passed for $BASE_URL"
