import sys
from pathlib import Path
from types import SimpleNamespace

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import perplexity_search as ps


def _page(url, title="t", snippet="s"):
    return SimpleNamespace(
        title=title, url=url, snippet=snippet, date=None, last_updated=None
    )


class FakeClient:
    def __init__(self, pages):
        self.calls = []
        self.search = SimpleNamespace(create=self._create)
        self._pages = pages

    def _create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(results=self._pages)


def test_dedupes_by_url_keeping_first():
    client = FakeClient(
        [_page("https://a"), _page("https://b"), _page("https://a", "dup")]
    )
    results = ps.search(["q1", "q2"], client=client)
    assert [r.url for r in results] == ["https://a", "https://b"]
    assert results[0].title == "t"


def test_single_query_sent_as_string_and_params_forwarded():
    client = FakeClient([])
    ps.search("hello", max_results=3, country="US", client=client)
    assert client.calls == [{"query": "hello", "max_results": 3, "country": "US"}]


def test_multi_query_sent_as_list():
    client = FakeClient([])
    ps.search(["a", "b"], client=client)
    assert client.calls[0]["query"] == ["a", "b"]


@pytest.mark.parametrize(
    "kwargs",
    [
        {"query": []},
        {"query": " "},
        {"query": ["x"] * 6},
        {"query": "x", "max_results": 21},
    ],
)
def test_validation(kwargs):
    with pytest.raises(ps.SearchError):
        ps.search(client=FakeClient([]), **kwargs)


def test_missing_key(monkeypatch):
    monkeypatch.delenv("PERPLEXITY_API_KEY", raising=False)
    with pytest.raises(ps.SearchError, match="PERPLEXITY_API_KEY"):
        ps.search("x")
