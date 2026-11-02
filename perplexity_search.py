"""Web search via the Perplexity Search API (POST https://api.perplexity.ai/search).

The API key is read from the PERPLEXITY_API_KEY environment variable only.

CLI:  python perplexity_search.py "query one" ["query two" ...] [-n 5] [--country US]
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from collections.abc import Sequence
from dataclasses import asdict, dataclass
from typing import Any

import perplexity
from perplexity import Perplexity

MAX_QUERIES = 5
MAX_RESULTS_LIMIT = 20
# SDK retries 408/409/429/5xx with backoff, honoring Retry-After
DEFAULT_MAX_RETRIES = 4


class SearchError(Exception):
    """Raised for configuration problems and failed Search API calls."""


@dataclass(frozen=True)
class SearchResult:
    title: str
    url: str
    snippet: str
    date: str | None = None
    last_updated: str | None = None


def _make_client(max_retries: int) -> Perplexity:
    if not os.environ.get("PERPLEXITY_API_KEY"):
        raise SearchError(
            "PERPLEXITY_API_KEY is not set. Create a key in the API Console "
            "(https://console.perplexity.ai) and export it in your environment."
        )
    return Perplexity(max_retries=max_retries)


def dedupe_by_url(results: Sequence[SearchResult]) -> list[SearchResult]:
    """Drop repeated URLs, keeping the first (highest-ranked) occurrence."""
    seen: set[str] = set()
    unique: list[SearchResult] = []
    for result in results:
        if result.url in seen:
            continue
        seen.add(result.url)
        unique.append(result)
    return unique


def search(
    query: str | Sequence[str],
    *,
    max_results: int = 10,
    country: str | None = None,
    search_context_size: str | None = None,
    search_domain_filter: Sequence[str] | None = None,
    search_language_filter: Sequence[str] | None = None,
    search_recency_filter: str | None = None,
    search_after_date_filter: str | None = None,
    search_before_date_filter: str | None = None,
    client: Perplexity | None = None,
    max_retries: int = DEFAULT_MAX_RETRIES,
) -> list[SearchResult]:
    """Run one Search API request and return URL-deduplicated ranked results.

    ``query`` is one string or up to five strings (each processed independently).
    Dates use MM/DD/YYYY. Do not combine ``search_recency_filter`` with date bounds.
    """
    queries = [query] if isinstance(query, str) else list(query)
    if not queries or any(not q.strip() for q in queries):
        raise SearchError(
            "query must be a non-empty string or list of non-empty strings"
        )
    if len(queries) > MAX_QUERIES:
        raise SearchError(
            f"at most {MAX_QUERIES} queries per request, got {len(queries)}"
        )
    if not 1 <= max_results <= MAX_RESULTS_LIMIT:
        raise SearchError(f"max_results must be between 1 and {MAX_RESULTS_LIMIT}")

    params: dict[str, Any] = {
        "country": country,
        "search_context_size": search_context_size,
        "search_domain_filter": search_domain_filter,
        "search_language_filter": search_language_filter,
        "search_recency_filter": search_recency_filter,
        "search_after_date_filter": search_after_date_filter,
        "search_before_date_filter": search_before_date_filter,
    }
    params = {k: v for k, v in params.items() if v is not None}

    client = client or _make_client(max_retries)
    try:
        response = client.search.create(
            query=queries if len(queries) > 1 else queries[0],
            max_results=max_results,
            **params,
        )
    except perplexity.AuthenticationError as exc:
        raise SearchError(
            "Perplexity rejected the API key (401); check or rotate it"
        ) from exc
    except perplexity.RateLimitError as exc:
        raise SearchError(
            "Perplexity rate limit (429) persisted after retries"
        ) from exc
    except perplexity.APIStatusError as exc:
        raise SearchError(f"Perplexity Search API error {exc.status_code}") from exc
    except perplexity.APIConnectionError as exc:
        raise SearchError("could not reach the Perplexity Search API") from exc

    return dedupe_by_url(
        [
            SearchResult(r.title, r.url, r.snippet, r.date, r.last_updated)
            for r in response.results
        ]
    )


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Perplexity Search API")
    parser.add_argument("queries", nargs="+", help=f"1-{MAX_QUERIES} search queries")
    parser.add_argument("-n", "--max-results", type=int, default=10)
    parser.add_argument("--country", help="ISO 3166-1 alpha-2 code, e.g. US")
    parser.add_argument(
        "--domain", action="append", help="repeatable; prefix '-' to exclude"
    )
    args = parser.parse_args(argv)
    try:
        results = search(
            args.queries,
            max_results=args.max_results,
            country=args.country,
            search_domain_filter=args.domain,
        )
    except SearchError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    print(json.dumps([asdict(r) for r in results], ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
