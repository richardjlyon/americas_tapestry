#!/usr/bin/env python3
"""
Generate audio descriptions for all tapestries using ElevenLabs TTS API.

Each tapestry has a specific voice assigned based on its story type.

Usage:
    export ELEVENLABS_API_KEY="your-api-key"
    python3 scripts/generate-audio-descriptions.py

    # Generate only specific tapestries:
    python3 scripts/generate-audio-descriptions.py georgia maryland

    # List available voices:
    python3 scripts/generate-audio-descriptions.py --list-voices
"""

import os
import sys
import re
import time
import requests
from pathlib import Path

API_BASE = "https://api.elevenlabs.io/v1"
CONTENT_DIR = Path("content/tapestries")
OUTPUT_BASE = Path("public/images/tapestries")
MODEL_ID = "eleven_multilingual_v2"
OUTPUT_FORMAT = "mp3_44100_128"

# Voice assignments per tapestry (voice_id from ElevenLabs)
# Lily (Female) - XrExE9yKIg1WjnnlVkGX - Women's stories
# Bill L. Oxley (Male) - iiidtqDt9FBdT1vfBluA - Battle narratives
# Josh (Male) - wSO34DbFKBGmeCNpJL5K - Georgia (Haitian battle)
# George (Male) - GLSWsaquVBsIPLPPRi2s - Industrial/civilian/political stories
VOICE_MAP = {
    "north-carolina": ("Lily", "XrExE9yKIg1WjnnlVkGX"),
    "new-jersey": ("Lily", "XrExE9yKIg1WjnnlVkGX"),
    "pennsylvania": ("Lily", "XrExE9yKIg1WjnnlVkGX"),
    "maryland": ("Bill L. Oxley", "iiidtqDt9FBdT1vfBluA"),
    "rhode-island": ("Bill L. Oxley", "iiidtqDt9FBdT1vfBluA"),
    "south-carolina": ("Bill L. Oxley", "iiidtqDt9FBdT1vfBluA"),
    "virginia": ("Bill L. Oxley", "iiidtqDt9FBdT1vfBluA"),
    "georgia": ("Josh", "wSO34DbFKBGmeCNpJL5K"),
    "connecticut": ("George", "GLSWsaquVBsIPLPPRi2s"),
    "delaware": ("George", "GLSWsaquVBsIPLPPRi2s"),
    "massachusetts": ("George", "GLSWsaquVBsIPLPPRi2s"),
    "new-hampshire": ("George", "GLSWsaquVBsIPLPPRi2s"),
    "new-york": ("George", "GLSWsaquVBsIPLPPRi2s"),
}


def get_api_key():
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        print("Error: Set ELEVENLABS_API_KEY environment variable")
        print("Get your key from: https://elevenlabs.io/app/settings/api-keys")
        sys.exit(1)
    return key


def get_headers(api_key):
    return {"xi-api-key": api_key, "Content-Type": "application/json"}


def list_voices(api_key):
    resp = requests.get(f"{API_BASE}/voices", headers=get_headers(api_key))
    resp.raise_for_status()
    voices = resp.json()["voices"]
    print(f"\nAvailable voices ({len(voices)}):\n")
    for v in sorted(voices, key=lambda x: x["name"]):
        labels = v.get("labels", {})
        accent = labels.get("accent", "")
        gender = labels.get("gender", "")
        age = labels.get("age", "")
        desc = labels.get("description", "")
        print(f"  {v['voice_id']}  {v['name']:30s}  {gender:8s}  {accent:15s}  {age:12s}  {desc}")
    return voices


def extract_body_text(md_path):
    """Extract body text from markdown file, stripping frontmatter."""
    text = md_path.read_text(encoding="utf-8")

    # Strip frontmatter (between --- markers)
    parts = text.split("---")
    if len(parts) >= 3:
        body = "---".join(parts[2:]).strip()
    else:
        body = text.strip()

    # Minimal cleanup: strip markdown link syntax and italic markers
    body = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", body)  # [text](url) -> text
    body = re.sub(r"_([^_]+)_", r"\1", body)  # _italic_ -> italic

    return body


def get_all_tapestries():
    """Get list of all tapestry slugs from content directory."""
    return sorted([d.name for d in CONTENT_DIR.iterdir() if d.is_dir()])


def generate_audio(api_key, voice_id, text, output_path):
    """Generate audio using ElevenLabs API."""
    url = f"{API_BASE}/text-to-speech/{voice_id}?output_format={OUTPUT_FORMAT}"
    payload = {
        "text": text,
        "model_id": MODEL_ID,
        "voice_settings": {
            "stability": 0.6,
            "similarity_boost": 0.75,
            "style": 0.3,
            "use_speaker_boost": True,
        },
    }

    resp = requests.post(url, json=payload, headers=get_headers(api_key))
    resp.raise_for_status()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_bytes(resp.content)
    return len(resp.content)


def check_quota(api_key):
    """Check remaining character quota. Returns None if permission unavailable."""
    try:
        resp = requests.get(f"{API_BASE}/user/subscription", headers=get_headers(api_key))
        resp.raise_for_status()
        info = resp.json()
        used = info.get("character_count", 0)
        limit = info.get("character_limit", 0)
        remaining = limit - used
        return used, limit, remaining
    except requests.exceptions.HTTPError:
        return None


def main():
    api_key = get_api_key()

    # Handle --list-voices
    if "--list-voices" in sys.argv:
        list_voices(api_key)
        return

    # Check quota (optional - requires user_read permission)
    quota = check_quota(api_key)
    if quota:
        used, limit, remaining = quota
        print(f"Quota: {used:,}/{limit:,} chars used, {remaining:,} remaining\n")
    else:
        print("Quota check unavailable (key lacks user_read permission)\n")
        remaining = None

    # Determine which tapestries to generate
    all_slugs = get_all_tapestries()
    filter_slugs = [
        a for a in sys.argv[1:] if not a.startswith("-") and a in all_slugs
    ]
    slugs = filter_slugs if filter_slugs else all_slugs

    # Build generation list with per-tapestry voice assignments
    tasks = []
    total_chars = 0
    for slug in slugs:
        md_path = CONTENT_DIR / slug / "index.md"
        if not md_path.exists():
            print(f"  Warning: {md_path} not found, skipping")
            continue
        if slug not in VOICE_MAP:
            print(f"  Warning: no voice assigned for {slug}, skipping")
            continue

        body = extract_body_text(md_path)
        voice_name, voice_id = VOICE_MAP[slug]
        tasks.append((slug, body, voice_name, voice_id))
        total_chars += len(body)
        print(f"  {slug}: {len(body):,} chars -> {voice_name}")

    print(f"\nTotal: {total_chars:,} chars across {len(tasks)} tapestries")
    if remaining is not None:
        print(f"Quota available: {remaining:,} chars")
        if total_chars > remaining:
            print(f"\nWarning: Not enough quota! Need {total_chars - remaining:,} more chars.")
            resp = input("Continue anyway? (y/n): ").strip().lower()
            if resp != "y":
                return

    print(f"\nGenerating {len(tasks)} audio files...\n")

    generated = 0
    for slug, body, voice_name, voice_id in tasks:
        output_path = OUTPUT_BASE / slug / f"{slug}-audio-description.mp3"
        print(
            f"  [{generated + 1}/{len(tasks)}] {slug} ({len(body):,} chars, {voice_name})...",
            end=" ",
            flush=True,
        )

        try:
            size = generate_audio(api_key, voice_id, body, output_path)
            generated += 1
            print(f"OK ({size / 1024:.0f} KB) -> {output_path}")
        except requests.exceptions.HTTPError as e:
            print(f"FAILED: {e}")
            if e.response.status_code == 429:
                print("  Rate limited. Waiting 60s...")
                time.sleep(60)
                try:
                    size = generate_audio(api_key, voice_id, body, output_path)
                    generated += 1
                    print(f"  Retry OK ({size / 1024:.0f} KB)")
                except Exception as e2:
                    print(f"  Retry failed: {e2}")
            continue

        # Brief pause between requests to avoid rate limits
        time.sleep(1)

    print(f"\nDone! Generated {generated}/{len(tasks)} audio files.")

    # Final quota check
    quota = check_quota(api_key)
    if quota:
        used, limit, remaining = quota
        print(f"Quota remaining: {remaining:,}/{limit:,} chars")


if __name__ == "__main__":
    main()
