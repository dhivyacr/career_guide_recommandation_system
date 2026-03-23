import re
from collections import Counter

import networkx as nx

try:
    from tree_sitter_languages import get_parser
except ImportError:  # pragma: no cover
    get_parser = None


LANGUAGE_MAP = {"python": "python", "java": "java", "cpp": "cpp"}


def parse_code(language: str, code: str) -> dict:
    parser_summary = {"available": False, "root_type": "unknown", "node_count": 0}
    if get_parser:
        try:
            parser = get_parser(LANGUAGE_MAP.get(language, language))
            tree = parser.parse(code.encode("utf-8"))
            parser_summary = {
                "available": True,
                "root_type": tree.root_node.type,
                "node_count": len(list(_walk_tree(tree.root_node))),
            }
        except Exception:
            parser_summary["error"] = "parser_fallback"
    return parser_summary


def build_cfg_summary(code: str) -> dict:
    graph = nx.DiGraph()
    lines = [line for line in code.splitlines() if line.strip()]
    for index, line in enumerate(lines, start=1):
        graph.add_node(index, label=line.strip())
        if index > 1:
            graph.add_edge(index - 1, index)
    branches = sum(
        1
        for line in lines
        if any(token in line for token in ("if", "else", "elif", "while", "for"))
    )
    return {
        "nodes": graph.number_of_nodes(),
        "edges": graph.number_of_edges(),
        "estimated_branches": branches,
    }


def extract_constructs(code: str) -> list[str]:
    constructs = []
    pattern_map = {
        "loops": r"\b(for|while)\b",
        "recursion": r"\bdef\s+(\w+).*[\s\S]*\1\s*\(",
        "array indexing": r"\[[^\]]+\]",
        "conditionals": r"\b(if|else|elif|switch)\b",
        "function calls": r"\w+\s*\(",
    }
    for name, pattern in pattern_map.items():
        if re.search(pattern, code):
            constructs.append(name)
    return constructs


def summarize_code(language: str, code: str) -> dict:
    return {
        "ast_summary": parse_code(language, code),
        "cfg_summary": build_cfg_summary(code),
        "constructs": extract_constructs(code),
        "token_frequencies": Counter(re.findall(r"[A-Za-z_]+", code)).most_common(8),
    }


def _walk_tree(node):
    yield node
    for child in node.children:
        yield from _walk_tree(child)
