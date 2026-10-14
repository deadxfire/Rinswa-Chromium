#!/usr/bin/env python3
"""
Rinswa Browser - Adblock Rules Generator & Synchronizer
Developed and made by Arindam Makar

Fetches curated, high-reputation ad and tracking domain blocklists,
sanitizes and deduplicates them, and exports a production-ready blocklist
that can be hosted on GitHub and embedded into Rinswa Browser.
"""

import os
import re
import sys
import urllib.request

SOURCES = [
    # StevenBlack unified hosts (adware + malware + telemetry)
    ("StevenBlack Hosts", "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts"),
    # Peter Lowe's Ad and tracking server list
    ("Peter Lowe List", "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=nohtml&showintro=0&mimetype=plaintext"),
    # AdGuard DNS Filter (essential ads & tracking domains)
    ("AdGuard DNS Rules", "https://adguardteam.github.io/HostlistsRegistry/assets/filter_1.txt"),
]

DOMAIN_REGEX = re.compile(r"^(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$")

def clean_domain(raw_line):
    line = raw_line.strip()
    if not line or line.startswith("#") or line.startswith("!"):
        return None
    
    # Strip inline comments
    if "#" in line:
        line = line.split("#")[0].strip()

    # Handle /etc/hosts format: "0.0.0.0 domain.com" or "127.0.0.1 domain.com"
    parts = line.split()
    if len(parts) >= 2 and parts[0] in ("0.0.0.0", "127.0.0.1", "::1"):
        candidate = parts[1].strip()
    # Handle ABP/EasyList format: "||domain.com^"
    elif line.startswith("||") and line.endswith("^"):
        candidate = line[2:-1].strip()
    elif len(parts) == 1:
        candidate = parts[0].strip()
    else:
        return None

    candidate = candidate.lower().rstrip(".")
    # Filter localhost and invalid hosts
    if candidate in ("localhost", "local", "broadcasthost", "0.0.0.0", "127.0.0.1"):
        return None

    if DOMAIN_REGEX.match(candidate):
        return candidate
    return None

def fetch_and_generate(output_path):
    print("=" * 65)
    print("       RINSWA BROWSER - ADBLOCK RULE DATA GENERATOR")
    print("           Developed and made by Arindam Makar")
    print("=" * 65)
    print()

    unique_domains = set()

    for name, url in SOURCES:
        print(f">> Fetching: {name} ...")
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RinswaBrowser/1.0"}
            )
            with urllib.request.urlopen(req, timeout=30) as response:
                content = response.read().decode("utf-8", errors="ignore")
                count = 0
                for line in content.splitlines():
                    domain = clean_domain(line)
                    if domain:
                        unique_domains.add(domain)
                        count += 1
                print(f"   Success: Extracted {count:,} candidate domains.")
        except Exception as e:
            print(f"   [WARNING] Failed to fetch {name}: {e}")

    sorted_domains = sorted(unique_domains)
    total_count = len(sorted_domains)
    print(f"\n>> Total unique ad & tracker domains compiled: {total_count:,}")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("# ================================================================\n")
        f.write("# Rinswa Browser Native Adblock Blocklist\n")
        f.write(f"# Compiled by Arindam Makar | Total Domains: {total_count:,}\n")
        f.write("# Format: 1 domain per line for native C++ unordered_set lookup\n")
        f.write("# ================================================================\n")
        for domain in sorted_domains:
            f.write(domain + "\n")

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f">> Saved to: {output_path} ({size_mb:.2f} MB)")
    print("\n[NEXT STEP] Push this file to your GitHub repository to serve remote updates!")
    return True

if __name__ == "__main__":
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_file = os.path.join(project_dir, "config", "adblock", "rinswa-adblock-domains.txt")
    fetch_and_generate(target_file)
