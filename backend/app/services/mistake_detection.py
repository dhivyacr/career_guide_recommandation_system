import re

from app.services.constants import CONCEPT_MAPPING


def detect_mistakes(code: str, language: str) -> list[dict]:
    detectors = [
        _detect_off_by_one,
        _detect_missing_base_case,
        _detect_inefficient_nested_loops,
        _detect_binary_search_boundary_error,
    ]
    mistakes = []
    for detector in detectors:
        result = detector(code, language)
        if result:
            mistakes.append(result)
    return mistakes


def _detect_off_by_one(code: str, _: str) -> dict | None:
    lines = code.splitlines()
    for line_no, line in enumerate(lines, start=1):
        if "<=" in line and re.search(r"\[[^\]]+\]", code):
            return _mistake(
                "OFF_BY_ONE_ERROR",
                0.88,
                f"line {line_no}",
                "Loop boundary may exceed valid array indices",
            )
    return None


def _detect_missing_base_case(code: str, language: str) -> dict | None:
    if language != "python" and "return" not in code:
        return None
    function_match = re.search(r"def\s+(\w+)\s*\(", code)
    if function_match:
        name = function_match.group(1)
        if f"{name}(" in code[function_match.end() :] and not re.search(
            r"\bif\b.+\breturn\b", code, re.S
        ):
            return _mistake(
                "MISSING_RECURSION_BASE_CASE",
                0.82,
                f"function {name}",
                "Recursive call without a visible termination guard",
            )
    return None


def _detect_inefficient_nested_loops(code: str, _: str) -> dict | None:
    loop_lines = [
        i for i, line in enumerate(code.splitlines(), start=1) if re.search(r"\b(for|while)\b", line)
    ]
    if len(loop_lines) >= 2:
        return _mistake(
            "INEFFICIENT_NESTED_LOOPS",
            0.73,
            f"lines {loop_lines[0]}-{loop_lines[min(1, len(loop_lines) - 1)]}",
            "Detected repeated nested iteration that may be O(n^2)",
        )
    return None


def _detect_binary_search_boundary_error(code: str, _: str) -> dict | None:
    if "mid" in code and "lo" in code and "hi" in code:
        if re.search(r"lo\s*=\s*mid", code) or re.search(r"hi\s*=\s*mid", code):
            return _mistake(
                "BINARY_SEARCH_BOUNDARY_ERROR",
                0.9,
                "binary search loop",
                "Boundary update may cause an infinite loop or skip the answer",
            )
    return None


def _mistake(error_type: str, confidence: float, location: str, summary: str) -> dict:
    return {
        "error_type": error_type,
        "confidence_score": confidence,
        "location": location,
        "concept_mapping": CONCEPT_MAPPING[error_type],
        "summary": summary,
    }
