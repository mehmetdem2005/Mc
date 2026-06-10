#!/usr/bin/env python3
"""Verify reviewable text source files against the packaged add-on archives."""
from __future__ import annotations

import hashlib
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BP_PREFIX = "AutoNPC_PlayerAI_v20_BP/"
RP_PREFIX = "AutoNPC_PlayerAI_v20_RP/"
TEXT_SUFFIXES = {".js", ".json", ".mcfunction", ".md", ".lang"}
RELEASE_NAME = "AutoNPC_PlayerAI_v2_0_AllInOne.mcaddon"
ROOT_RELEASE = ROOT / RELEASE_NAME
REPO_ZIP_NAME = "AutoNPC_PlayerAI_Bedrock_Repo_v2_0.zip"
REPO_ZIP_ROOT = "AutoNPC_PlayerAI_Bedrock_Repo_v2_0/"


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def is_reviewable_text(path: str | Path) -> bool:
    return Path(str(path)).suffix in TEXT_SUFFIXES


def collect_source_text_files() -> dict[str, str]:
    files: dict[str, str] = {}
    for source_dir, package_prefix in (("behavior_pack", BP_PREFIX), ("resource_pack", RP_PREFIX)):
        base = ROOT / source_dir
        for path in sorted(p for p in base.rglob("*") if p.is_file() and is_reviewable_text(p)):
            files[package_prefix + path.relative_to(base).as_posix()] = digest(path.read_bytes())
    return files


def collect_zip_files(archive_path: Path, *, text_only: bool = False) -> dict[str, str]:
    with zipfile.ZipFile(archive_path) as archive:
        return {
            info.filename: digest(archive.read(info.filename))
            for info in archive.infolist()
            if not info.is_dir() and (not text_only or is_reviewable_text(info.filename))
        }


def collect_repo_zip_source_text_files(archive_path: Path) -> dict[str, str]:
    files: dict[str, str] = {}
    with zipfile.ZipFile(archive_path) as archive:
        for info in archive.infolist():
            if info.is_dir() or not is_reviewable_text(info.filename):
                continue
            name = info.filename
            if name.startswith(f"{REPO_ZIP_ROOT}behavior_pack/"):
                rel = name.split("/behavior_pack/", 1)[1]
                files[BP_PREFIX + rel] = digest(archive.read(name))
            elif name.startswith(f"{REPO_ZIP_ROOT}resource_pack/"):
                rel = name.split("/resource_pack/", 1)[1]
                files[RP_PREFIX + rel] = digest(archive.read(name))
    return files


def collect_embedded_release(archive_path: Path) -> dict[str, str]:
    with zipfile.ZipFile(archive_path) as archive:
        release = archive.read(f"{REPO_ZIP_ROOT}releases/{RELEASE_NAME}")
    tmp = ROOT / ".sync_release_tmp.mcaddon"
    try:
        tmp.write_bytes(release)
        return collect_zip_files(tmp)
    finally:
        tmp.unlink(missing_ok=True)


def compare_subset(label: str, expected: dict[str, str], actual: dict[str, str]) -> bool:
    missing = sorted(set(expected) - set(actual))
    changed = sorted(name for name in set(expected) & set(actual) if expected[name] != actual[name])
    if missing or changed:
        print(f"[FAIL] {label}")
        if missing:
            print("  missing:", *missing, sep="\n    ")
        if changed:
            print("  changed:", *changed, sep="\n    ")
        return False
    print(f"[OK] {label}: {len(expected)} reviewable text files synchronized")
    return True


def compare_exact(label: str, expected: dict[str, str], actual: dict[str, str]) -> bool:
    missing = sorted(set(expected) - set(actual))
    extra = sorted(set(actual) - set(expected))
    changed = sorted(name for name in set(expected) & set(actual) if expected[name] != actual[name])
    if missing or extra or changed:
        print(f"[FAIL] {label}")
        if missing:
            print("  missing:", *missing, sep="\n    ")
        if extra:
            print("  extra:", *extra, sep="\n    ")
        if changed:
            print("  changed:", *changed, sep="\n    ")
        return False
    print(f"[OK] {label}: {len(expected)} files synchronized")
    return True


def main() -> int:
    source_text = collect_source_text_files()
    release = collect_zip_files(ROOT_RELEASE)
    repo_zip_source_text = collect_repo_zip_source_text_files(ROOT / REPO_ZIP_NAME)
    embedded_release = collect_embedded_release(ROOT / REPO_ZIP_NAME)

    checks = [
        compare_subset("source text vs root mcaddon", source_text, release),
        compare_subset("source text vs repo zip source", source_text, repo_zip_source_text),
        compare_exact("root mcaddon vs embedded release mcaddon", release, embedded_release),
    ]
    return 0 if all(checks) else 1


if __name__ == "__main__":
    sys.exit(main())
