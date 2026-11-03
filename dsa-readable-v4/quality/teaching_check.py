"""Structural and content visibility checks before publishing the DSA V4 textbook.

This script verifies inspectable facts: every complete question is permanently
visible; solution and hints are inside a separately collapsible details block.
It cannot certify that a first-time reader has mastered the material.
"""
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
CHAPTERS = [ROOT / "chapters" / f"ch{i:02d}.md" for i in range(16)]
REVIEW = [
    "00-plan.md", "01-question-bank-a.md", "02-question-bank-b.md",
    "03-question-bank-c.md", "04-mock-a.md", "05-mock-b.md",
    "06-new-mock-c.md", "07-new-mock-d.md"
]
EXPECTED = [0, 24, 24, 20, 12, 12, 29, 29]
EXERCISE = re.compile(
    r'(?m)^#### ([^\n]+)\n\s*'
    r'([\s\S]*?)\s*<details class="question">'
    r'<summary>([^<]+)</summary>([\s\S]*?)</details>'
)
stats = []
total_units = 0
total_questions = 0

def check_exercises(text, path, expected):
    matches = list(EXERCISE.finditer(text))
    raw_count = text.count('<details class="question">')
    assert raw_count == expected == len(matches), (
        path, "missing or mismatched visible exercise", raw_count, len(matches), expected
    )
    assert text.count('</details>') == raw_count, (path, "unclosed detail")
    for i, m in enumerate(matches, 1):
        title, visible, control, hidden = m.groups()
        assert title.strip(), (path, i, "exercise title missing")
        assert "查看" in control and "解答" in control, (
            path, i, "control must advertise expandable solutions"
        )
        assert ("**题目。**" in visible or "<strong>完整题干：" in visible), (
            path, i, "full question must be outside details"
        )
        assert len(visible.strip()) >= (25 if path.startswith(("04-mock", "05-mock", "06-new", "07-new")) else 55), (path, i, "visible question too short")
        assert len(hidden.strip()) >= (60 if path.startswith(("06-new", "07-new")) else 80), (path, i, "worked answer too short")
        assert re.search(r"思路|提示|入手", hidden), (path, i, "missing approach")
        assert re.search(r"解答|答案", hidden), (path, i, "missing answer")
        assert "<details" not in visible, (path, i, "nested question visibility")
    return matches

for path in CHAPTERS:
    assert path.is_file(), f"Missing manuscript: {path}"
    text = path.read_text(encoding="utf8")
    units = re.findall(r"(?m)^## (.+?) \{#([a-z0-9-]+)\}\s*$", text)
    assert len(units) >= 6, (path.name, "too few teaching units")
    number = int(path.stem[2:])
    title = re.search(r"(?m)^# 第 (\d{2}) 章　(.+)$", text)
    assert title and int(title.group(1)) == number and len(title.group(2)) <= 30, (
        path.name, "chapter title must be a concise numbered knowledge area"
    )
    for index, (heading, _) in enumerate(units, 1):
        assert heading.startswith(f"{number:02d}.{index} ") and len(heading) <= 38, (
            path.name, index, "section must use sequential numbering and a concise topic"
        )
    assert text.count('<p class="chapter-epigraph">') == 1, (
        path.name, "missing relocated chapter epigraph"
    )
    assert text.count('<p class="section-epigraph">') == len(units), (
        path.name, "every former narrative heading must be preserved as a small epigraph"
    )
    assert not re.search(r'<p class="(?:chapter|section)-epigraph">[^\n]*</p>\n(?=\S)', text), (
        path.name, "raw HTML paragraph must be separated from Markdown by an empty line"
    )
    ids = [identifier for _, identifier in units]
    assert len(ids) == len(set(ids)), (path.name, "duplicate anchors")
    sections = re.split(r"(?m)^## ", text)[1:]
    assert min(map(len, sections)) >= 300, (path.name, "fragmentary section")
    assert not re.search(r"不是[^。\n]{0,75}而是", text), (
        path.name, "disallowed rhetorical construction"
    )
    assert not re.search(r"\\\[[\s\S]*?\\\]", text), (
        path.name, "unrendered math display"
    )
    assert len(re.findall(r"(?m)^~~~cpp\s*$", text)) == len(
        re.findall(r"(?m)^~~~\s*$", text)
    ), (path.name, "unclosed C++ fence")
    found = len(re.findall(r'<details class="question">', text))
    assert found >= 4, (path.name, "no complete exercises")
    matches = check_exercises(text, path.name, found)
    total_units += len(units)
    total_questions += len(matches)
    stats.append({
        "source": path.name,
        "teaching_units": len(units),
        "visible_complete_questions": len(matches),
        "smallest_statement_chars": min(len(m.group(2).strip()) for m in matches),
        "smallest_hidden_solution_chars": min(len(m.group(4).strip()) for m in matches),
    })

assert total_units == 131, total_units
assert total_questions == 86, total_questions
assert sum(len(p.read_text(encoding="utf8")) for p in CHAPTERS) > 140000

review_total = 0
for file, expected in zip(REVIEW, EXPECTED):
    path = ROOT / "review" / file
    assert path.exists(), path
    text = path.read_text(encoding="utf8")
    if expected:
        matches = check_exercises(text, file, expected)
        review_total += len(matches)
        stats.append({
            "source": file,
            "visible_complete_questions": len(matches),
            "smallest_statement_chars": min(len(m.group(2).strip()) for m in matches),
        })
    else:
        assert "复习" in text and len(text) >= 2000
assert review_total == 150, review_total

print("PASS independent visible questions: 86 course + 68 practice + 82 mocks")
print("PASS every solution is separate and only accessible through a collapsible control")
print("PASS 16 chapters, 131 instructional units and coherent review source inventory")
print("PASS 16 numbered chapter headings, 131 concise topic titles and preserved epigraphs")
print(json.dumps(stats, ensure_ascii=False, indent=2))
