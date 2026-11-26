# Code readability

In longer functions, separate logical sections with whitespace and add brief inline comments explaining each section's purpose where helpful. Prefer comments that clarify intent over narrating individual statements.

# Docstrings

- Document functions and methods in clear, human-friendly language, including their parameters and return values. Document properties where applicable, and include examples when they help explain usage.
- Before finishing a code change, review each new or changed function for its docstring and check longer functions for helpful comments and whitespace. Update documentation when behavior or signatures change.

# Testing

- Add tests for meaningful behaviour and regressions, not simply to mirror each code change. Prefer existing coverage when it already protects the behaviour that matters.
- Removing a UI element or other functionality does not automatically warrant a test asserting its absence. Add one when its absence is an important ongoing requirement, such as a security, privacy or accessibility constraint; otherwise, verify the removal directly and keep tests focused on the behaviour that remains.
- Use test-driven development when it helps clarify a bug or non-trivial behaviour: write a focused test, confirm it fails for the intended reason, make it pass, then refactor. Do not treat a failing-first test as mandatory for every change.
- Choose the smallest useful validation for the change, including existing tests and direct checks where appropriate. Avoid tests that duplicate coverage or merely restate implementation details.
