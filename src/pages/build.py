"""Build the Leadish topic pages and resources into the site root.
Usage: python3 src/pages/build.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from leadish_site import write  # noqa: E402
import pages_landing  # noqa: E402

for p in pages_landing.PAGES:
    print("built", write(p).relative_to(Path(__file__).resolve().parents[2]))
