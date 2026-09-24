import os
import re
import git
from typing import List, Dict, Any, Optional
import tree_sitter_python as tspython
from tree_sitter import Language, Parser
from app.config import settings

PY_LANGUAGE = Language(tspython.language())

class CodeAnalysisResult:
    def __init__(self):
        self.functions: List[Dict[str, Any]] = []
        self.constants: List[Dict[str, Any]] = []


def parse_code_file(file_path: str) -> CodeAnalysisResult:
    """
    Parses a python code file using tree-sitter to find functions and numeric threshold constants.
    """
    result = CodeAnalysisResult()
    if not os.path.exists(file_path):
        return result

    with open(file_path, "r", encoding="utf-8") as f:
        code_text = f.read()

    code_bytes = code_text.encode("utf-8")
    lines = code_text.splitlines()
    parser = Parser(PY_LANGUAGE)
    tree = parser.parse(code_bytes)
    root = tree.root_node

    def visit(node):
        # Function definition
        if node.type == "function_definition":
            func_name_node = node.child_by_field_name("name")
            if func_name_node:
                func_name = code_bytes[func_name_node.start_byte:func_name_node.end_byte].decode("utf-8")
                start_line = node.start_point[0] + 1
                end_line = node.end_point[0] + 1
                snippet = "\n".join(lines[start_line - 1 : min(end_line, len(lines))])
                result.functions.append({
                    "function_name": func_name,
                    "file_path": file_path,
                    "start_line": start_line,
                    "end_line": end_line,
                    "source_snippet": snippet
                })

        # Assignment statement
        elif node.type == "assignment":
            left_node = node.child_by_field_name("left")
            right_node = node.child_by_field_name("right")

            if left_node and right_node:
                var_name = code_bytes[left_node.start_byte:left_node.end_byte].decode("utf-8").strip()
                val_text = code_bytes[right_node.start_byte:right_node.end_byte].decode("utf-8").strip()

                # Check if var_name looks like a threshold constant
                keywords = ["LIMIT", "THRESHOLD", "APPROVAL"]
                if any(kw in var_name.upper() for kw in keywords):
                    try:
                        threshold_val = int(val_text)
                        line_no = node.start_point[0] + 1
                        snippet = lines[line_no - 1] if line_no <= len(lines) else f"{var_name} = {val_text}"
                        result.constants.append({
                            "constant_name": var_name,
                            "threshold_value": threshold_val,
                            "file_path": file_path,
                            "line_number": line_no,
                            "source_snippet": snippet
                        })
                    except ValueError:
                        pass

        for child in node.children:
            visit(child)

    visit(root)
    return result


def find_last_commit_touching_constant(repo_path: str, file_rel_path: str, constant_name: str) -> Optional[Dict[str, Any]]:
    """
    Uses GitPython to find the last commit that modified the definition/assignment of constant_name.
    """
    try:
        repo = git.Repo(repo_path)
        commits = list(repo.iter_commits(paths=file_rel_path))
        
        target_commit = None
        # Pattern matching assignment to constant: e.g. CFO_APPROVAL_LIMIT = 1000000
        assign_pattern = re.compile(rf"^[+-]\s*{re.escape(constant_name)}\s*=", re.MULTILINE)

        # Walk newest commits to find which commit set/changed the assignment
        for commit in commits:
            diff_text = repo.git.show(commit.hexsha, "--", file_rel_path)
            if assign_pattern.search(diff_text):
                target_commit = commit
                break

        if target_commit is None and commits:
            target_commit = commits[-1]

        if target_commit:
            commit_date = target_commit.committed_datetime.strftime("%Y-%m-%d")
            return {
                "commit_hash": target_commit.hexsha,
                "author": str(target_commit.author),
                "date": commit_date,
                "message": target_commit.message.strip(),
                "file_path": file_rel_path
            }
    except Exception as e:
        print(f"Error checking git history for {constant_name}: {e}")

    return None


def analyze_repository(repo_dir: str = settings.REPO_DIR) -> Dict[str, Any]:
    """
    Performs full code analysis over the sample repository.
    """
    all_functions = []
    all_constants = []

    for root, _, files in os.walk(repo_dir):
        if ".git" in root:
            continue
        for f in files:
            if f.endswith(".py"):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, repo_dir)
                parsed = parse_code_file(full_path)
                
                for const in parsed.constants:
                    commit_info = find_last_commit_touching_constant(repo_dir, rel_path, const["constant_name"])
                    const["last_commit"] = commit_info
                    all_constants.append(const)

                for func in parsed.functions:
                    all_functions.append(func)

    return {
        "functions": all_functions,
        "constants": all_constants
    }
